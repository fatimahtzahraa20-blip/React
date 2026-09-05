import { useCallback, useEffect, useState } from 'react';

const buttonRows = [
  ['MC', 'MR', 'M+', 'M-'],
  ['C', '±', '%', '⌫'],
  ['7', '8', '9', '÷'],
  ['4', '5', '6', '×'],
  ['1', '2', '3', '-'],
  ['0', '.', '=', '+']
];

const operators = ['+', '-', '×', '÷'];

function sanitizeExpression(expression) {
  return expression
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/[^0-9+\-*/.() ]/g, '');
}

function formatResult(value) {
  if (!Number.isFinite(value)) return 'Error';

  const rounded = Number(value.toFixed(10));
  return rounded.toLocaleString('en-US', {
    maximumFractionDigits: 10
  });
}

export default function App() {
  const [expression, setExpression] = useState('');
  const [display, setDisplay] = useState('0');
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('calculator-history');
    return saved ? JSON.parse(saved) : [];
  });
  const [memoryValue, setMemoryValue] = useState(() => {
    return Number(localStorage.getItem('calculator-memory') || 0);
  });
  const [justEvaluated, setJustEvaluated] = useState(false);

  useEffect(() => {
    localStorage.setItem('calculator-history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('calculator-memory', String(memoryValue));
  }, [memoryValue]);

  const calculate = useCallback(
    (input = expression) => {
      if (!input.trim()) return;

      try {
        const safeExpression = sanitizeExpression(input);
        const result = Function(`"use strict"; return (${safeExpression})`)();
        const formatted = formatResult(result);

        if (formatted === 'Error') {
          setDisplay('Error');
          setJustEvaluated(true);
          return;
        }

        setHistory((prev) =>
          [{ expression: input, result: formatted }, ...prev].slice(0, 6)
        );
        setExpression(String(result));
        setDisplay(formatted);
        setJustEvaluated(true);
      } catch {
        setDisplay('Error');
        setJustEvaluated(true);
      }
    },
    [expression]
  );

  const getCurrentNumericValue = useCallback(() => {
    const rawValue =
      display === 'Error'
        ? NaN
        : Number(String(display).replace(/,/g, ''));

    return Number.isFinite(rawValue) ? rawValue : NaN;
  }, [display]);

  const handleMemory = useCallback(
    (action) => {
      const currentValue = getCurrentNumericValue();

      if (action === 'MC') {
        setMemoryValue(0);
        return;
      }

      if (action === 'MR') {
        const recalled = String(memoryValue);
        setExpression(recalled);
        setDisplay(recalled);
        setJustEvaluated(false);
        return;
      }

      if (Number.isNaN(currentValue)) return;

      if (action === 'M+') {
        setMemoryValue((prev) => prev + currentValue);
      }

      if (action === 'M-') {
        setMemoryValue((prev) => prev - currentValue);
      }
    },
    [getCurrentNumericValue, memoryValue]
  );

  const handleInput = useCallback(
    (value) => {
      if (['MC', 'MR', 'M+', 'M-'].includes(value)) {
        handleMemory(value);
        return;
      }

      if (value === 'C') {
        setExpression('');
        setDisplay('0');
        setJustEvaluated(false);
        return;
      }

      if (value === '=') {
        calculate();
        return;
      }

      if (display === 'Error') {
        setExpression('');
        setDisplay('0');
      }

      if (value === '⌫') {
        const next = expression.slice(0, -1);
        setExpression(next);
        setDisplay(next || '0');
        setJustEvaluated(false);
        return;
      }

      if (value === '±') {
        if (!expression || Number.isNaN(Number(expression))) return;
        const next = String(Number(expression) * -1);
        setExpression(next);
        setDisplay(next);
        setJustEvaluated(false);
        return;
      }

      if (value === '%') {
        if (!expression || Number.isNaN(Number(expression))) return;
        const next = String(Number(expression) / 100);
        setExpression(next);
        setDisplay(next);
        setJustEvaluated(false);
        return;
      }

      const nextValue = operators.includes(value) ? ` ${value} ` : value;
      const nextExpression =
        justEvaluated && !operators.includes(value)
          ? value
          : `${expression}${nextValue}`;

      setExpression(nextExpression);
      setDisplay(nextExpression);
      setJustEvaluated(false);
    },
    [calculate, display, expression, handleMemory, justEvaluated]
  );

  useEffect(() => {
    const onKeyDown = (event) => {
      const { key } = event;

      if (/^[0-9]$/.test(key)) handleInput(key);
      else if (key === '.') handleInput('.');
      else if (key === 'Enter' || key === '=') handleInput('=');
      else if (key === 'Backspace') handleInput('⌫');
      else if (key === 'Escape') handleInput('C');
      else if (key === '+') handleInput('+');
      else if (key === '-') handleInput('-');
      else if (key === '*') handleInput('×');
      else if (key === '/') handleInput('÷');
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleInput]);

  return (
    <div className="app-shell">
      <div className="calculator-card">
        <header className="topbar">
          <div>
            <p className="eyebrow">Fatima-zahra</p>
          </div>
          <span className="badge"></span>
        </header>

        <section className="display-panel">
          <p className="expression">
            {expression || 'Ready for calculation'}
          </p>
          <div className="display">{display}</div>
        </section>

        <section className="history-panel">
          <div className="panel-title">
            <span>Recent</span>
            <span>Memory: {formatResult(memoryValue)}</span>
          </div>

          {history.length === 0 ? (
            <p className="history-empty">
              Your recent calculations will appear here.
            </p>
          ) : (
            history.map((item, index) => (
              <button
                key={`${item.expression}-${index}`}
                type="button"
                className="history-item"
                onClick={() => {
                  setExpression(item.expression);
                  setDisplay(item.result);
                  setJustEvaluated(false);
                }}
              >
                <span>{item.expression}</span>
                <strong>{item.result}</strong>
              </button>
            ))
          )}
        </section>

        <section className="button-grid">
          {buttonRows.flat().map((item) => (
            <button
              key={item}
              type="button"
              className={[
                'calc-btn',
                operators.includes(item) || item === '=' ? 'accent' : '',
                ['C', '±', '%', '⌫', 'MC', 'MR', 'M+', 'M-'].includes(item)
                  ? 'utility'
                  : ''
              ].join(' ')}
              onClick={() => handleInput(item)}
            >
              {item}
            </button>
          ))}
        </section>
      </div>
    </div>
  );
}