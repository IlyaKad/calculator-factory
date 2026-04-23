import { calculateBasicCalculator } from './logic'

describe('calculateBasicCalculator', () => {
  describe('happy paths', () => {
    it('adds two numbers', () => {
      const r = calculateBasicCalculator({ a: 2, b: 3, operator: '+' })
      expect(r.result).toBe(5)
      expect(r.expression).toBe('2 + 3 = 5')
    })

    it('subtracts two numbers', () => {
      const r = calculateBasicCalculator({ a: 10, b: 4, operator: '-' })
      expect(r.result).toBe(6)
      expect(r.expression).toBe('10 - 4 = 6')
    })

    it('multiplies two numbers', () => {
      const r = calculateBasicCalculator({ a: 6, b: 7, operator: '*' })
      expect(r.result).toBe(42)
      expect(r.expression).toBe('6 * 7 = 42')
    })

    it('divides two numbers', () => {
      const r = calculateBasicCalculator({ a: 20, b: 4, operator: '/' })
      expect(r.result).toBe(5)
      expect(r.expression).toBe('20 / 4 = 5')
    })

    it('computes modulo', () => {
      const r = calculateBasicCalculator({ a: 17, b: 5, operator: '%' })
      expect(r.result).toBe(2)
      expect(r.expression).toBe('17 % 5 = 2')
    })

    it('computes percentage: 25% of 200 = 50', () => {
      const r = calculateBasicCalculator({ a: 25, b: 200, operator: 'pct' })
      expect(r.result).toBeCloseTo(50)
      expect(r.expression).toBe('25% of 200 = 50')
    })

    it('handles negative operands on addition', () => {
      const r = calculateBasicCalculator({ a: -5, b: 3, operator: '+' })
      expect(r.result).toBe(-2)
    })

    it('handles floating point division with toBeCloseTo', () => {
      const r = calculateBasicCalculator({ a: 1, b: 3, operator: '/' })
      expect(r.result).toBeCloseTo(0.3333, 3)
    })
  })

  describe('guards', () => {
    it('throws on division by zero', () => {
      expect(() => calculateBasicCalculator({ a: 10, b: 0, operator: '/' }))
        .toThrow('Division by zero is not allowed')
    })

    it('throws on modulo by zero', () => {
      expect(() => calculateBasicCalculator({ a: 10, b: 0, operator: '%' }))
        .toThrow('Modulo by zero is not allowed')
    })

    it('throws when a is NaN', () => {
      expect(() => calculateBasicCalculator({ a: NaN, b: 1, operator: '+' }))
        .toThrow('Invalid input: a must be a finite number')
    })

    it('throws when b is Infinity', () => {
      expect(() => calculateBasicCalculator({ a: 1, b: Infinity, operator: '+' }))
        .toThrow('Invalid input: b must be a finite number')
    })

    it('throws when operator is unsupported', () => {
      expect(() =>
        // @ts-expect-error intentionally invalid operator
        calculateBasicCalculator({ a: 1, b: 2, operator: '^' })
      ).toThrow('Unsupported operator: ^')
    })

    it('throws when a is non-numeric', () => {
      expect(() =>
        // @ts-expect-error intentionally invalid type
        calculateBasicCalculator({ a: '5', b: 1, operator: '+' })
      ).toThrow('Invalid input: a must be a finite number')
    })
  })

  describe('boundaries', () => {
    it('allows zero operands for addition', () => {
      const r = calculateBasicCalculator({ a: 0, b: 0, operator: '+' })
      expect(r.result).toBe(0)
    })

    it('allows zero as first operand for division', () => {
      const r = calculateBasicCalculator({ a: 0, b: 5, operator: '/' })
      expect(r.result).toBe(0)
    })

    it('0% of any number is 0', () => {
      const r = calculateBasicCalculator({ a: 0, b: 9999, operator: 'pct' })
      expect(r.result).toBe(0)
    })
  })
})
