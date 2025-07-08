import { type NextRequest, NextResponse } from "next/server"
import { copilotOrchestrator } from "@/services/copilot-orchestrator"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")

  try {
    switch (action) {
      case "analyze":
        const analysis = await copilotOrchestrator.analyzeProject()
        return NextResponse.json({ success: true, analysis })

      case "health":
        const health = await copilotOrchestrator.checkProjectHealth()
        return NextResponse.json({ success: true, health })

      case "roadmap":
        const roadmap = await copilotOrchestrator.updateRoadmap()
        return NextResponse.json({ success: true, roadmap })

      case "report":
        const reportType = searchParams.get("type") as "daily" | "weekly" | "migration" | "health"
        const report = await copilotOrchestrator.generateReport(reportType || "daily")
        return NextResponse.json({ success: true, report })

      default:
        return NextResponse.json({ error: "Ação não especificada" }, { status: 400 })
    }
  } catch (error) {
    console.error("Erro no Copilot API:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case "generate-code":
        const codeResult = await copilotOrchestrator.generateCode(data)
        return NextResponse.json({ success: true, result: codeResult })

      case "refactor":
        const refactorSuggestions = await copilotOrchestrator.suggestRefactoring(data.filePath)
        return NextResponse.json({ success: true, suggestions: refactorSuggestions })

      case "execute-task":
        const executionResult = await copilotOrchestrator.executeTask(data.taskId)
        return NextResponse.json({ success: true, result: executionResult })

      default:
        return NextResponse.json({ error: "Ação não suportada" }, { status: 400 })
    }
  } catch (error) {
    console.error("Erro no Copilot POST:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
