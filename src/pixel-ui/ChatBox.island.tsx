import { island, useSignal, useEffect, useRef } from '@wabot-dev/framework/ui'
import { io, type Socket } from 'socket.io-client'
import styles from './ChatBox.module.css'

interface ChatLine {
  from: 'you' | 'pixel'
  text: string
}

// A browser socket client for PixelBot's @socket({ namespace: 'pixel' }) chat
// channel. It connects to the "/pixel" Socket.IO namespace on the same origin,
// emits one 'message' event per user turn, and appends every 'message' reply the
// bot emits (the channel sends back an IChatMessage — we render its `text`).
//
// io()/crypto run only in the mount effect, so this renders as static HTML during
// SSR and wires up the socket after hydration.
function ChatBox() {
  const lines = useSignal<ChatLine[]>([])
  const draft = useSignal('')
  const connected = useSignal(false)
  const socketRef = useRef<Socket | null>(null)
  const chatIdRef = useRef('')

  useEffect(() => {
    const socket = io('/pixel')
    socketRef.current = socket
    chatIdRef.current = crypto.randomUUID()

    socket.on('connect', () => (connected.value = true))
    socket.on('disconnect', () => (connected.value = false))
    socket.on('message', (message: { text?: string }) => {
      if (message?.text) lines.value = [...lines.value, { from: 'pixel', text: message.text }]
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [])

  function send(event: Event) {
    event.preventDefault()
    const text = draft.value.trim()
    const socket = socketRef.current
    if (!text || !socket) return
    // The payload matches the channel's SocketChannelReceivedMessage DTO.
    socket.emit('message', { chatId: chatIdRef.current, senderName: 'You', text })
    lines.value = [...lines.value, { from: 'you', text }]
    draft.value = ''
  }

  return (
    <div class={styles.box}>
      <div class={styles.header}>
        <span class={connected.value ? `${styles.dot} ${styles.dotOn}` : styles.dot} />
        <strong class={styles.title}>PixelBot</strong>
        <span class={styles.status}>{connected.value ? 'connected' : 'connecting…'} · /pixel</span>
      </div>

      <div class={styles.messages}>
        {lines.value.length === 0 ? (
          <p class={styles.empty}>Say hi to PixelBot over the socket channel…</p>
        ) : (
          lines.value.map((line, i) => (
            <div
              key={i}
              class={`${styles.msg} ${line.from === 'you' ? styles.msgYou : styles.msgPixel}`}
            >
              {line.text}
            </div>
          ))
        )}
      </div>

      <form onSubmit={send} class={styles.form}>
        <input
          value={draft}
          onInput={(e) => (draft.value = (e.target as HTMLInputElement).value)}
          placeholder="Message PixelBot"
          class={styles.input}
        />
        <button type="submit" disabled={!connected.value} class={styles.send}>
          Send
        </button>
      </form>
    </div>
  )
}

export default island(ChatBox)
