'use client'

import { useState } from 'react'
import { CalculatorInput, CalculatorResult, Operator, VALID_OPERATORS } from '../logic'

export default function BasicCalculatorPage() {
  const [input, setInput] = useState<CalculatorInput>({ a: 0, b: 0, operator: '+' })
  const [result, setResult] = useState<CalculatorResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResult(null)
    setLoading(true)
    try {
      const res = await fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Calculation failed')
      } else {
        setResult(data)
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setInput({ a: 0, b: 0, operator: '+' })
    setResult(null)
    setError(null)
  }

  return (
    <main style={{ maxWidth: 480, margin: '40px auto', fontFamily: 'sans-serif', padding: '0 16px' }}>
      <h1>Basic Calculator</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="a">A</label>
          <br />
          <input
            id="a"
            type="number"
            value={input.a}
            onChange={e => setInput(prev => ({ ...prev, a: parseFloat(e.target.value) || 0 }))}
            style={{ width: '100%', padding: 8, fontSize: 16 }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="operator">Operator</label>
          <br />
          <select
            id="operator"
            value={input.operator}
            onChange={e => setInput(prev => ({ ...prev, operator: e.target.value as Operator }))}
            style={{ width: '100%', padding: 8, fontSize: 16 }}
          >
            {VALID_OPERATORS.map(op => (
              <option key={op} value={op}>{op}</option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="b">B</label>
          <br />
          <input
            id="b"
            type="number"
            value={input.b}
            onChange={e => setInput(prev => ({ ...prev, b: parseFloat(e.target.value) || 0 }))}
            style={{ width: '100%', padding: 8, fontSize: 16 }}
          />
        </div>
        <button type="submit" disabled={loading} style={{ marginRight: 8, padding: '8px 16px', fontSize: 16 }}>
          {loading ? 'Calculating...' : 'Calculate'}
        </button>
        <button type="button" onClick={handleReset} style={{ padding: '8px 16px', fontSize: 16 }}>
          Reset
        </button>
      </form>

      {error && (
        <p role="alert" style={{ color: 'red', marginTop: 16 }}>{error}</p>
      )}
      {result && (
        <div style={{ marginTop: 16, padding: 16, background: '#f0f0f0', borderRadius: 4 }}>
          <p><strong>Expression:</strong> {result.expression}</p>
          <p><strong>Result:</strong> {result.result}</p>
        </div>
      )}
    </main>
  )
}
