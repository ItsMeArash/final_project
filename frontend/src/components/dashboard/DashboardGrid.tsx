'use client'

import { useState, useEffect, useCallback } from 'react'
import { Responsive, WidthProvider } from 'react-grid-layout/legacy'
import type { Layout, LayoutItem, ResponsiveLayouts } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

const ResponsiveGridLayout = WidthProvider(Responsive)

const LAYOUT_KEY = 'dashboard-layout'

const WIDGET_IDS = ['chat', 'weather', 'todos', 'notes'] as const

const defaultLayouts: ResponsiveLayouts = {
  lg: [
    { i: 'chat', x: 0, y: 0, w: 4, h: 2, minW: 2, minH: 1 },
    { i: 'weather', x: 4, y: 0, w: 4, h: 2, minW: 2, minH: 1 },
    { i: 'todos', x: 8, y: 0, w: 4, h: 2, minW: 2, minH: 1 },
    { i: 'notes', x: 0, y: 2, w: 6, h: 2, minW: 3, minH: 1 },
  ],
  md: [
    { i: 'chat', x: 0, y: 0, w: 6, h: 2, minW: 2, minH: 1 },
    { i: 'weather', x: 6, y: 0, w: 6, h: 2, minW: 2, minH: 1 },
    { i: 'todos', x: 0, y: 2, w: 6, h: 2, minW: 2, minH: 1 },
    { i: 'notes', x: 6, y: 2, w: 6, h: 2, minW: 2, minH: 1 },
  ],
  sm: [
    { i: 'chat', x: 0, y: 0, w: 6, h: 2, minW: 2, minH: 1 },
    { i: 'weather', x: 0, y: 2, w: 6, h: 2, minW: 2, minH: 1 },
    { i: 'todos', x: 0, y: 4, w: 6, h: 2, minW: 2, minH: 1 },
    { i: 'notes', x: 0, y: 6, w: 6, h: 2, minW: 2, minH: 1 },
  ],
}

function mergeLayouts(
  saved: ResponsiveLayouts | null,
  defaults: ResponsiveLayouts
): ResponsiveLayouts {
  if (!saved) return defaults

  const result: ResponsiveLayouts = {}
  const breakpoints = ['lg', 'md', 'sm'] as const

  for (const bp of breakpoints) {
    const defaultLayout = defaults[bp] ?? []
    const savedLayout = saved[bp] ?? []

    const savedIds = new Set(savedLayout.map((item) => item.i))

    const merged: LayoutItem[] = [...savedLayout]

    for (const item of defaultLayout) {
      if (!savedIds.has(item.i)) {
        merged.push(item)
      }
    }

    result[bp] = merged
  }

  return result
}

function loadLayouts(): ResponsiveLayouts | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(LAYOUT_KEY)
    if (!raw) return null
    return JSON.parse(raw) as ResponsiveLayouts
  } catch {
    return null
  }
}

function filterLayoutsByWidgets(
  layouts: ResponsiveLayouts,
  widgetIds: readonly string[]
): ResponsiveLayouts {
  const idSet = new Set(widgetIds)
  const result: ResponsiveLayouts = {}
  for (const [bp, layout] of Object.entries(layouts)) {
    if (Array.isArray(layout)) {
      result[bp as keyof ResponsiveLayouts] = layout.filter((item) =>
        idSet.has(item.i)
      )
    }
  }
  return result
}

function saveLayouts(layouts: ResponsiveLayouts) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LAYOUT_KEY, JSON.stringify(layouts))
  } catch {
    // ignore
  }
}

interface DashboardGridProps {
  children: Record<string, React.ReactNode>
  visibleWidgets?: readonly string[]
}

export function DashboardGrid({
  children,
  visibleWidgets = WIDGET_IDS,
}: DashboardGridProps) {
  const [layouts, setLayouts] = useState<ResponsiveLayouts>(() => {
    const merged = mergeLayouts(loadLayouts(), defaultLayouts)
    return filterLayoutsByWidgets(merged, visibleWidgets)
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLayoutChange = useCallback(
    (_layout: Layout, newLayouts: ResponsiveLayouts) => {
      setLayouts(newLayouts)
      saveLayouts(newLayouts)
    },
    []
  )

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleWidgets.map((id) => (
          <div key={id} className="h-40 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
    )
  }

  return (
    <div dir="ltr" className="min-w-0">
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
      breakpoints={{ lg: 1024, md: 768, sm: 480 }}
      cols={{ lg: 12, md: 12, sm: 6 }}
      rowHeight={80}
      margin={[16, 16]}
      containerPadding={[0, 0]}
      compactType="vertical"
      onLayoutChange={handleLayoutChange}
      draggableHandle=".drag-handle"
      isDraggable
      isResizable
      useCSSTransforms={false}
    >
      {visibleWidgets.map((id) => (
        <div key={id} className="h-full">
          {children[id]}
        </div>
      ))}
    </ResponsiveGridLayout>
    </div>
  )
}
