"use client";

import { useId, useState } from "react";

type Props = {
  habitName: string;
  unit: string | null;
  /** Value already registered today; prefills the input and is shown as "value unit". */
  savedValue: number | null;
  disabled?: boolean;
  onSubmit: (value: number) => void;
};

export const positiveValueMessage = "El valor debe ser mayor a 0";

/** Number input with the habit unit and a confirm button; validates > 0 before submitting. */
export default function NumericValueField({ habitName, unit, savedValue, disabled = false, onSubmit }: Props) {
  const [text, setText] = useState(savedValue === null ? "" : String(savedValue));
  const [error, setError] = useState("");
  const errorId = useId();

  function submit() {
    const value = Number(text);
    if (text.trim() === "" || !Number.isFinite(value) || value <= 0) {
      setError(positiveValueMessage);
      return;
    }
    setError("");
    onSubmit(value);
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <form
        noValidate
        onSubmit={(event) => { event.preventDefault(); submit(); }}
        className="flex items-center gap-2"
      >
        <label className={`value-field${error ? " value-field-error" : ""}`}>
          <input
            type="number"
            aria-label={`Valor de ${habitName}`}
            step="any"
            inputMode="decimal"
            value={text}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            onChange={(event) => { setText(event.target.value); setError(""); }}
            className="value-input"
          />
          {unit && <span className="text-hm-caption text-hm-text-mid">{unit}</span>}
        </label>
        <button type="submit" disabled={disabled} aria-label={`Registrar ${habitName}`} className="btn-secondary">
          Registrar
        </button>
      </form>
      {savedValue !== null && <p className="text-hm-caption font-semibold text-hm-text tabular-nums">{unit ? `${savedValue} ${unit}` : String(savedValue)}</p>}
      {error && <p id={errorId} role="alert" className="text-hm-caption text-hm-danger">{error}</p>}
    </div>
  );
}
