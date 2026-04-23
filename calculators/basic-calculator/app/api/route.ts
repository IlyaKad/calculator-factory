import { NextRequest, NextResponse } from 'next/server'
import { calculate, CalculatorInput } from '../../logic'

export async function POST(req: NextRequest) {
  try {
    const body: CalculatorInput = await req.json()
    const result = calculate(body)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Calculation failed' },
      { status: 400 }
    )
  }
}
