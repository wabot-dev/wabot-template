import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { Chat } from '@wabot-dev/framework'
import {
  createChatBotHarness,
  entityFixture,
  useMemoryRepositories,
} from '@wabot-dev/framework/testing'
import { NovaMindset } from './NovaMindset'

// Deterministic: no LLM, no database. The mindset's tools run for real against
// in-memory repositories, driven by a scripted mock adapter.
useMemoryRepositories()

function harness() {
  return createChatBotHarness({
    mindset: NovaMindset,
    // Tools inject `Chat` to scope tasks, so the harness needs one.
    register: [
      [
        Chat,
        entityFixture(Chat, {
          type: 'PRIVATE',
          connections: [{ chatType: 'PRIVATE', channelName: 'TestChannel', id: 'test-chat' }],
        }),
      ],
    ],
  })
}

describe('Nova', () => {
  it('adds a task and lists it as pending', async () => {
    const nova = harness()

    await nova.callTool('addTask', { title: 'Buy milk' })
    const listed = await nova.callTool('listTasks', { done: false })

    assert.match(listed, /Buy milk/)
  })

  it('completes a task so it drops out of the pending list', async () => {
    const nova = harness()

    const added = await nova.callTool('addTask', { title: 'Ship the release' })
    const taskId = JSON.parse(added).id as string

    await nova.callTool('completeTask', { taskId })

    const pending = await nova.callTool('listTasks', { done: false })
    const done = await nova.callTool('listTasks', { done: true })

    assert.doesNotMatch(pending, /Ship the release/)
    assert.match(done, /Ship the release/)
  })

  it('rejects a task with no title before the tool body runs', async () => {
    const nova = harness()

    const result = await nova.callTool('addTask', { title: '' })

    assert.match(result, /INVALID_ARGUMENTS/)
  })

  it('reads the clock through a tool, fresh on every call', async () => {
    const nova = harness()
    const before = Date.now()

    const result = JSON.parse(await nova.callTool('currentTime'))

    const reported = Date.parse(result.iso)
    assert.ok(!Number.isNaN(reported), 'currentTime returns a parsable ISO timestamp')
    assert.ok(reported >= before && reported <= Date.now(), 'the time is now, not boot time')
  })

  it('keeps the clock out of the cached system prompt', async () => {
    // describe() is cached per class, so a date rendered into it would freeze at
    // boot. The prompt must point at the tool instead of naming a day.
    const prompt = await harness().systemPrompt()

    assert.doesNotMatch(prompt, /\b\d{4}-\d{2}-\d{2}\b/, 'no ISO date baked into the prompt')
    assert.doesNotMatch(
      prompt,
      /\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/,
      'no rendered date string baked into the prompt',
    )
    assert.match(prompt, /currentTime/, 'the prompt tells the model to ask for the time')
  })

  it('answers over the chat loop, calling a tool then replying', async () => {
    const nova = harness()
    nova.adapter
      .callTool('addTask', { title: 'Water the plants' })
      .reply('Added: water the plants.')

    const turn = await nova.send('I need to water the plants')

    assert.deepEqual(
      turn.toolCalls.map((call) => call.name),
      ['addTask'],
    )
    assert.match(turn.replies.map((reply) => reply.text ?? '').join(' '), /water the plants/i)
  })
})
