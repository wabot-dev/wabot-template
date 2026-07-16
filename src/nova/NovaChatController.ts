import { chatBot, ChatBot, chatController, cmd, type IReceivedMessage } from '@wabot-dev/framework'
import { NovaMindset } from './NovaMindset'

/**
 * Connects Nova to a channel. `@cmd()` is the local terminal channel — run the
 * app with `npm run dev`, then `npm run cmd` in a second terminal to chat.
 *
 * Other channels are just more handlers on this class: add `@telegram()`,
 * `@wasender()` or `@socket({ namespace })` and the same bot answers there.
 */
@chatController()
export class NovaChatController {
  constructor(@chatBot(NovaMindset) private nova: ChatBot) {}

  @cmd()
  async onMessage(context: IReceivedMessage) {
    await this.nova.sendMessage(context.message, async (reply) => {
      await context.reply(reply)
    })
  }
}
