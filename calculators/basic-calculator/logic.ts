export type Operator = '+' | '-' | '*' | '/' | '%' | 'pct'

export interface BasicCalculatorInput {
  a: number
  b: number
  operator: Operator
}

export interface BasicCalculatorResult {
  result: number
  expression: string
}

const OPERATORS: readonly Operator[] = ['+', '-', '*', '/', '%', 'pct']

function assertFinite(value: number, name: string): void {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`Invalid input: ${name} must be a finite number`)
  }
}

export function calculateBasicCalculator(
  input: BasicCalculatorInput
): BasicCalculatorResult {
  const { a, b, operator } = input

  assertFinite(a, 'a')
  assertFinite(b, 'b')

  if (!OPERATORS.includes(operator)) {
    throw new Error(`Unsupported operator: ${operator}`)
  }

  let result: number
  let expression: string

  switch (operator) {
    case '+':
      result = a + b
      expression = `${a} + ${b} = ${result}`
      break
    case '-':
      result = a - b
      expression = `${a} - ${b} = ${result}`
      break
    case '*':
      result = a * b
      expression = `${a} * ${b} = ${result}`
      break
    case '/':
      if (b === 0) throw new Error('Division by zero is not allowed')
      result = a / b
      expression = `${a} / ${b} = ${result}`
      break
    case '%':
      if (b === 0) throw new Error('Modulo by zero is not allowed')
      result = a % b
      expression = `${a} % ${b} = ${result}`
      break
    case 'pct':
      result = (a / 100) * b
      expression = `${a}% of ${b} = ${result}`
      break
    default:
      throw new Error(`Unsupported operator: ${operator}`)
  }

  return { result, expression }
}
