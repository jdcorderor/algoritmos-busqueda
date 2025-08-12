"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Target, Play } from "lucide-react"
import { GraphVisualization } from "./graph-visualization"

interface GraphBuilderProps {
  graph: { [key: string]: string[] }
  setGraph: (graph: { [key: string]: string[] }) => void
  startNode: string
  setStartNode: (node: string) => void
  goalNodes: string[]
  setGoalNodes: (nodes: string[]) => void
}

export function GraphBuilder({ graph, setGraph, startNode, setStartNode, goalNodes, setGoalNodes }: GraphBuilderProps) {
  const [newNode, setNewNode] = useState("")
  const [fromNode, setFromNode] = useState("")
  const [toNode, setToNode] = useState("")

  const addNode = () => {
    if (newNode && !graph[newNode]) {
      setGraph({ ...graph, [newNode]: [] })
      setNewNode("")
    }
  }

  const addEdge = () => {
    if (fromNode && toNode && graph[fromNode] && graph[toNode]) {
      const newGraph = { ...graph }
      if (!newGraph[fromNode].includes(toNode)) {
        newGraph[fromNode].push(toNode)
      }
      setGraph(newGraph)
      setFromNode("")
      setToNode("")
    }
  }

  const removeNode = (node: string) => {
    const newGraph = { ...graph }
    delete newGraph[node]

    // Remove references to this node from other nodes
    Object.keys(newGraph).forEach((key) => {
      newGraph[key] = newGraph[key].filter((n) => n !== node)
    })

    setGraph(newGraph)

    if (startNode === node) setStartNode("")
    setGoalNodes(goalNodes.filter((n) => n !== node))
  }

  const toggleGoalNode = (node: string) => {
    if (goalNodes.includes(node)) {
      setGoalNodes(goalNodes.filter((n) => n !== node))
    } else {
      setGoalNodes([...goalNodes, node])
    }
  }

  const loadExampleGraph = () => {
    const exampleGraph = {
      A: ["D", "F", "G"],
      D: ["H", "J"],
      F: ["C", "E"],
      G: [],
      H: ["B"],
      J: ["K"],
      C: ["Z", "W"],
      E: [],
      B: [],
      K: ["L"],
      Z: [],
      W: [],
      L: [],
    }
    setGraph(exampleGraph)
    setStartNode("A")
    setGoalNodes(["B", "L"])
  }

  const nodes = Object.keys(graph)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Agregar nodos</CardTitle>
            <CardDescription>Crea los nodos del grafo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Nombre del nodo (ej: A, B, C)"
                value={newNode}
                onChange={(e) => setNewNode(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === "Enter" && addNode()}
              />
              <Button onClick={addNode} disabled={!newNode}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <Button onClick={loadExampleGraph} variant="outline" className="w-full bg-transparent">
              <Play className="w-4 h-4 mr-2" />
              Cargar ejemplo
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agregar aristas</CardTitle>
            <CardDescription>Conecta los nodos entre sí</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-2">
                <Label>Desde</Label>
                <select
                  className="w-full p-2 border rounded"
                  value={fromNode}
                  onChange={(e) => setFromNode(e.target.value)}
                >
                  <option value="">Seleccionar nodo</option>
                  {nodes.map((node) => (
                    <option key={node} value={node}>
                      {node}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col space-y-2">
                <Label>Hacia</Label>
                <select
                  className="w-full p-2 border rounded"
                  value={toNode}
                  onChange={(e) => setToNode(e.target.value)}
                >
                  <option value="">Seleccionar nodo</option>
                  {nodes.map((node) => (
                    <option key={node} value={node}>
                      {node}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Button onClick={addEdge} disabled={!fromNode || !toNode} className="w-full">
              Agregar arista
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuración de búsqueda</CardTitle>
            <CardDescription>Define el nodo inicial y los nodos meta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Label>Nodo inicial</Label>
              <select
                className="w-full p-2 border rounded"
                value={startNode}
                onChange={(e) => setStartNode(e.target.value)}
              >
                <option value="">Seleccionar nodo inicial</option>
                {nodes.map((node) => (
                  <option key={node} value={node}>
                    {node}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col space-y-2">
              <Label>Nodos meta</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {goalNodes.map((node) => (
                  <Badge key={node} variant="secondary" className="cursor-pointer">
                    <Target className="w-3 h-3 mr-1" />
                    {node}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Visualización del grafo</CardTitle>
            <CardDescription>Representación gráfica del grafo construido</CardDescription>
          </CardHeader>
          <CardContent className="p-2">
            <GraphVisualization graph={graph} startNode={startNode} goalNodes={goalNodes} width={600} height={400} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lista de nodos</CardTitle>
            <CardDescription>Nodos y aristas del grafo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {nodes.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No hay nodos en el grafo. Agrega algunos nodos para comenzar.
                </p>
              ) : (
                nodes.map((node) => (
                  <div key={node} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold text-lg ${
                            startNode === node
                              ? "text-green-600"
                              : goalNodes.includes(node)
                                ? "text-red-600"
                                : "text-gray-800"
                          }`}
                        >
                          {node}
                        </span>
                        {startNode === node && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Inicial
                          </Badge>
                        )}
                        {goalNodes.includes(node) && (
                          <Badge variant="outline" className="text-red-600 border-red-600">
                            Meta
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => toggleGoalNode(node)}>
                          <Target className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => removeNode(node)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Hijos: </span>
                      {graph[node].length > 0 ? (
                        <span className="text-sm">{graph[node].join(", ")}</span>
                      ) : (
                        <span className="text-sm text-gray-400">Ninguno</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
