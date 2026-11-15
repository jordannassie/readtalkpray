"use client";

import { useEffect, useRef, type ChangeEvent } from "react";
import { Phone } from "lucide-react";
import { applyPhoneEdit, normalizePhone } from "@/lib/phone";

export function PhoneInput({
  name = "phone",
  value,
  onChange,
  className,
  placeholder = "Phone",
  required = false,
  disabled = false,
  invalid = false,
}: {
  name?: string;
  value: string;
  onChange: (value: string) => void;
  className: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  invalid?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const caret = useRef<number | null>(null);

  useEffect(() => {
    if (caret.current == null || !ref.current) return;
    ref.current.setSelectionRange(caret.current, caret.current);
    caret.current = null;
  }, [value]);

  function onInput(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target;
    const next = applyPhoneEdit(value, input.value, input.selectionStart ?? input.value.length);
    caret.current = next.cursor;
    onChange(next.value);
  }

  function onBlur() {
    const parsed = normalizePhone(value);
    if (parsed) onChange(parsed.display);
  }

  return (
    <span className="relative block">
      <Phone aria-hidden size={18} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[#b5b5b5]" />
      <input
        ref={ref}
        name={name}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChange={onInput}
        onBlur={onBlur}
        aria-invalid={invalid}
        className={`${className} !pl-11`}
      />
    </span>
  );
}
