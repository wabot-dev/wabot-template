# @wabot-dev/template

Starter template for building AI chat bots — and the web UI around them — with
[`@wabot-dev/framework`](https://www.npmjs.com/package/@wabot-dev/framework).

This is the official template cloned by the project creator:

```bash
npm create @wabot-dev my-wabot-app
```

It ships a small working bot — **Nova**, a to-do assistant you talk to from your
terminal — so you can run it first and read it as a reference. Nothing in it needs
an external service: no WhatsApp, no Telegram, no database. Just a model and your
terminal.

Prefer a blank slate? Scaffold the **empty** starter instead (the creator asks),
or delete `src/nova/` — `run()` discovers whatever is in `src/`, so removing it
leaves a working, empty app.

## Requirements

- Node.js **22** (see [.nvmrc](.nvmrc))
- An API key for one AI provider — the included bot uses **OpenRouter**
- PostgreSQL — **optional**; leave `DATABASE_URL` empty to use the in-memory store

## Setup

```bash
npm install
cp .env.example .env      # then uncomment OPENROUTER_API_KEY and set it
npm run dev               # starts the app
```

Then, in a **second terminal**, talk to Nova:

```bash
npm run cmd
```

```
NovaChatController.onMessage > I need to buy milk and water the plants
[Nova]: I added both items to your list.

NovaChatController.onMessage > mark the milk one as done
[Nova]: Done! I marked buy milk as complete.
```

Tasks persist between messages. With no `DATABASE_URL` they land in
`.wabot/in-memory/task.json`; point it at PostgreSQL and the same code stores them
there instead.

### Environment

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
├── _run_.ts                  # entry point — calls run(config)
├── _cmd_.ts                  # entry point for the terminal chat client
├── css.d.ts                  # CSS / CSS-module types, from the framework
└── nova/                     # the example bot
    ├── NovaMindset.ts        # @mindset — who Nova is, and which models to use
    ├── NovaChatController.ts # @chatController — @cmd terminal channel
    ├── Nova.unit.test.ts     # deterministic tests (no LLM, no database)
    ├── tools/
    │   ├── TaskTools.ts      # @tools — what the model can actually call
    │   └── ClockTools.ts     # @tools — reads the clock on demand
    └── models/
        ├── Task.ts           # Entity — a to-do item
        └── TaskRepository.ts # @repository + @query — storage, no SQL
```

Everything under `src/` is **auto-discovered**: mindsets, chat/REST/socket/UI
controllers, repositories, command and cron handlers. The scanner picks up
`.ts/.tsx/.js/.jsx` and skips `_run_.ts`, `_cmd_.ts`, `*.d.ts`, test files
(`*.unit.test.ts`, `*.integration.test.ts`, …) and any directory whose name starts
with `__`.

## How the example fits together

Nova is four small pieces. Read them in this order — it's the shape of every
Wabot bot.

**[`NovaMindset`](src/nova/NovaMindset.ts)** — _who the bot is_. `describe()`
returns the persona (`identity` + `context`/`skills`/`limits`/`workflow`), which
the framework assembles into the system prompt; `models()` lists the models to try
in order. You never write the prompt by hand.

**[`TaskTools`](src/nova/tools/TaskTools.ts)** and
[`ClockTools`](src/nova/tools/ClockTools.ts) — _what the model can do_. Every
method tagged `@description` becomes a tool the LLM can call, and its request class
is validated first, so a tool body never sees malformed input. Listed on the
mindset via `@mindset({ tools: [TaskTools, ClockTools] })`.

`ClockTools` is there for a reason worth copying: `describe()` is **cached**, so a
date rendered into the persona would freeze at boot and the bot would insist on the
wrong day forever. Anything that changes over time belongs in a tool the model
calls when it needs it — the prompt stays static and cacheable.

**[`Task`](src/nova/models/Task.ts) + [`TaskRepository`](src/nova/models/TaskRepository.ts)**
— _state_. The `@query()` declares are implemented from their method names, and run
against whichever adapter is active — in-memory or PostgreSQL. There is no SQL in
this project.

**[`NovaChatController`](src/nova/NovaChatController.ts)** — _how people reach it_.
`@cmd()` is the local terminal channel. Adding `@telegram()`, `@wasender()` or
`@socket({ namespace })` handlers alongside it serves the same bot elsewhere —
that's the only part that pulls in an outside service.

**[`Nova.unit.test.ts`](src/nova/Nova.unit.test.ts)** — `npm run test:unit` runs
the real tools and validation against a scripted mock model, so it needs no API key
and no database.

### Make it yours

Rename the folder and rewrite `describe()` — that alone gives you a different bot.
Then swap `TaskTools` for tools that call your code, and model your own state with
`Entity` + `CrudRepository`. To start from nothing instead, delete `src/nova/`.

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
