import ChatBox from './ChatBox.island'
import Echo from './Echo.island'
import styles from './HomePage.module.css'

// A plain server component: it renders to static HTML and ships no JavaScript.
// Styling comes from a CSS module — `styles.x` is a scoped class name, resolved
// identically on the server (via @wabot-dev/framework/ui/css-loader) and in the
// island client bundle. The islands embedded below are the only parts that hydrate.
export function HomePage() {
  return (
    <main class={styles.main}>
      <h1 class={styles.title}>PixelBot</h1>
      <p class={styles.lead}>
        Server-rendered with <code>@wabot-dev/framework/ui</code>. Styling uses CSS modules; the
        islands are the only parts that ship JavaScript and hydrate in the browser.
      </p>

      <h2 class={styles.section}>Chat over a socket channel</h2>
      <p class={styles.lead}>
        The box below is a browser <strong>socket client</strong> for PixelBot's <code>@socket</code>{' '}
        chat channel: messages travel over Socket.IO (namespace <code>/pixel</code>) to the same bot
        the terminal <code>@cmd</code> channel talks to.
      </p>
      <ChatBox />

      <h2 class={styles.section}>Action round-trip</h2>
      <p class={styles.lead}>
        And a plain <code>@action</code>: the island POSTs JSON and renders the reply.
      </p>
      <Echo />
    </main>
  )
}
