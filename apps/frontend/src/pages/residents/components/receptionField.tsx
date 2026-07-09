import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

type ReceptionFieldProps = {
  label: string;
  error?: string;
  children: ReactNode;
};

export function ReceptionField({
  label,
  error,
  children,
}: ReceptionFieldProps) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {error ? <small className="field-error">{error}</small> : null}
    </label>
  );
}

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function TextInput({ label, error, ...inputProps }: TextInputProps) {
  return (
    <ReceptionField label={label} error={error}>
      <input {...inputProps} />
    </ReceptionField>
  );
}

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
};

export function TextArea({ label, error, ...textareaProps }: TextAreaProps) {
  return (
    <ReceptionField label={label} error={error}>
      <textarea {...textareaProps} />
    </ReceptionField>
  );
}
