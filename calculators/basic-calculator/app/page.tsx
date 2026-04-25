'use client'

import { useState, useCallback } from 'react'
import type { Operator } from '../logic'

const OPERATOR_LABELS: Record<Operator, string> = {
  '+': '+',
  '-': '−',
  '*': '×',
  '/': '÷',
  pct: '%',
  '%': 'mod',
}

const OPERATORS: Operator[] = ['+', '-', '*', '/', 'pct', '%']

interface CalcState {
  a: string
  b: string
  activeField: 'a' | 'b'
  operator: Operator
  calculated: boolean
  lastResult: number | null
}

const INITIAL_STATE: CalcState = {
  a: '',
  b: '',
  activeField: 'a',
  operator: '+',
  calculated: false,
  lastResult: null,
}

export default function BasicCalculatorPage() {
  const [state, setState] = useState<CalcState>(INITIAL_STATE)
  const [result, setResult] = useState<number | null>(null)
  const [expression, setExpression] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const pressDigit = useCallback((ch: string) => {
    setState((prev) => {
      if (prev.calculated) return prev
      const field = prev.activeField
      const current = prev[field]
      if (ch === '.' && current.includes('.')) return prev
      return { ...prev, [field]: current + ch }
    })
    setError(null)
  }, [])

  const pressBack = useCallback(() => {
    setState((prev) => {
      if (prev.calculated) return prev
      const field = prev.activeField
      return { ...prev, [field]: prev[field].slice(0, -1) }
    })
  }, [])

  const pressNegate = useCallback(() => {
    setState((prev) => {
      if (prev.calculated) return prev
      const field = prev.activeField
      const val = prev[field]
      if (!val) return prev
      return { ...prev, [field]: val.startsWith('-') ? val.slice(1) : '-' + val }
    })
  }, [])

  const selectOperator = useCallback((op: Operator) => {
    setState((prev) => {
      if (prev.calculated && prev.lastResult !== null) {
        return {
          ...prev,
          a: String(prev.lastResult),
          b: '',
          operator: op,
          activeField: 'b',
          calculated: false,
        }
      }
      const activeField = prev.a !== '' ? 'b' : 'a'
      return { ...prev, operator: op, activeField }
    })
    setError(null)
    setResult(null)
  }, [])

  const calculate = useCallback(async () => {
    setError(null)
    const aVal = parseFloat(state.a)
    const bVal = parseFloat(state.b)
    if (isNaN(aVal) || isNaN(bVal)) {
      setError('Enter both numbers first')
      return
    }
    try {
      const res = await fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ a: aVal, b: bVal, operator: state.operator }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Calculation failed')
      } else {
        const r = +data.result.toFixed(10)
        setResult(r)
        setExpression(`${aVal} ${OPERATOR_LABELS[state.operator]} ${bVal} =`)
        setState((prev) => ({ ...prev, calculated: true, lastResult: r }))
      }
    } catch {
      setError('Network error')
    }
  }, [state])

  const reset = useCallback(() => {
    setState(INITIAL_STATE)
    setResult(null)
    setExpression('')
    setError(null)
  }, [])

  const displayValue = (() => {
    if (state.calculated && result !== null) return String(result)
    const val = state[state.activeField]
    return val || '0'
  })()

  const exprText = (() => {
    if (state.calculated) return expression
    if (state.activeField === 'b') {
      return `${state.a} ${OPERATOR_LABELS[state.operator]}`
    }
    return state.a || ''
  })()

  const disableAfterCalc = state.calculated

  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">

        {/* Title */}
        <h1 className="text-white text-xl font-semibold text-center tracking-tight">
          Basic Calculator
        </h1>

        {/* Display */}
        <div className="bg-slate-900 rounded-xl px-4 py-3 text-right space-y-1">
          <p className="text-slate-400 text-sm min-h-[1.25rem]" data-testid="expression">
            {exprText}
          </p>
          <p className="text-white text-4xl font-bold tracking-tight" data-testid="display">
            {displayValue}
          </p>
        </div>

        {/* Operator row */}
        <div className="grid grid-cols-6 gap-2">
          {OPERATORS.map((op) => (
            <button
              key={op}
              onClick={() => selectOperator(op)}
              data-testid={`op-${op}`}
              aria-pressed={state.operator === op && !state.calculated}
              className={`rounded-lg py-2 font-semibold transition ${
                op === '%' ? 'text-sm' : 'text-base'
              } ${
                state.operator === op && !state.calculated
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {OPERATOR_LABELS[op]}
            </button>
          ))}
        </div>

        {/* Number pad */}
        <div className="grid grid-cols-4 gap-2">
          {/* Row 1: 7 8 9 ⌫ */}
          {['7', '8', '9'].map((d) => (
            <button
              key={d}
              onClick={() => pressDigit(d)}
              className="bg-slate-700 text-white rounded-lg py-3 text-lg font-semibold hover:bg-slate-600 transition"
            >
              {d}
            </button>
          ))}
          <button
            onClick={pressBack}
            disabled={disableAfterCalc}
            data-testid="btn-back"
            className={`bg-slate-600 text-slate-300 rounded-lg py-3 text-lg font-semibold transition ${
              disableAfterCalc ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-500'
            }`}
          >
            ⌫
          </button>

          {/* Row 2: 4 5 6 +/− */}
          {['4', '5', '6'].map((d) => (
            <button
              key={d}
              onClick={() => pressDigit(d)}
              className="bg-slate-700 text-white rounded-lg py-3 text-lg font-semibold hover:bg-slate-600 transition"
            >
              {d}
            </button>
          ))}
          <button
            onClick={pressNegate}
            disabled={disableAfterCalc}
            data-testid="btn-negate"
            className={`bg-slate-600 text-slate-300 rounded-lg py-3 text-lg font-semibold transition ${
              disableAfterCalc ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-500'
            }`}
          >
            +/−
          </button>

          {/* Row 3: 1 2 3 | = (spans rows 3–4) */}
          {['1', '2', '3'].map((d) => (
            <button
              key={d}
              onClick={() => pressDigit(d)}
              className="bg-slate-700 text-white rounded-lg py-3 text-lg font-semibold hover:bg-slate-600 transition"
            >
              {d}
            </button>
          ))}
          <button
            onClick={calculate}
            data-testid="btn-equals"
            className="bg-indigo-600 text-white rounded-lg text-2xl font-bold hover:bg-indigo-500 transition"
            style={{ gridRow: 'span 2' }}
          >
            =
          </button>

          {/* Row 4: 0 (wide) . */}
          <button
            onClick={() => pressDigit('0')}
            className="col-span-2 bg-slate-700 text-white rounded-lg py-3 text-lg font-semibold hover:bg-slate-600 transition"
          >
            0
          </button>
          <button
            onClick={() => pressDigit('.')}
            className="bg-slate-700 text-white rounded-lg py-3 text-lg font-semibold hover:bg-slate-600 transition"
          >
            .
          </button>
        </div>

        {/* Reset */}
        <button
          onClick={reset}
          data-testid="btn-reset"
          className="w-full border border-slate-600 text-slate-400 hover:text-white hover:border-slate-400 rounded-lg py-2 text-sm transition-colors"
        >
          Reset
        </button>

        {/* Error panel */}
        {error && (
          <div
            role="alert"
            data-testid="error"
            className="bg-red-900/50 border border-red-500 rounded-xl px-4 py-3 text-red-300 text-sm text-center"
          >
            {error}
          </div>
        )}

        {/* Result panel (shown after calculation) */}
        {state.calculated && result !== null && !error && (
          <div
            data-testid="result-panel"
            className="bg-slate-900/60 rounded-xl px-4 py-3 text-center"
          >
            <p className="text-slate-400 text-xs uppercase tracking-wider">Result</p>
            <p className="text-white text-2xl font-bold mt-1" data-testid="result">
              {result}
            </p>
          </div>
        )}

      </div>
    </main>
  )
}
