// Deterministic tests for the Pixel UI controller: no browser, no bundling.
// createUiHarness mounts the @uiController on a private ephemeral-port server and
// runs the real pipeline (validation, SSR, actions). Islands render as static
// SSR HTML. See the `wabot-ui` and `wabot-testing` skills.
//
// Run with: npm run test:unit

import assert from 'node:assert/strict'
import test from 'node:test'

import { createUiHarness } from '@wabot-dev/framework/testing'

import { PixelUiController } from './PixelUiController'

test('server-renders the home page', async () => {
  const harness = await createUiHarness({ controllers: [PixelUiController] })
  try {
    const page = await harness.get('/')
    assert.equal(page.status, 200)
    assert.match(page.text, /PixelBot/)
    // The island renders as static SSR HTML in tests.
    assert.match(page.text, /Say something to PixelBot/)
  } finally {
    await harness.close()
  }
})

test('echo action validates its input and replies', async () => {
  const harness = await createUiHarness({ controllers: [PixelUiController] })
  try {
    const ok = await harness.action('/_action/echo', { message: 'hi' })
    assert.equal(ok.status, 200)
    assert.equal(ok.json().reply, 'PixelBot heard: hi')

    const bad = await harness.action('/_action/echo', { message: '' })
    assert.equal(bad.status, 400)
  } finally {
    await harness.close()
  }
})
