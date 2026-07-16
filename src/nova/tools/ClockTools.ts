import { description, tools } from '@wabot-dev/framework'

/**
 * Reading the clock is a tool, not part of the persona: `describe()` is a static
 * string that gets cached, so a date baked into it would freeze at boot and the
 * bot would insist on the wrong day forever. Asking for the time on demand keeps
 * the answer fresh however long the process runs.
 *
 * A tool needs no parameters — omit the request class and the model calls it bare.
 */
@tools({ language: 'english' })
export class ClockTools {
  @description(
    'Get the current date and time. Call this whenever you need to know what day ' +
      'or time it is — never guess it, and never assume an earlier answer is still current.',
  )
  currentTime() {
    const now = new Date()
    return {
      iso: now.toISOString(),
      date: now.toDateString(),
      time: now.toTimeString().slice(0, 5),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }
  }
}
