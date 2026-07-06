import { island, useSignal, useEffect, useRef } from '@wabot-dev/framework/ui'
import { io, type Socket } from 'socket.io-client'

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
    <div style="margin-top: 1.5rem; border: 1px solid #e5e5e5; border-radius: 10px; overflow: hidden; max-width: 32rem;">
      <div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 0.9rem; background: #fafafa; border-bottom: 1px solid #eee;">
        <span
          style={`width: 8px; height: 8px; border-radius: 50%; background: ${connected.value ? '#22c55e' : '#d4d4d4'};`}
        />
        <strong style="font-size: 0.9rem;">PixelBot</strong>
        <span style="color: #999; font-size: 0.75rem;">
          {connected.value ? 'connected' : 'connecting…'} · /pixel
        </span>
      </div>

      <div style="height: 15rem; overflow-y: auto; padding: 0.9rem; display: flex; flex-direction: column; gap: 0.5rem; background: #fff;">
        {lines.value.length === 0 ? (
          <p style="color: #999; margin: 0;">Say hi to PixelBot over the socket channel…</p>
        ) : (
          lines.value.map((line, i) => (
            <div
              key={i}
              style={`align-self: ${line.from === 'you' ? 'flex-end' : 'flex-start'}; max-width: 80%; padding: 0.4rem 0.7rem; border-radius: 10px; background: ${line.from === 'you' ? '#111' : '#f1f1f1'}; color: ${line.from === 'you' ? '#fff' : '#111'};`}
            >
              {line.text}
            </div>
          ))
        )}
      </div>

      <form
        onSubmit={send}
        style="display: flex; gap: 0.5rem; padding: 0.7rem; border-top: 1px solid #eee;"
      >
        <input
          value={draft}
          onInput={(e) => (draft.value = (e.target as HTMLInputElement).value)}
          placeholder="Message PixelBot"
          style="flex: 1; padding: 0.5rem 0.75rem; border: 1px solid #ccc; border-radius: 6px;"
        />
        <button
          type="submit"
          disabled={!connected.value}
          style="padding: 0.5rem 0.9rem; border: 0; border-radius: 6px; background: #111; color: #fff; cursor: pointer;"
        >
          Send
        </button>
      </form>
    </div>
  )
}

export default island(ChatBox)
