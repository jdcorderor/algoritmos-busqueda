"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, RotateCcw, ChevronRight, ChevronLeft } from "lucide-react"
import { GraphVisualization } from "./graph-visualization"

interface AlgorithmVisualizerProps {
  graph: { [key: string]: string[] }
  startNode: string
  goalNodes: string[]
}

interface SearchStep {
  step: number
  algorithm: string
  action: string
  currentNode: string
  queue: string[]
  stack: string[]
  visited: string[]
  path: string[]
  found: string[]
  description: string
}

export function AlgorithmVisualizer({ graph, startNode, goalNodes }: AlgorithmVisualizerProps) {
  const [algorithm, setAlgorithm] = useState<"bfs" | "dfs" | "backtrack">("bfs")
  const [steps, setSteps] = useState<SearchStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1000)

  const algorithmNames = {
    bfs: "Búsqueda en Amplitud (BFS)",
    dfs: "Búsqueda en Profundidad (DFS)",
    backtrack: "Búsqueda en Retroceso",
  }

  const generateBFSSteps = (): SearchStep[] => {
    if (!startNode || Object.keys(graph).length === 0) return []

    const steps: SearchStep[] = []
    const queue: string[] = [startNode]
    const visited: string[] = []
    const found: string[] = []
    let stepCount = 0

    steps.push({
      step: stepCount++,
      algorithm: "BFS",
      action: "Inicializar",
      currentNode: startNode,
      queue: [...queue],
      stack: [],
      visited: [...visited],
      path: [startNode],
      found: [...found],
      description: `Inicializar cola con nodo inicial: ${startNode}`,
    })

    while (queue.length > 0 && found.length < goalNodes.length) {
      const current = queue.shift()!
      visited.push(current)

      steps.push({
        step: stepCount++,
        algorithm: "BFS",
        action: "Visitar",
        currentNode: current,
        queue: [...queue],
        stack: [],
        visited: [...visited],
        path: [current],
        found: [...found],
        description: `Visitando nodo: ${current}`,
      })

      if (goalNodes.includes(current) && !found.includes(current)) {
        found.push(current)
        steps.push({
          step: stepCount++,
          algorithm: "BFS",
          action: "Meta encontrada",
          currentNode: current,
          queue: [...queue],
          stack: [],
          visited: [...visited],
          path: [current],
          found: [...found],
          description: `¡Nodo meta encontrado: ${current}! ${found.length === goalNodes.length ? "Búsqueda completada." : "Continuando búsqueda..."}`,
        })

        if (found.length === goalNodes.length) break
      }

      const neighbors = graph[current] || []
      for (const neighbor of neighbors) {
        if (!visited.includes(neighbor) && !queue.includes(neighbor)) {
          queue.push(neighbor)
          steps.push({
            step: stepCount++,
            algorithm: "BFS",
            action: "Agregar a cola",
            currentNode: current,
            queue: [...queue],
            stack: [],
            visited: [...visited],
            path: [current, neighbor],
            found: [...found],
            description: `Agregando ${neighbor} a la cola desde ${current}`,
          })
        }
      }
    }

    return steps
  }

  const generateDFSSteps = (): SearchStep[] => {
    if (!startNode || Object.keys(graph).length === 0) return []

    const steps: SearchStep[] = []
    const stack: string[] = [startNode]
    const visited: string[] = []
    const found: string[] = []
    let stepCount = 0

    steps.push({
      step: stepCount++,
      algorithm: "DFS",
      action: "Inicializar",
      currentNode: startNode,
      queue: [],
      stack: [...stack],
      visited: [...visited],
      path: [startNode],
      found: [...found],
      description: `Inicializar pila con nodo inicial: ${startNode}`,
    })

    while (stack.length > 0 && found.length < goalNodes.length) {
      const current = stack.pop()!

      if (visited.includes(current)) continue

      visited.push(current)

      steps.push({
        step: stepCount++,
        algorithm: "DFS",
        action: "Visitar",
        currentNode: current,
        queue: [],
        stack: [...stack],
        visited: [...visited],
        path: [current],
        found: [...found],
        description: `Visitando nodo: ${current}`,
      })

      if (goalNodes.includes(current) && !found.includes(current)) {
        found.push(current)
        steps.push({
          step: stepCount++,
          algorithm: "DFS",
          action: "Meta encontrada",
          currentNode: current,
          queue: [],
          stack: [...stack],
          visited: [...visited],
          path: [current],
          found: [...found],
          description: `¡Nodo meta encontrado: ${current}! ${found.length === goalNodes.length ? "Búsqueda completada." : "Continuando búsqueda..."}`,
        })

        if (found.length === goalNodes.length) break
      }

      const neighbors = (graph[current] || []).slice().reverse()
      for (const neighbor of neighbors) {
        if (!visited.includes(neighbor)) {
          stack.push(neighbor)
          steps.push({
            step: stepCount++,
            algorithm: "DFS",
            action: "Agregar a pila",
            currentNode: current,
            queue: [],
            stack: [...stack],
            visited: [...visited],
            path: [current, neighbor],
            found: [...found],
            description: `Agregando ${neighbor} a la pila desde ${current}`,
          })
        }
      }
    }

    return steps
  }

  const generateBacktrackSteps = (): SearchStep[] => {
    if (!startNode || Object.keys(graph).length === 0) return []

    const steps: SearchStep[] = []
    const found: string[] = []
    const permanentVisited: Set<string> = new Set()
    let stepCount = 0

    const getCombinedVisited = (visited: string[]): string[] => {
      const combined = new Set([...visited, ...permanentVisited])
      return Array.from(combined)
    }

    const backtrack = (current: string, path: string[], visited: string[], depth: number): boolean => {
      if (depth > 8) {
        steps.push({
          step: stepCount++,
          algorithm: "Backtrack",
          action: "Límite de profundidad",
          currentNode: current,
          queue: [],
          stack: [],
          visited: getCombinedVisited(visited),
          path: [...path],
          found: [...found],
          description: `Límite de profundidad alcanzado en ${current} (profundidad ${depth})`,
        })
        return false
      }

      visited.push(current)
      path.push(current)

      steps.push({
        step: stepCount++,
        algorithm: "Backtrack",
        action: "Visitar",
        currentNode: current,
        queue: [],
        stack: [],
        visited: getCombinedVisited(visited),
        path: [...path],
        found: [...found],
        description: `Visitando nodo: ${current} (profundidad ${depth})`,
      })

      if (goalNodes.includes(current) && !found.includes(current)) {
        found.push(current)
        path.forEach(node => permanentVisited.add(node))

        steps.push({
          step: stepCount++,
          algorithm: "Backtrack",
          action: "Meta encontrada",
          currentNode: current,
          queue: [],
          stack: [],
          visited: getCombinedVisited(visited),
          path: [...path],
          found: [...found],
          description: `¡Nodo meta encontrado: ${current}! ${found.length === goalNodes.length ? "Búsqueda completada." : "Continuando búsqueda..."}`,
        })

        if (found.length === goalNodes.length) return true
      }

      const neighbors = graph[current] || []
      for (const neighbor of neighbors) {
        if (!visited.includes(neighbor) && !permanentVisited.has(neighbor)) {
          if (backtrack(neighbor, [...path], [...visited], depth + 1)) {
            return true
          }
        }
      }

      steps.push({
        step: stepCount++,
        algorithm: "Backtrack",
        action: "Retroceder",
        currentNode: current,
        queue: [],
        stack: [],
        visited: getCombinedVisited(visited),
        path: path.slice(0, -1),
        found: [...found],
        description: `Retrocediendo desde ${current}, sin más opciones`,
      })

      return false
    }

    backtrack(startNode, [], [], 0)
    return steps
  }

  const runAlgorithm = () => {
    let newSteps: SearchStep[] = []

    switch (algorithm) {
      case "bfs":
        newSteps = generateBFSSteps()
        break
      case "dfs":
        newSteps = generateDFSSteps()
        break
      case "backtrack":
        newSteps = generateBacktrackSteps()
        break
    }

    setSteps(newSteps)
    setCurrentStep(0)
  }

  const reset = () => {
    setSteps([])
    setCurrentStep(0)
    setIsPlaying(false)
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying && currentStep < steps.length - 1) {
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, speed)
    }
    return () => clearInterval(interval)
  }, [isPlaying, currentStep, steps.length, speed])

  const currentStepData = steps[currentStep]

  if (!startNode || Object.keys(graph).length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-gray-500">
            Configura un grafo con nodo inicial y nodos meta en la pestaña "Constructor de Grafos"
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Configuración del algoritmo</CardTitle>
          <CardDescription>
            Nodo inicial: <Badge variant="outline">{startNode}</Badge> | Nodos meta:{" "}
            {goalNodes.map((node) => (
              <Badge key={node} variant="outline" className="ml-1">
                {node}
              </Badge>
            ))}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(["bfs", "dfs", "backtrack"] as const).map((alg) => (
              <Button key={alg} variant={algorithm === alg ? "default" : "outline"} onClick={() => setAlgorithm(alg)}>
                {algorithmNames[alg]}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            <Button onClick={runAlgorithm}>
              <Play className="w-4 h-4 mr-2" />
              Ejecutar
            </Button>
            <Button onClick={reset} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reiniciar
            </Button>
          </div>
        </CardContent>
      </Card>

      {steps.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Controles de visualización</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Button onClick={prevStep} disabled={currentStep === 0} size="sm">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button onClick={togglePlay} size="sm">
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button onClick={nextStep} disabled={currentStep >= steps.length - 1} size="sm">
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <span className="text-sm text-gray-600 ml-4">
                  Paso {currentStep + 1} de {steps.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm">Velocidad:</label>
                <input
                  type="range"
                  min="200"
                  max="2000"
                  step="200"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-32"
                />
                <span className="text-sm text-gray-600">{speed}ms</span>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">          
            <Card>
              <CardHeader>
                <CardTitle>Visualización del grafo</CardTitle>
                <CardDescription>Estado actual del algoritmo de búsqueda</CardDescription>
              </CardHeader>
              <CardContent className="p-2">
                <GraphVisualization
                  graph={graph}
                  startNode={startNode}
                  goalNodes={goalNodes}
                  currentNode={currentStepData?.currentNode}
                  visitedNodes={currentStepData?.visited || []}
                  queueNodes={currentStepData?.queue || []}
                  stackNodes={currentStepData?.stack || []}
                  foundNodes={currentStepData?.found || []}
                  width={600}
                  height={350}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Estado actual</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentStepData && (
                  <>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="font-medium text-blue-900">{currentStepData.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Nodo actual</h4>
                        <Badge variant="default" className="text-lg px-3 py-1">
                          {currentStepData.currentNode}
                        </Badge>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Acción</h4>
                        <Badge variant="outline">{currentStepData.action}</Badge>
                      </div>
                    </div>

                    {currentStepData.queue.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Cola (BFS)</h4>
                        <div className="flex gap-1">
                          {currentStepData.queue.map((node, idx) => (
                            <Badge key={idx} variant="secondary">
                              {node}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {currentStepData.stack.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Pila (DFS)</h4>
                        <div className="flex gap-1">
                          {currentStepData.stack.map((node, idx) => (
                            <Badge key={idx} variant="secondary">
                              {node}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium mb-2">Nodos visitados</h4>
                      <div className="flex flex-wrap gap-1">
                        {currentStepData.visited.map((node, idx) => (
                          <Badge key={idx} variant="outline">
                            {node}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {currentStepData.found.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Nodos meta encontrados</h4>
                        <div className="flex gap-1">
                          {currentStepData.found.map((node, idx) => (
                            <Badge key={idx} className="bg-green-100 text-green-800">
                              {node}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
