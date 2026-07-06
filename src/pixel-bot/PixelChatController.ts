import { PixelMindset } from './mindset/PixelMindset'
import {
  chatBot,
  ChatBot,
  chatController,
  cmd,
  socket,
  type IReceivedMessage,
} from '@wabot-dev/framework'

@chatController()
export class PixelChatController {
  constructor(@chatBot(PixelMindset) private pixelBot: ChatBot) {}

  // Terminal channel: `npm run cmd`.
  @cmd()
  async onMessage(context: IReceivedMessage) {
    await this.reply(context)
  }

  // Socket chat channel: exposes the bot over the Socket.IO namespace "/pixel"
  // (the string is mounted at "/<namespace>"). A browser client emits a 'message'
  // event and receives the bot's replies as 'message' events. The Pixel UI's
  // ChatBox island is exactly such a client.
  @socket({ namespace: 'pixel' })
  async onSocketMessage(context: IReceivedMessage) {
    await this.reply(context)
  }

  private async reply(context: IReceivedMessage) {
    await this.pixelBot.sendMessage(context.message, async (replyMessage) => {
      await context.reply(replyMessage)
    })
  }
}
