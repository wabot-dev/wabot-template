// Evals: tests of Pixel's REAL behavior with real models.
// The bot runs with its production LLMs (via OpenRouter, like at runtime)
// and an LLM judge grades the conversation against natural-language criteria.
//
// Requires OPENROUTER_API_KEY in .env. Run with: npm run test:eval
// These calls consume tokens — keep evals few and high-value.

import assert from 'node:assert/strict'
import test from 'node:test'

import {
  container,
  OpenRouterChatAdapter,
  runChatAdapters,
  UnionChatAdapter,
} from '@wabot-dev/framework'
import {
  createChatControllerHarness,
  LlmJudge,
  useMemoryRepositories,
} from '@wabot-dev/framework/testing'

import { PixelChatController } from './PixelChatController'

useMemoryRepositories()

// Same adapters as production; the UnionChatAdapter routes by provider
// according to the mindset's models().
runChatAdapters([OpenRouterChatAdapter])
const realLlm = container.resolve(UnionChatAdapter)

// A cheap judge, independent from the primary model under test
const judge = new LlmJudge({
  adapter: container.resolve(OpenRouterChatAdapter),
  models: [{ model: 'qwen/qwen3.6-flash' }],
})

test('Pixel greets and asks for a language before talking games', async () => {
  // Same harness as in unit tests, but operated by the real LLM
  const harness = createChatControllerHarness({ controller: PixelChatController, adapter: realLlm })

  await harness.invoke('onMessage', 'hi!')

  await judge.assert({
    transcript: await harness.history(),
    criteria: `
      The bot greets the player in english with a short line,
      asks which language they want to chat in,
      and does NOT start talking about games yet.
    `,
  })
})

test('Pixel adds a purchased game using the addToBacklog tool', async () => {
  const harness = createChatControllerHarness({ controller: PixelChatController, adapter: realLlm })

  await harness.invoke('onMessage', 'english please')
  await harness.invoke('onMessage', 'I just bought Hades, add it to my pile')

  // Structural assertion: the right tool ran successfully
  const history = await harness.history()
  const call = history.find(
    (item) => item.type === 'functionCall' && item.functionCall.name === 'addToBacklog',
  )
  assert.ok(call, 'the bot should call addToBacklog')

  // Behavioral assertion: the judge grades the player-facing reply
  await judge.assert({
    transcript: history,
    criteria: `
      The bot confirms that Hades was added to the player's backlog,
      replying in english, short and playful, in plain text
      (no raw JSON, no code blocks).
    `,
  })
})
