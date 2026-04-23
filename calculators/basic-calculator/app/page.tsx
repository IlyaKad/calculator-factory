'use client'

import { useState } from 'react'
import type {
  BasicCalculatorInput,
  BasicCalculatorResult,
  Operator,
} from '../logic'

const OPERATOR_LABELS: Record<Operator, string> = {
  '+': '+',
  '-': '-',
  '*': '×',
  '/': '÷',
  '%': 'mod',
  pct: '% of',
}

const OPERATORS: Operator[] = ['+', '-', '*', '/', '%', 'pct']

export default function BasicCalculatorPage() {
  const [a, setA] = useState<string>('0')
  const [b, setB] = useState<string>('0')
  const [operator, setOperator] = useState<Operator>('+')
  const [result, setResult] = useState<BasicCalculatorResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResult(null)
    setLoading(true)
    try {
      const payload: BasicCalculatorInput = {
        a: Number(a),
        b: Number(b),
        operator,
      }
      const res = await fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Calculation failed')
      } else {
        setResult(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setA('0')
    setB('0')
    setOperator('+')
    setResult(null)
    setError(null)
  }

  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Basic Calculator</h1>
          <p className="text-sm text-slate-500 mt-1">
            Supports +, -, ×, ÷, mod and % of
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="a" className="block text-sm font-medium text-slate-700 mb-1">
              First number
            </label>
            <input
              id="a"
              type="number"
              step="any"
              value={a}
              onChange={(e) => setA(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <span className="block text-sm font-medium text-slate-700 mb-1">Operator</span>
            <div role="group" aria-label="Operator" className="grid grid-cols-6 gap-1">
              {OPERATORS.map((op) => (
                <button
                  type="button"
                  key={op}
                  aria-pressed={operator === op}
                  onClick={() => setOperator(op)}
                  className={`px-2 py-2 rounded-lg text-sm font-medium transition ${
                    operator === op
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {OPERATOR_LABELS[op]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="b" className="block text-sm font-medium text-slate-700 mb-1">
              Second number
            </label>
            <input
              id="b"
              type="number"
              step="any"
              value={b}
              onChange={(e) => setB(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-2 rounded-lg transition"
            >
              {loading ? 'Calculating…' : 'Calculate'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
            >
              Reset
            </button>
          </div>
        </form>

        {error && (
          <div
            role="alert"
            data-testid="error"
            className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm"
          >
            {error}
          </div>
        )}

        {result && (
          <div
            data-testid="result"
            className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg"
          >
            <div className="text-xs uppercase tracking-wide text-slate-500">Result</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{result.result}</div>
            <div className="text-xs text-slate-500 mt-1" data-testid="expression">
              {result.expression}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
