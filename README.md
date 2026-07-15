# @wabot-dev/template

Starter template for building AI chat bots — and the web UI around them — with
[`@wabot-dev/framework`](https://www.npmjs.com/package/@wabot-dev/framework).

This is the official template cloned by the project creator:

```bash
npm create @wabot-dev my-wabot-app
```

It ships an empty `src/` wired to the framework runner. You add a mindset, a chat
controller or a UI controller, and `run()` discovers and starts it — there is no
registry to update and no bundler to configure.

## Requirements

- Node.js **22** (see [.nvmrc](.nvmrc))
- PostgreSQL — **optional**; leave `DATABASE_URL` empty to use the in-memory store
- An API key for at least one AI provider (only needed to actually talk to a model)

## Setup

```bash
npm install
cp .env.example .env      # then uncomment one provider key
npm run dev
```

| Variable                                                                   | Description                                                                            |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `DEBUG`                                                                    | Debug namespaces to enable (e.g. `wabot:*:error,wabot:*:warn,wabot:*:info`)            |
| `DATABASE_URL`                                                             | PostgreSQL connection string. Leave empty for the in-memory store (tables auto-create) |
| `OPENROUTER_API_KEY` `OPENAI_API_KEY` `ANTHROPIC_API_KEY` `GOOGLE_API_KEY` | Provider keys. Set the one your mindset's `models()` uses                              |

> Uncomment **only** the provider keys you actually use. The framework rejects a
> key that is defined but empty, so an unused `OPENAI_API_KEY=` fails at boot.

## Scripts

| Script                | Description                                                                |
| --------------------- | -------------------------------------------------------------------------- |
| `npm run dev`         | Run in development (TypeScript via `@yucacodes/ts`, CSS via the UI loader) |
| `npm run dev:watch`   | Same, with file watching and preserved output                              |
| `npm run cmd`         | Terminal chat client — talk to your bot over the local command channel     |
| `npm run build`       | Bundle to `./dist` (`entry.js` + island assets under `dist/ui/`)           |
| `npm start`           | Run the built bundle (`dist/entry.js`)                                     |
| `npm run tsc`         | Type-check only (no emit)                                                  |
| `npm run fmt`         | Format with Prettier (`fmt:check` to verify)                               |
| `npm run test:unit`   | Unit tests — `src/**/*.unit.test.ts`                                       |
| `npm run test:eval`   | LLM evals against real providers — `src/**/*.eval.test.ts`                 |
| `npm run skills:sync` | Refresh the agent skills to match the installed framework version          |

## Project structure

```
src/
├── _run_.ts     # entry point — calls run(config)
├── _cmd_.ts     # entry point for the terminal chat client
└── css.d.ts     # ambient types for CSS / CSS-module imports
```

Everything else you add under `src/` is **auto-discovered**: mindsets, chat/REST/
socket/UI controllers, repositories, command and cron handlers. The scanner picks
up `.ts/.tsx/.js/.jsx` and skips `_run_.ts`, `_cmd_.ts`, `*.d.ts`, test files
(`*.unit.test.ts`, `*.integration.test.ts`, …) and any directory whose name starts
with `__`.

## Building your bot

A **mindset** is who the bot is; a **chat controller** connects it to channels.

```ts
// src/bot/NovaMindset.ts
import {
  mindset,
  type IMindset,
  type IMindsetDescription,
  type IMindsetModels,
} from '@wabot-dev/framework'

@mindset()
export class NovaMindset implements IMindset {
  async describe(): Promise<IMindsetDescription> {
    return {
      identity: { name: 'Nova', language: 'english', personality: 'Warm and concise.' },
      context: 'You help visitors learn about the product.',
      skills: 'Answer questions and hand off to a human when unsure.',
      limits: 'Never invent prices. Reply in plain text.',
      workflow: 'Greet → understand the need → answer → offer next step.',
    }
  }

  async models(): Promise<IMindsetModels> {
    return { llm: [{ provider: 'openai', model: 'gpt-4.1' }] }
  }
}
```

```ts
// src/bot/NovaChatController.ts
import { chatBot, ChatBot, chatController, cmd, type IReceivedMessage } from '@wabot-dev/framework'
import { NovaMindset } from './NovaMindset'

@chatController()
export class NovaChatController {
  constructor(@chatBot(NovaMindset) private nova: ChatBot) {}

  @cmd() // talk to it with `npm run cmd`
  async onCmd(ctx: IReceivedMessage) {
    await this.nova.sendMessage(ctx.message, async (reply) => {
      await ctx.reply(reply)
    })
  }
}
```

Add `@wasender()`, `@telegram()` or `@socket({ namespace })` handlers to serve the
same bot on other channels. Give the mindset **tools** (`@mindset({ tools: [...] })`)
to let the model call your code, and model state with `Entity` + `CrudRepository`.

## Web UI

The template is configured for the framework's UI layer out of the box — server-
rendered Preact that ships JavaScript only for the interactive parts ("islands").

```tsx
// src/web/HomeController.tsx
import { uiController, view } from '@wabot-dev/framework/ui'
import Counter from './Counter.island'

@uiController('/')
export class HomeController {
  @view({ title: 'Home' })
  index() {
    return (
      <main>
        <h1>Hello</h1>
        <Counter start={3} />
      </main>
    )
  }
}
```

```tsx
// src/web/Counter.island.tsx
import { island, useSignal } from '@wabot-dev/framework/ui'
import styles from './counter.module.css'

function Counter({ start = 0 }: { start?: number }) {
  const count = useSignal(start)
  return (
    <button class={styles.btn} onClick={() => count.value++}>
      {count}
    </button>
  )
}

export default island(Counter)
```

`npm run dev` → the view is server-rendered at `/`, the island hydrates on the
client, and its CSS module is scoped and injected automatically.

Import everything UI-related from `@wabot-dev/framework/ui` — never from `preact`
directly. An island must live in a `*.island.tsx` file and be its **default export**
via `island()`; a component that skips this renders fine but never hydrates.
Views also support `@action` handlers (POST), `redirect()`, guards, app-shell
layouts with boosted navigation, and static generation (SSG/ISR).

What makes this work is already wired up, and is worth knowing if you change it:

- **[tsconfig.json](tsconfig.json)** — `"jsx": "react-jsx"` with
  `"jsxImportSource": "@wabot-dev/framework/ui"` compiles JSX through the framework.
- **`--import=@wabot-dev/framework/ui/css-loader`** on `dev`, `dev:watch` and
  `test:unit` — registers the Node hooks that make `import styles from './x.module.css'`
  work under SSR. Without it, importing CSS fails with `ERR_UNKNOWN_FILE_EXTENSION`.
  `build`/`start` don't need it (esbuild handles CSS); `cmd` doesn't touch UI.
- **[src/css.d.ts](src/css.d.ts)** — ambient types: `*.module.css` → scoped class
  map, plain `*.css` → the served URL (pass it to `@uiController({ head: { stylesheets } })`).

## Agent skills

The framework ships agent skills documenting each subsystem (chat, mindsets, UI,
persistence, auth, testing, …). The creator installs them into `.claude/`, `.codex/`
and/or `.agents/`. After upgrading the framework, refresh them:

```bash
npm run skills:sync
```

## Local persistence

Without a database the framework keeps state under `.wabot/` (gitignored):

- `.wabot/in-memory/` — JSON files holding entities and chat history
- `.wabot/cmd-channel/` — UNIX socket and metadata for the terminal client

## Docker

```bash
docker build -t my-bot .
docker run --env-file .env -p 3000:3000 my-bot
```

## Learn more

- Documentation — https://docs.wabot.dev
- The agent skills in `.claude/skills/` (or `.agents/skills/`) are the most precise
  reference for each subsystem's API.

## License

ISC
