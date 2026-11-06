import type { InputHTMLAttributes, Ref } from "react";
import AuthIcon, { type AuthIconName } from "./auth-icons";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "className"> & {
  id: string;
  label: string;
  icon: AuthIconName;
  error?: string;
  inputRef?: Ref<HTMLInputElement>;
};

/** Labelled input with leading icon, accent focus ring and danger state (mockup AuthField). */
export default function AuthField({ id, label, icon, error, inputRef, ...inputProps }: Props) {
  const errorId = `${id}-error`;
  return (
    <div className="space-y-1.5">
      <label className="block text-hm-caption font-medium text-hm-text" htmlFor={id}>{label}</label>
      <div className={error ? "auth-field auth-field-error" : "auth-field"}>
        <AuthIcon name={icon} />
        <input
          {...inputProps}
          ref={inputRef}
          id={id}
          name={inputProps.name ?? id}
          className="auth-input"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        />
      </div>
      {error && (
        <p className="flex items-center gap-1.5 text-hm-caption text-hm-danger" id={errorId}>
          <AuthIcon name="alert" size={12} /> {error}
        </p>
      )}
    </div>
  );
}
