/**
 * Bot trap: a text field humans never see or tab into. Bots that fill every
 * input trip it, and the server action silently drops the submission.
 */
export const HONEYPOT_FIELD = 'website'

export function Honeypot() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0"
    >
      <label>
        Não preencha este campo
        <input
          type="text"
          name={HONEYPOT_FIELD}
          tabIndex={-1}
          autoComplete="off"
        />
      </label>
    </div>
  )
}
