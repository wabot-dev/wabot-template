# @wabot-dev/template

Starter template for building chat bots with the [`@wabot-dev/framework`](https://www.npmjs.com/package/@wabot-dev/framework).

It ships with a working example bot — **Pixel**, a retro game librarian that helps the player manage their videogame backlog — so you can clone, run, and use it as a reference while building your own.

## Requirements

- Node.js **22** (see [.nvmrc](.nvmrc))
- A PostgreSQL database (optional — the framework also has an in-memory store for local development)
- Credentials for AI provider

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the env file and fill in the values:

   ```bash
   cp .env.example .env
   ```

   | Variable             | Description                                                                  |
   | -------------------- | ---------------------------------------------------------------------------- |
   | `DEBUG`              | Debug namespaces to enable (e.g. `wabot:*:error,wabot:*:warn,wabot:*:info`)  |
   | `DATABASE_URL`       | PostgreSQL connection string (not use to use in-memory storage)          |
   | `OPENROUTER_API_KEY` | API key for OpenRouter (used by the included Pixel example)                  |
   | `OPENAI_API_KEY`     | API key for OpenAI                                                           |
   | `ANTHROPIC_API_KEY`  | API key for Anthropic                                                        |
   | `GOOGLE_API_KEY`     | API key for Google                                                           |

   Configure at least one AI provider key. The provider chosen in your mindset's `models()` (see [`PixelMindset`](src/pixel-bot/mindset/PixelMindset.ts)) determines which key is required — the included example uses `openrouter`, so `OPENROUTER_API_KEY` is enough to run it as-is.

## Scripts

| Script              | Description                                                                |
| ------------------- | -------------------------------------------------------------------------- |
| `npm run dev`       | Run the bot in development mode (TypeScript via `@yucacodes/ts`)           |
| `npm run dev:watch` | Run in dev mode with file watching and preserved output                    |
| `npm run cmd:channel` | Open a local command channel client to interact with controllers         |
| `npm run build`     | Type-check and bundle to `./dist` with `tsup`                              |
| `npm start`         | Run the built bundle (`./dist/run.js`)                                     |
| `npm run tsc`       | Type-check only (no emit)                                                  |
| `npm run fmt`       | Format the codebase with Prettier                                          |
| `npm run test:unit` | Run unit tests matching `src/**/*.unit.test.ts`                            |

## Project structure

```
src/
├── _run_.ts                       # Entry point — calls framework `run()`
├── _cmd_.ts                       # Entry point for the command-channel client
└── pixel-bot/                     # Example bot
    ├── PixelChatController.ts     # @chatController — receives messages
    ├── config/
    │   └── language.ts            # Shared constants (association type, default lang)
    ├── mindset/
    │   └── PixelMindset.ts        # @mindset — identity, context, skills, workflow
    ├── models/
    │   └── game/
    │       ├── Game.ts                       # Entity definition
    │       ├── GameRepository.ts             # CrudRepository + memory & pg extensions
    │       └── IGameRepositoryExtensions.ts  # Custom query interface
    └── modules/
        ├── BacklogModule.ts       # Tools the LLM can call (add/start/finish/abandon games)
        └── LanguageModule.ts      # Tool to set the conversation language
```

### How the example fits together

- **`PixelChatController`** receives each incoming message and forwards it to the `PixelMindset` bot, which replies through the same channel.
- **`PixelMindset`** describes Pixel's persona (identity, context, skills, limits, workflow) and lists the LLM providers/models to try.
- **`LanguageModule`** and **`BacklogModule`** expose decorated methods (`@description`, `@isString`, etc.) that the LLM can invoke as tools. Each one validates its input and updates state via the repository or the chat associations.
- **`GameRepository`** is a `CrudRepository<Game>` with two query extensions — one in-memory (`@memoryExtension`) used when `DATABASE_URL` is empty, and one for PostgreSQL (`@pgExtension`) used otherwise.

## Local persistence

When running without a database, the framework writes state under `.wabot/` (see [.gitignore](.gitignore)):

- `.wabot/in-memory/` — JSON files holding entities and chat history
- `.wabot/cmd-channel/` — UNIX socket and metadata for the command-channel client

## Docker

A minimal [Dockerfile](Dockerfile) is included:

```bash
docker build -t my-bot .
docker run --env-file .env -p 3000:3000 my-bot
```

## Building your own bot

1. Replace (or add alongside) the `pixel-bot/` folder with your own module.
2. Define your `@mindset` describing who the bot is and what it can do.
3. Add `@mindsetModule` classes that expose the actions the LLM can call.
4. Model persistent state with `Entity` + `CrudRepository`, and add a `@memoryExtension` and/or `@pgExtension` for any custom queries.
5. Wire it up with a `@chatController` that injects the bot via `@chatBot(YourMindset)`.

## License

ISC
