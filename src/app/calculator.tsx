'use client';

import { useCallback, useEffect, useReducer } from 'react';
import clsx from 'clsx';

type Operator = '+' | '-' | '×' | '÷';

type State = {
  display: string;
  accumulator: number | null;
  operator: Operator | null;
  waiting: boolean;
  error: boolean;
};

type Action =
  | { type: 'digit'; value: string }
  | { type: 'decimal' }
  | { type: 'clear' }
  | { type: 'backspace' }
  | { type: 'negate' }
  | { type: 'operator'; value: Operator }
  | { type: 'equals' };

const MAX_DIGITS = 12;
const ERROR_MESSAGE = "Can't divide by 0";

const initialState: State = {
  display: '0',
  accumulator: null,
  operator: null,
  waiting: false,
  error: false,
};

function digitCount(value: string): number {
  // Count significant digits only: ignore sign, decimal point, and leading zeros.
  return value.replace(/[^0-9]/g, '').replace(/^0+/, '').length;
}

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return ERROR_MESSAGE;
  // Collapse floating-point noise (e.g. 0.1 + 0.2) without losing large-integer
  // precision — rounding via a fixed factor would overflow Number's safe range.
  let normalized = parseFloat(value.toPrecision(12));
  if (normalized === 0) normalized = 0; // avoid "-0"
  let str = String(normalized);
  if (digitCount(str) > MAX_DIGITS) {
    str = normalized.toExponential(6).replace(/\.?0+e/, 'e');
  }
  return str;
}

// Returns null when the operation is undefined (division by zero).
function compute(a: number, b: number, operator: Operator): number | null {
  switch (operator) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '×':
      return a * b;
    case '÷':
      return b === 0 ? null : a / b;
  }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'digit': {
      const base = state.error ? initialState : state;
      if (base.waiting || base.display === '0') {
        return { ...base, display: action.value, waiting: false, error: false };
      }
      if (digitCount(base.display) >= MAX_DIGITS) return base;
      return { ...base, display: base.display + action.value };
    }

    case 'decimal': {
      const base = state.error ? initialState : state;
      if (base.waiting) {
        return { ...base, display: '0.', waiting: false, error: false };
      }
      if (base.display.includes('.')) return base;
      return { ...base, display: base.display + '.' };
    }

    case 'clear':
      return initialState;

    case 'backspace': {
      if (state.error) return initialState;
      if (state.waiting) return state;
      const next = state.display.length > 1 ? state.display.slice(0, -1) : '0';
      // Avoid leaving a dangling "-" or "-0".
      const cleaned = next === '-' || next === '-0' ? '0' : next;
      return { ...state, display: cleaned };
    }

    case 'negate': {
      if (state.error || state.display === '0') return state;
      const display = state.display.startsWith('-') ? state.display.slice(1) : '-' + state.display;
      return { ...state, display };
    }

    case 'operator': {
      if (state.error) return state;
      const current = parseFloat(state.display);
      // Chain pending operation unless the user is mid-switching operators.
      if (state.operator !== null && state.accumulator !== null && !state.waiting) {
        const result = compute(state.accumulator, current, state.operator);
        if (result === null) {
          return { ...initialState, display: ERROR_MESSAGE, error: true };
        }
        return {
          display: formatNumber(result),
          accumulator: result,
          operator: action.value,
          waiting: true,
          error: false,
        };
      }
      return {
        ...state,
        accumulator: current,
        operator: action.value,
        waiting: true,
      };
    }

    case 'equals': {
      if (state.error || state.operator === null || state.accumulator === null) {
        return state;
      }
      const current = parseFloat(state.display);
      const result = compute(state.accumulator, current, state.operator);
      if (result === null) {
        return { ...initialState, display: ERROR_MESSAGE, error: true };
      }
      return {
        display: formatNumber(result),
        accumulator: null,
        operator: null,
        waiting: true,
        error: false,
      };
    }
  }
}

type KeyKind = 'digit' | 'control' | 'operator' | 'equals';

type KeyDef = {
  label: string;
  kind: KeyKind;
  action: Action;
  ariaLabel?: string;
  span2?: boolean;
};

const KEYS: KeyDef[] = [
  { label: 'AC', kind: 'control', action: { type: 'clear' }, ariaLabel: 'All clear' },
  { label: '⌫', kind: 'control', action: { type: 'backspace' }, ariaLabel: 'Backspace' },
  { label: '±', kind: 'control', action: { type: 'negate' }, ariaLabel: 'Toggle sign' },
  { label: '÷', kind: 'operator', action: { type: 'operator', value: '÷' }, ariaLabel: 'Divide' },
  { label: '7', kind: 'digit', action: { type: 'digit', value: '7' } },
  { label: '8', kind: 'digit', action: { type: 'digit', value: '8' } },
  { label: '9', kind: 'digit', action: { type: 'digit', value: '9' } },
  { label: '×', kind: 'operator', action: { type: 'operator', value: '×' }, ariaLabel: 'Multiply' },
  { label: '4', kind: 'digit', action: { type: 'digit', value: '4' } },
  { label: '5', kind: 'digit', action: { type: 'digit', value: '5' } },
  { label: '6', kind: 'digit', action: { type: 'digit', value: '6' } },
  { label: '−', kind: 'operator', action: { type: 'operator', value: '-' }, ariaLabel: 'Subtract' },
  { label: '1', kind: 'digit', action: { type: 'digit', value: '1' } },
  { label: '2', kind: 'digit', action: { type: 'digit', value: '2' } },
  { label: '3', kind: 'digit', action: { type: 'digit', value: '3' } },
  { label: '+', kind: 'operator', action: { type: 'operator', value: '+' }, ariaLabel: 'Add' },
  { label: '0', kind: 'digit', action: { type: 'digit', value: '0' }, span2: true },
  { label: '.', kind: 'digit', action: { type: 'decimal' }, ariaLabel: 'Decimal point' },
  { label: '=', kind: 'equals', action: { type: 'equals' }, ariaLabel: 'Equals' },
];

