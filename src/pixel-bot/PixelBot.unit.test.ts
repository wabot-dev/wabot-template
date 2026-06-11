// Deterministic tests for the Pixel bot: no LLM API calls, no database.
// The MockChatAdapter plays the LLM role (you script its turns) while the
// framework runs everything else for real: the controller, the mindset,
// the tool loop, argument validation and the (in-RAM) repository.
//
// Run with: npm run test:unit

import assert from 'node:assert/strict'
import test from 'node:test'

import { container } from '@wabot-dev/framework'
import { createChatControllerHarness, useMemoryRepositories } from '@wabot-dev/framework/testing'

import { PixelChatController } from './PixelChatController'
import { GameRepository } from './models/game/GameRepository'

// Back every @repository with an in-RAM store. Call once, before anything
// resolves a repository.
useMemoryRepositories()

test('Pixel replies through the channel with its identity', async () => {
  const harness = createChatControllerHarness({ controller: PixelChatController })
  harness.adapter.reply('Welcome back, player one! Which language shall we use?')

  const turn = await harness.invoke('onMessage', 'hi')

  assert.equal(turn.replies.length, 1)
  assert.equal(turn.replies[0].senderName, 'Pixel')
  assert.match(turn.replies[0].text ?? '', /language/)
})

test('the tool loop stores a real game in the repository', async () => {
  const harness = createChatControllerHarness({ controller: PixelChatController })

  // LLM script: first it asks for the tool, then it confirms with text.
  // The framework executes addToBacklog FOR REAL (validation + module + repo).
  harness.adapter
    .callTool('addToBacklog', { title: 'Hollow Knight' })
    .reply('Hollow Knight joins the pile. Truly, dragons would be jealous.')

  const turn = await harness.invoke('onMessage', 'I just bought Hollow Knight')

  assert.equal(turn.toolCalls.length, 1)
  assert.equal(turn.toolCalls[0].name, 'addToBacklog')
  assert.match(turn.toolCalls[0].result ?? '', /Hollow Knight/)

  // ...and the effect is observable in the real (in-RAM) repository
  const games = container.resolve(GameRepository)
  const backlog = await games.findByUserIdAndStatus('player-one', 'backlog')
  assert.equal(backlog.length, 1)
})

test('invalid tool arguments come back as INVALID_ARGUMENTS, not a crash', async () => {
  const harness = createChatControllerHarness({ controller: PixelChatController })

  // hoursPlayed violates @max(2000); the validation error is sent back to the
  // LLM as the tool result, so the conversation can recover.
  harness.adapter
    .callTool('finishGame', { gameId: 'some-id', hoursPlayed: 99999 })
    .reply('Oops, that number of hours looks off.')

  const turn = await harness.invoke('onMessage', 'I finished it after 99999 hours')

  assert.match(turn.toolCalls[0].result ?? '', /INVALID_ARGUMENTS/)
  assert.match(turn.toolCalls[0].result ?? '', /hoursPlayed/)
})

test('setLanguage persists the choice through the real ChatOperator', async () => {
  const harness = createChatControllerHarness({ controller: PixelChatController })

  harness.adapter
    .callTool('setLanguage', { language: 'Spanish' })
    .reply('¡Perfecto! Hablemos en español.')

  const turn = await harness.invoke('onMessage', 'spanish please')

  assert.equal(turn.toolCalls[0].name, 'setLanguage')
  assert.match(turn.toolCalls[0].result ?? '', /spanish/)
})

test('chat memory persists across messages of the same connection', async () => {
  const harness = createChatControllerHarness({ controller: PixelChatController })
  harness.adapter.reply('Noted!').reply('You told me about Celeste, of course.')

  await harness.invoke('onMessage', 'remember that I love Celeste')
  await harness.invoke('onMessage', 'which game do I love?')

  // The second LLM request includes the previous turns
  const transcript = JSON.stringify(harness.adapter.lastRequest?.prevItems)
  assert.match(transcript, /Celeste/)

  const history = await harness.history()
  assert.equal(history.length, 4) // human, bot, human, bot
})
