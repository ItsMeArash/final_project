package websocket

import (
	"admin-dashboard/internal/database"
	"admin-dashboard/internal/models"
	"encoding/json"
	"log"
	"time"

	"github.com/gorilla/websocket"
)

const (
	writeWait      = 10 * time.Second
	pongWait       = 60 * time.Second
	pingPeriod     = (pongWait * 9) / 10
	maxMessageSize = 512 * 1024
)

func (c *Client) ReadPump() {
	defer func() {
		c.Hub.Unregister(c)
		c.Conn.Close()
	}()

	c.Conn.SetReadDeadline(time.Now().Add(pongWait))
	c.Conn.SetReadLimit(maxMessageSize)
	c.Conn.SetPongHandler(func(string) error {
		c.Conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, messageBytes, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			break
		}

		var message Message
		if err := json.Unmarshal(messageBytes, &message); err != nil {
			log.Printf("Error unmarshaling message: %v", err)
			continue
		}

		message.SenderID = c.UserID
		message.Timestamp = time.Now().Format(time.RFC3339)

		// Forward typing status to receiver without saving
		if message.Type == "typing" || message.Type == "typing_stop" {
			if message.ReceiverID != nil {
				typingPayload := map[string]interface{}{
					"type":        message.Type,
					"sender_id":   c.UserID.String(),
					"receiver_id": message.ReceiverID.String(),
					"username":    c.Username,
				}
				messageBytes, _ = json.Marshal(typingPayload)
				message.Raw = messageBytes
				c.Hub.Broadcast(message)
			}
			continue
		}

		// Save message to database if it's a chat message
		if message.Type == "chat" {
			chatMessage := models.ChatMessage{
				SenderID:   c.UserID,
				ReceiverID: message.ReceiverID,
				Message:    message.Content,
			}

			if err := database.DB.Create(&chatMessage).Error; err != nil {
				log.Printf("Error saving message to database: %v", err)
			}

			// Build broadcast payload with DB id for deduplication
			broadcastPayload := map[string]interface{}{
				"type":       "chat",
				"id":         chatMessage.ID.String(),
				"sender_id":  chatMessage.SenderID.String(),
				"message":    chatMessage.Message,
				"created_at": chatMessage.CreatedAt.Format("2006-01-02T15:04:05.000Z"),
				"sender": map[string]interface{}{
					"id":       c.UserID.String(),
					"username": c.Username,
				},
			}
			if chatMessage.ReceiverID != nil {
				broadcastPayload["receiver_id"] = chatMessage.ReceiverID.String()
			}
			messageBytes, _ = json.Marshal(broadcastPayload)
		}

		message.Raw = messageBytes

		// Broadcast message
		c.Hub.Broadcast(message)
	}
}

func (c *Client) WritePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.Send:
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.Conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			// Add queued messages
			n := len(c.Send)
			for i := 0; i < n; i++ {
				w.Write([]byte{'\n'})
				w.Write(<-c.Send)
			}

			if err := w.Close(); err != nil {
				return
			}

		case <-ticker.C:
			c.Conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
