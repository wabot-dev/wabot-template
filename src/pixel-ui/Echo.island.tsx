import { island, useSignal, callAction, actionUrl } from '@wabot-dev/framework/ui'

// Islands must be the default export of a *.island.tsx file so the bundler can
// give them a stable id and emit a per-island client bundle.
const ECHO_URL = actionUrl('/', 'echo') // -> /_action/echo

function Echo() {
  const draft = useSignal('')
  const reply = useSignal('')
  const busy = useSignal(false)

  async function send(event: Event) {
    event.preventDefault()
    const message = draft.value.trim()
    if (!message || busy.value) return
    busy.value = true
    try {
      // callAction POSTs JSON to the @action and returns its result.
      const res = await callAction<{ reply: string }>(ECHO_URL, { message })
      reply.value = res.reply
      draft.value = ''
    } finally {
      busy.value = false
    }
  }

  return (
    <form
      onSubmit={send}
      style="margin-top: 2rem; display: flex; flex-direction: column; gap: 0.75rem; max-width: 24rem;"
    >
      <input
        value={draft}
        onInput={(e) => (draft.value = (e.target as HTMLInputElement).value)}
        placeholder="Say something to PixelBot"
        style="padding: 0.5rem 0.75rem; border: 1px solid #ccc; border-radius: 6px;"
      />
      <button
        type="submit"
        disabled={busy}
        style="padding: 0.5rem 0.75rem; border: 0; border-radius: 6px; background: #111; color: #fff; cursor: pointer;"
      >
        {busy.value ? 'Sending…' : 'Send'}
      </button>
      {reply.value ? <p style="margin: 0; color: #111;">{reply}</p> : null}
    </form>
  )
}

export default island(Echo)
