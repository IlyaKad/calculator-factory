import { NextRequest, NextResponse } from 'next/server'
import {
  calculateBasicCalculator,
  BasicCalculatorInput,
} from '../../logic'

export async function POST(req: NextRequest) {
  try {
    const body: BasicCalculatorInput = await req.json()
    const result = calculateBasicCalculator(body)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Calculation failed' },
      { status: 400 }
    )
  }
}
