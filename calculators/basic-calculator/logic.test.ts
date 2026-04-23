import { calculate } from './logic'

describe('calculate', () => {

  // --- Happy paths ---

  it('adds two numbers', () => {
    const r = calculate({ a: 10, b: 5, operator: '+' })
    expect(r.result).toBe(15)
    expect(r.expression).toBe('10 + 5 = 15')
  })

  it('subtracts two numbers', () => {
    const r = calculate({ a: 10, b: 5, operator: '-' })
    expect(r.result).toBe(5)
    expect(r.expression).toBe('10 - 5 = 5')
  })

  it('multiplies two numbers', () => {
    const r = calculate({ a: 10, b: 5, operator: '*' })
    expect(r.result).toBe(50)
    expect(r.expression).toBe('10 * 5 = 50')
  })

  it('divides two numbers', () => {
    const r = calculate({ a: 10, b: 5, operator: '/' })
    expect(r.result).toBe(2)
    expect(r.expression).toBe('10 / 5 = 2')
  })

  it('divides to a float result', () => {
    const r = calculate({ a: 10, b: 4, operator: '/' })
    expect(r.result).toBeCloseTo(2.5)
  })

  it('computes modulo', () => {
    const r = calculate({ a: 10, b: 3, operator: '%' })
    expect(r.result).toBe(1)
    expect(r.expression).toBe('10 % 3 = 1')
  })

  it('computes percentage', () => {
    const r = calculate({ a: 500, b: 20, operator: 'pct' })
    expect(r.result).toBe(100)
    expect(r.expression).toBe('500 pct 20 = 100')
  })

  it('computes percentage of zero', () => {
    const r = calculate({ a: 0, b: 50, operator: 'pct' })
    expect(r.result).toBe(0)
  })

  // --- Division by zero ---

  it('throws Division by zero for operator /', () => {
    expect(() => calculate({ a: 10, b: 0, operator: '/' }))
      .toThrow('Division by zero')
  })

  it('throws Division by zero for operator %', () => {
    expect(() => calculate({ a: 10, b: 0, operator: '%' }))
      .toThrow('Division by zero')
  })

  // --- Unknown operator ---

  it('throws on unknown operator', () => {
    expect(() => calculate({ a: 10, b: 5, operator: '^' as never }))
      .toThrow('Unknown operator: ^')
  })

  // --- Expression string format ---

  it('formats expression correctly for modulo', () => {
    const r = calculate({ a: 7, b: 4, operator: '%' })
    expect(r.expression).toBe('7 % 4 = 3')
  })

  it('formats expression correctly for pct', () => {
    const r = calculate({ a: 200, b: 10, operator: 'pct' })
    expect(r.expression).toBe('200 pct 10 = 20')
  })

  // --- Negative numbers ---

  it('handles negative operand in modulo', () => {
    const r = calculate({ a: -7, b: 3, operator: '%' })
    expect(r.result).toBe(-7 % 3)
  })

  it('subtracts to negative result', () => {
    const r = calculate({ a: 3, b: 10, operator: '-' })
    expect(r.result).toBe(-7)
  })

})