const KEY_STYLES: Record<KeyKind, string> = {
  digit:
    'bg-[var(--key)] text-[var(--ink)] border-[var(--key-border)] shadow-[0_4px_0_var(--key-shadow)] hover:bg-[#fff6dc]',
  control:
    'bg-[var(--control)] text-[var(--ink-soft)] border-[var(--control-border)] shadow-[0_4px_0_var(--control-shadow)] hover:bg-[#e8dcbd]',
  operator:
    'bg-[var(--operator)] text-[var(--yellow-ink)] border-[var(--operator-border)] shadow-[0_4px_0_var(--operator-shadow)] hover:bg-[#ffcf55]',
  equals:
    'bg-[var(--yellow-strong)] text-[var(--yellow-ink)] border-[var(--yellow-deep)] shadow-[0_4px_0_var(--yellow-deep)] hover:bg-[#ffc01f]',
};

function expressionHint(state: State): string {
  if (state.accumulator === null || state.operator === null) return '\u00A0';
  return `${formatNumber(state.accumulator)} ${state.operator}`;
}

export function Calculator() {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const { key } = event;
      if (key >= '0' && key <= '9') {
        dispatch({ type: 'digit', value: key });
      } else if (key === '.') {
        dispatch({ type: 'decimal' });
      } else if (key === '+') {
        dispatch({ type: 'operator', value: '+' });
      } else if (key === '-') {
        dispatch({ type: 'operator', value: '-' });
      } else if (key === '*') {
        dispatch({ type: 'operator', value: '×' });
      } else if (key === '/') {
        event.preventDefault();
        dispatch({ type: 'operator', value: '÷' });
      } else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        dispatch({ type: 'equals' });
      } else if (key === 'Backspace') {
        dispatch({ type: 'backspace' });
      } else if (key === 'Escape') {
        dispatch({ type: 'clear' });
      } else {
        return;
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleKey = useCallback((action: Action) => dispatch(action), []);

  return (
    <section
      aria-label="Calculator"
      className="w-full max-w-sm rounded-[var(--radius-card)] border border-[var(--surface-border)] bg-[var(--surface)] p-5 shadow-[0_18px_40px_-12px_rgba(90,70,20,0.35)] sm:p-6"
    >
      <header className="mb-4 flex items-center gap-2">
        <span
          aria-hidden="true"
          className="inline-block h-3 w-3 rounded-full bg-[var(--yellow-strong)] shadow-[0_0_0_4px_rgba(245,176,8,0.2)]"
        />
        <h1 className="text-sm font-semibold tracking-wide text-[var(--ink-soft)] uppercase">
          Sunny Calculator
        </h1>
      </header>

      <div
        className="mb-5 rounded-2xl border border-[var(--surface-border)] bg-[#fffbee] px-4 py-4 text-right"
        aria-live="polite"
      >
        <div className="h-5 font-mono text-sm text-[var(--ink-soft)]" aria-hidden="true">
          {expressionHint(state)}
        </div>
        <output
          className={clsx(
            'block overflow-x-auto font-mono font-semibold tabular-nums',
            state.error
              ? 'text-xl text-[var(--danger)] sm:text-2xl'
              : 'text-4xl text-[var(--ink)] sm:text-5xl'
          )}
        >
          {state.display}
        </output>
      </div>

      <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
        {KEYS.map((key) => (
          <button
            key={key.label}
            type="button"
            onClick={() => handleKey(key.action)}
            aria-label={key.ariaLabel ?? key.label}
            className={clsx(
              'flex h-14 items-center justify-center rounded-[var(--radius-key)] border text-xl font-semibold',
              'transition-[transform,background-color] duration-100 ease-out',
              'focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)] focus-visible:outline-none',
              'active:translate-y-[3px] active:shadow-none sm:h-16 sm:text-2xl',
              KEY_STYLES[key.kind],
              key.span2 && 'col-span-2'
            )}
          >
            {key.label}
          </button>
        ))}
      </div>

      <p className="mt-4 text-center text-xs text-[var(--ink-soft)]">
        Tip: your keyboard works too — numbers, + − × ÷, Enter, and Esc to clear.
      </p>
    </section>
  );
}
