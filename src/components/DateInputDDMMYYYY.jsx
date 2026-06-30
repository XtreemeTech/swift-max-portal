import { useEffect, useRef, useState } from "react";
import {
  digitsToIso,
  isoToDateDigits,
} from "../utils/dateFormat";

const SEGMENTS = [
  { key: "day", label: "DD", start: 0, length: 2 },
  { key: "month", label: "MM", start: 2, length: 2 },
  { key: "year", label: "YYYY", start: 4, length: 4 },
];

function DateSegment({ label, value, isActive, showCaret, caretOffset }) {
  const chars = label.split("");

  return (
    <div
      className={`relative flex h-9 items-center justify-center rounded-md border bg-gray-50/80 px-2 font-mono text-base leading-none transition-colors ${
        isActive ? "border-blue-400 ring-2 ring-blue-100" : "border-gray-200"
      }`}
      style={{ minWidth: `${chars.length * 0.72 + 1}rem` }}
    >
      <span className="relative z-10 inline-flex">
        {chars.map((ghostChar, index) => {
          const typed = value[index] ?? null;
          const isCaretHere = showCaret && index === caretOffset;

          return (
            <span
              key={`${label}-${index}`}
              className="relative inline-flex h-[1.2em] w-[1ch] items-center justify-center"
            >
              {typed ? (
                <span className="font-semibold text-inherit">{typed}</span>
              ) : (
                <span className="text-gray-400">{ghostChar}</span>
              )}
              {isCaretHere ? (
                <span className="absolute bottom-0 left-1/2 h-[1em] w-px -translate-x-1/2 animate-pulse bg-current" />
              ) : null}
            </span>
          );
        })}
      </span>
    </div>
  );
}

/**
 * Segmented DD / MM / YYYY input. Format hints stay visible inside each box
 * while the user types digits on top. Emits YYYY-MM-DD when complete and valid.
 */
export default function DateInputDDMMYYYY({
  value = "",
  onChange,
  disabled = false,
  className = "",
  id,
}) {
  const [digits, setDigits] = useState(() => isoToDateDigits(value));
  const [focused, setFocused] = useState(false);
  const [touched, setTouched] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!focused) {
      setDigits(isoToDateDigits(value));
    }
  }, [value, focused]);

  const handleChange = (event) => {
    const next = event.target.value.replace(/\D/g, "").slice(0, 8);
    setDigits(next);
    onChange(digitsToIso(next) || "");
  };

  const getActiveSegment = () => {
    if (digits.length < 2) return 0;
    if (digits.length < 4) return 1;
    return 2;
  };

  const activeSeg = getActiveSegment();
  const caretInSegment = digits.length - SEGMENTS[activeSeg].start;

  const isInvalid =
    touched && digits.length > 0 && (digits.length < 8 || !digitsToIso(digits));

  return (
    <div className="w-full">
      <div
        id={id}
        role="group"
        aria-label="Date in DD/MM/YYYY format"
        className={`relative ${disabled ? "cursor-not-allowed opacity-60" : "cursor-text"} ${className}`}
        onClick={() => !disabled && inputRef.current?.focus()}
      >
        <div
          className="pointer-events-none flex items-center gap-1.5 select-none"
          aria-hidden="true"
        >
          {SEGMENTS.map((segment, index) => (
            <div key={segment.key} className="flex items-center gap-1.5">
              {index > 0 && (
                <span className="text-lg font-light text-gray-400">/</span>
              )}
              <DateSegment
                label={segment.label}
                value={digits.slice(segment.start, segment.start + segment.length)}
                isActive={focused && index === activeSeg}
                showCaret={focused && index === activeSeg && digits.length < 8}
                caretOffset={index === activeSeg ? caretInSegment : 0}
              />
            </div>
          ))}
        </div>

        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={digits}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            setTouched(true);
          }}
          disabled={disabled}
          className="absolute inset-0 h-full w-full cursor-text opacity-0"
          autoComplete="off"
          aria-invalid={isInvalid}
        />
      </div>

      {isInvalid && (
        <p className="mt-1.5 text-xs text-red-600">
          Enter a valid date in DD/MM/YYYY format.
        </p>
      )}
    </div>
  );
}
