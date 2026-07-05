import Echo from './Echo.island'

// A plain server component: it renders to static HTML and ships no JavaScript.
// The <Echo/> island embedded below is the only part that hydrates on the client.
export function HomePage() {
  return (
    <main style="max-width: 40rem; margin: 4rem auto; padding: 0 1rem; font-family: system-ui, sans-serif; line-height: 1.6;">
      <h1 style="margin-bottom: 0.25rem;">PixelBot</h1>
      <p style="color: #555;">
        Server-rendered with <code>@wabot-dev/framework/ui</code>. Everything here is static HTML
        except the box below — an <strong>island</strong> that ships its own JavaScript and
        hydrates in the browser.
      </p>
      <Echo />
    </main>
  )
}
