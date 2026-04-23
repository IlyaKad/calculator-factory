export type Operator = '+' | '-' | '*' | '/' | '%' | 'pct'

export interface CalculatorInput {
  a: number
  b: number
  operator: Operator
}

export interface CalculatorResult {
  result: number
  expression: string
}

export const VALID_OPERATORS: Operator[] = ['+', '-', '*', '/', '%', 'pct']

export function calculate(input: CalculatorInput): CalculatorResult {
  const { a, b, operator } = input

  if (!VALID_OPERATORS.includes(operator)) {
    throw new Error(`Unknown operator: ${operator}`)
  }

  let result: number

  switch (operator) {
    case '+':
      result = a + b
      break
    case '-':
      result = a - b
      break
    case '*':
      result = a * b
      break
    case '/':
      if (b === 0) throw new Error('Division by zero')
      result = a / b
      break
    case '%':
      if (b === 0) throw new Error('Division by zero')
      result = a % b
      break
    case 'pct':
      result = (a * b) / 100
      break
  }

  const expression = `${a} ${operator} ${b} = ${result}`

  return { result, expression }
}
