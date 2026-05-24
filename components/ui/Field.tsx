import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'

type WrapperProps = {
  label: string
  htmlFor: string
  required?: boolean
  error?: string
  hint?: string
  children: ReactNode
}

export function Field({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
}: WrapperProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-ink">
        {label}
        {required && <span className="ml-0.5 text-terracotta">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-ink-muted">{hint}</p>}
      {error && <p className="text-xs text-terracotta-dark">{error}</p>}
    </div>
  )
}

export const FieldInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function FieldInput(props, ref) {
  return (
    <input
      ref={ref}
      {...props}
      className={`field-input ${props.className ?? ''}`}
    />
  )
})

export const FieldTextarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function FieldTextarea(props, ref) {
  return (
    <textarea
      ref={ref}
      rows={3}
      {...props}
      className={`field-input resize-none ${props.className ?? ''}`}
    />
  )
})

export const FieldSelect = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(function FieldSelect(props, ref) {
  return (
    <div className="relative">
      <select
        ref={ref}
        {...props}
        className={`field-input appearance-none pr-8 ${props.className ?? ''}`}
      />
      <svg
        aria-hidden
        viewBox="0 0 20 20"
        className="pointer-events-none absolute right-1 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
      >
        <path fill="currentColor" d="M5.25 7.5L10 12.25 14.75 7.5z" />
      </svg>
    </div>
  )
})
