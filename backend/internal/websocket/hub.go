package websocket

import (
	"encoding/json"
	"log"
	"sync"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

type Client struct {
	Hub      *Hub
	Conn     *websocket.Conn
	UserID   uuid.UUID
	Username string
	Send     chan []byte
}

type Hub struct {
	clients    map[*Client]bool
	broadcast  chan Message
	register   chan *Client
	unregister chan *Client
	mu         sync.RWMutex
}

type Message struct {
	Type      string          `json:"type"`
	SenderID  uuid.UUID       `json:"sender_id"`
	ReceiverID *uuid.UUID     `json:"receiver_id,omitempty"`
	Content   string          `json:"content"`
	Timestamp string          `json:"timestamp"`
	Raw       json.RawMessage `json:"-"`
}

func NewHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		broadcast:  make(chan Message, 256),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

func (h *Hub) Register(client *Client) {
	h.register <- client
}

func (h *Hub) Unregister(client *Client) {
	h.unregister <- client
}

func (h *Hub) Broadcast(message Message) {
	h.broadcast <- message
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			h.mu.Unlock()
			log.Printf("Client registered: %s", client.Username)

			// Broadcast user online status
			h.broadcastOnlineUsers()

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.Send)
			}
			h.mu.Unlock()
			log.Printf("Client unregistered: %s", client.Username)

			// Broadcast user offline status
			h.broadcastOnlineUsers()

		case message := <-h.broadcast:
			h.mu.RLock()
			for client := range h.clients {
				// Send to specific receiver or broadcast to all
				if message.ReceiverID != nil {
					if client.UserID == *message.ReceiverID || client.UserID == message.SenderID {
						select {
						case client.Send <- message.Raw:
						default:
							close(client.Send)
							delete(h.clients, client)
						}
					}
				} else {
					// Broadcast to all except sender
					if client.UserID != message.SenderID {
						select {
						case client.Send <- message.Raw:
						default:
							close(client.Send)
							delete(h.clients, client)
						}
					}
				}
			}
			h.mu.RUnlock()
		}
	}
}

func (h *Hub) GetOnlineUsers() []OnlineUser {
	h.mu.RLock()
	defer h.mu.RUnlock()

	seen := make(map[uuid.UUID]bool)
	users := make([]OnlineUser, 0, len(h.clients))
	for client := range h.clients {
		if seen[client.UserID] {
			continue
		}
		seen[client.UserID] = true
		users = append(users, OnlineUser{
			ID:       client.UserID,
			Username: client.Username,
		})
	}

	return users
}

func (h *Hub) broadcastOnlineUsers() {
	users := h.GetOnlineUsers()
	message := Message{
		Type: "online_users",
	}

	data := map[string]interface{}{
		"type":  "online_users",
		"users": users,
	}

	raw, _ := json.Marshal(data)
	message.Raw = raw

	// Broadcast to all clients
	h.mu.RLock()
	for client := range h.clients {
		select {
		case client.Send <- raw:
		default:
			close(client.Send)
			delete(h.clients, client)
		}
	}
	h.mu.RUnlock()
}

type OnlineUser struct {
	ID       uuid.UUID `json:"id"`
	Username string    `json:"username"`
}
