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

    // --- INICIO DEL NUEVO ALGORITMO DE DISEÑO DE ÁRBOL ---

    const positionedNodes = new Map<string, Node>()
    const levels = new Map<string, number>()
    const childrenMap = new Map<string, string[]>()
    const allNodeIds = new Set(nodeIds)

    // 1. Determinar la estructura del grafo: hijos y nodos raíz
    const childNodeIds = new Set<string>()
    Object.entries(graph).forEach(([parent, children]) => {
      childrenMap.set(parent, children)
      children.forEach((child) => childNodeIds.add(child))
    })

    const rootNodes = nodeIds.filter((id) => !childNodeIds.has(id))
    const mainRoot = startNode && allNodeIds.has(startNode) ? startNode : rootNodes[0] || nodeIds[0]

    if (!mainRoot) return { nodes: [], edges: [] }

    // 2. Calcular niveles (coordenada Y) usando BFS desde la raíz principal
    const bfsQueue: { nodeId: string; level: number }[] = [{ nodeId: mainRoot, level: 0 }]
    const visitedBfs = new Set<string>([mainRoot])
    levels.set(mainRoot, 0)

    let maxLevel = 0
    while (bfsQueue.length > 0) {
      const { nodeId, level } = bfsQueue.shift()!
      maxLevel = Math.max(maxLevel, level)
      const children = childrenMap.get(nodeId) || []
      children.forEach((child) => {
        if (!visitedBfs.has(child)) {
          visitedBfs.add(child)
          levels.set(child, level + 1)
          bfsQueue.push({ nodeId: child, level: level + 1 })
        }
      })
    }

    // 3. Obtener recorrido post-orden para posicionar hijos antes que padres
    const postOrder: string[] = []
    const visitedDfs = new Set<string>()
    const buildPostOrder = (nodeId: string) => {
      visitedDfs.add(nodeId)
      const children = childrenMap.get(nodeId) || []
      children.forEach((child) => {
        if (!visitedDfs.has(child)) buildPostOrder(child)
      })
      postOrder.push(nodeId)
    }

    // Construir el árbol desde la raíz principal y luego los nodos desconectados
    if (allNodeIds.has(mainRoot)) buildPostOrder(mainRoot);
    allNodeIds.forEach(id => {
      if (!visitedDfs.has(id)) buildPostOrder(id);
    });

    // 4. Asignar posiciones X iniciales a los nodos
    const leafXCounter = { val: 0 }
    const hSpacing = 70 // Espacio horizontal mínimo entre nodos hoja
    const vSpacing = height / (maxLevel + 2) // Espacio vertical entre niveles

    postOrder.forEach((nodeId) => {
      const children = childrenMap.get(nodeId) || []
      const y = (levels.get(nodeId)! + 1) * vSpacing
      let x = 0

      const positionedChildren = children.map((c) => positionedNodes.get(c)).filter(Boolean) as Node[]

      if (positionedChildren.length === 0) {
        // Es un nodo hoja, se le asigna el siguiente espacio disponible
        x = leafXCounter.val
        leafXCounter.val += hSpacing
      } else {
        // Es un nodo padre, su X es el promedio del X de sus hijos
        const childrenXSum = positionedChildren.reduce((acc, child) => acc + child.x, 0)
        x = childrenXSum / positionedChildren.length
      }
      positionedNodes.set(nodeId, { id: nodeId, x, y })
    })

    // 5. Centrar el grafo completo en el canvas
    const allX = Array.from(positionedNodes.values()).map((n) => n.x)
    const minX = Math.min(...allX)
    const maxX = Math.max(...allX)
    const graphWidth = maxX - minX
    const xOffset = graphWidth > 0 ? (width - graphWidth) / 2 - minX : width / 2 - (positionedNodes.get(mainRoot)?.x || 0)

    const finalNodes: Node[] = Array.from(positionedNodes.values()).map((node) => ({
      ...node,
      x: node.x + xOffset,
    }))

    // --- FIN DEL NUEVO ALGORITMO ---

    const finalEdges: Edge[] = []
    Object.entries(graph).forEach(([from, connections]) => {
      connections.forEach((to) => {
        finalEdges.push({ from, to })
      })
    })

    return { nodes: finalNodes, edges: finalEdges }
  }, [graph, startNode, width, height])

  const getNodeColor = (nodeId: string) => {
    if (foundNodes.includes(nodeId)) return "#10b981"
    if (currentNode === nodeId) return "#3b82f6"
    if (visitedNodes.includes(nodeId)) return "#313131ff"
    if (queueNodes.includes(nodeId) || stackNodes.includes(nodeId)) return "#f59e0b"
    if (startNode === nodeId) return "#059669"
    if (goalNodes.includes(nodeId)) return "#dc2626"
    return "#a8a8a8ff"
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
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#9ca3af" />
          </marker>
        </defs>
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
      {/* ... Tu leyenda no necesita cambios ... */}
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