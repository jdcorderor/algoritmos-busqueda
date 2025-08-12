"use client"

import { useMemo } from "react"

interface Node {
  id: string
  x: number
  y: number
}

interface Edge {
  from: string
  to: string
}

interface GraphVisualizationProps {
  graph: { [key: string]: string[] }
  startNode?: string
  goalNodes?: string[]
  currentNode?: string
  visitedNodes?: string[]
  queueNodes?: string[]
  stackNodes?: string[]
  foundNodes?: string[]
  width?: number
  height?: number
}

export function GraphVisualization({
  graph,
  startNode,
  goalNodes = [],
  currentNode,
  visitedNodes = [],
  queueNodes = [],
  stackNodes = [],
  foundNodes = [],
  width = 600,
  height = 400,
}: GraphVisualizationProps) {
  const { nodes, edges } = useMemo(() => {
    const nodeIds = Object.keys(graph)
    if (nodeIds.length === 0) return { nodes: [], edges: [] }

    // Crear posiciones para los nodos usando un layout jerárquico
    const nodes: Node[] = []
    const edges: Edge[] = []

    // Función para calcular niveles del árbol
    const calculateLevels = (startNodeId: string) => {
      const levels: { [level: number]: string[] } = {}
      const visited = new Set<string>()
      const queue: { node: string; level: number }[] = [{ node: startNodeId, level: 0 }]

      while (queue.length > 0) {
        const { node, level } = queue.shift()!

        if (visited.has(node)) continue
        visited.add(node)

        if (!levels[level]) levels[level] = []
        levels[level].push(node)

        const children = graph[node] || []
        children.forEach((child) => {
          if (!visited.has(child)) {
            queue.push({ node: child, level: level + 1 })
          }
        })
      }

      // Agregar nodos no visitados en el último nivel
      const unvisited = nodeIds.filter((id) => !visited.has(id))
      if (unvisited.length > 0) {
        const maxLevel = Math.max(...Object.keys(levels).map(Number))
        if (!levels[maxLevel + 1]) levels[maxLevel + 1] = []
        levels[maxLevel + 1].push(...unvisited)
      }

      return levels
    }

    const levels = calculateLevels(startNode || nodeIds[0])
    const maxLevel = Math.max(...Object.keys(levels).map(Number))

    // Posicionar nodos
    Object.entries(levels).forEach(([levelStr, levelNodes]) => {
      const level = Number.parseInt(levelStr)
      const y = (height / (maxLevel + 1)) * (level + 0.5)

      levelNodes.forEach((nodeId, index) => {
        const x = (width / (levelNodes.length + 1)) * (index + 1)
        nodes.push({ id: nodeId, x, y })
      })
    })

    // Crear aristas
    Object.entries(graph).forEach(([from, connections]) => {
      connections.forEach((to) => {
        edges.push({ from, to })
      })
    })

    return { nodes, edges }
  }, [graph, startNode, width, height])

  const getNodeColor = (nodeId: string) => {
    if (foundNodes.includes(nodeId)) return "#10b981" // verde para encontrados
    if (currentNode === nodeId) return "#3b82f6" // azul para nodo actual
    if (visitedNodes.includes(nodeId)) return "#313131ff" // gris para visitados
    if (queueNodes.includes(nodeId) || stackNodes.includes(nodeId)) return "#f59e0b" // amarillo para en cola/pila
    if (startNode === nodeId) return "#059669" // verde oscuro para inicial
    if (goalNodes.includes(nodeId)) return "#dc2626" // rojo para meta
    return "#a8a8a8ff" // gris claro por defecto
  }

  const getNodeStroke = (nodeId: string) => {
    if (goalNodes.includes(nodeId)) return "#b91c1c"
    if (currentNode === nodeId) return "#1d4ed8"
    if (startNode === nodeId) return "#047857"
    return "#9ca3af"
  }

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No hay nodos para visualizar</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg bg-white">
      <svg width={width} height={height} className="w-full h-auto">
        {/* Renderizar aristas */}
        {edges.map((edge, index) => {
          const fromNode = nodes.find((n) => n.id === edge.from)
          const toNode = nodes.find((n) => n.id === edge.to)

          if (!fromNode || !toNode) return null

          return (
            <line
              key={index}
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              stroke="#9ca3af"
              strokeWidth="2"
              markerEnd="url(#arrowhead)"
            />
          )
        })}

        {/* Definir marcador de flecha */}
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#9ca3af" />
          </marker>
        </defs>

        {/* Renderizar nodos */}
        {nodes.map((node) => (
          <g key={node.id}>
            <circle
              cx={node.x}
              cy={node.y}
              r="20"
              fill={getNodeColor(node.id)}
              stroke={getNodeStroke(node.id)}
              strokeWidth="3"
            />
            <text
              x={node.x}
              y={node.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-sm font-bold fill-white"
            >
              {node.id}
            </text>
          </g>
        ))}
      </svg>

      {/* Leyenda */}
      <div className="p-3 border-t bg-gray-50 text-xs">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-700"></div>
            <span>Inicial</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-600"></div>
            <span>Meta</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Actual</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-gray-800"></div>
            <span>Visitado</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>En Cola/Pila</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Encontrado</span>
          </div>
        </div>
      </div>
    </div>
  )
}
