"use client"

import { useState } from "react"
import { GraphBuilder } from "@/components/graph-builder"
import { AlgorithmVisualizer } from "@/components/algorithm-visualizer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function GraphSearchApp() {
  const [graph, setGraph] = useState<{ [key: string]: string[] }>({})
  const [startNode, setStartNode] = useState<string>("")
  const [goalNodes, setGoalNodes] = useState<string[]>([])

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-100 rounded-lg p-4 my-4">
          <h1 className="text-2xl text-center font-bold">Algoritmos de Búsqueda (BFS, DFS, Backtrack)</h1>
        </div>
        <Tabs defaultValue="builder" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="builder">Constructor de Grafos</TabsTrigger>
            <TabsTrigger value="visualizer">Visualizador de Algoritmos</TabsTrigger>
          </TabsList>

          <TabsContent value="builder">
            <GraphBuilder
              graph={graph}
              setGraph={setGraph}
              startNode={startNode}
              setStartNode={setStartNode}
              goalNodes={goalNodes}
              setGoalNodes={setGoalNodes}
            />
          </TabsContent>

          <TabsContent value="visualizer">
            <AlgorithmVisualizer graph={graph} startNode={startNode} goalNodes={goalNodes} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
