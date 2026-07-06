import { island, useSignal, callAction, actionUrl } from '@wabot-dev/framework/ui'
import styles from './Echo.module.css'

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
    <form onSubmit={send} class={styles.form}>
      <input
        value={draft}
        onInput={(e) => (draft.value = (e.target as HTMLInputElement).value)}
        placeholder="Say something to PixelBot"
        class={styles.input}
      />
      <button type="submit" disabled={busy} class={styles.button}>
        {busy.value ? 'Sending…' : 'Send'}
      </button>
      {reply.value ? <p class={styles.reply}>{reply}</p> : null}
    </form>
  )
}

export default island(Echo)
