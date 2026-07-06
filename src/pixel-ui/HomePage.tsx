import ChatBox from './ChatBox.island'
import Echo from './Echo.island'

// A plain server component: it renders to static HTML and ships no JavaScript.
// The islands embedded below are the only parts that hydrate on the client.
export function HomePage() {
  return (
    <main style="max-width: 40rem; margin: 4rem auto; padding: 0 1rem; font-family: system-ui, sans-serif; line-height: 1.6;">
      <h1 style="margin-bottom: 0.25rem;">PixelBot</h1>
      <p style="color: #555;">
        Server-rendered with <code>@wabot-dev/framework/ui</code>. Everything here is static HTML
        except the islands — components that ship their own JavaScript and hydrate in the browser.
      </p>

      <h2 style="margin-top: 2.5rem; font-size: 1.25rem;">Chat over a socket channel</h2>
      <p style="color: #555;">
        The box below is a browser <strong>socket client</strong> for PixelBot's{' '}
        <code>@socket</code> chat channel: messages travel over Socket.IO (namespace{' '}
        <code>/pixel</code>) to the same bot the terminal <code>@cmd</code> channel talks to.
      </p>
      <ChatBox />

      <h2 style="margin-top: 2.5rem; font-size: 1.25rem;">Action round-trip</h2>
      <p style="color: #555;">
        And a plain <code>@action</code>: the island POSTs JSON and renders the reply.
      </p>
      <Echo />
    </main>
  )
}
