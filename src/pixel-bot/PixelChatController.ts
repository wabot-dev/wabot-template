import { PixelMindset } from './mindset/PixelMindset'
import { chatBot, ChatBot, chatController, cmd, type IReceivedMessage } from '@wabot-dev/framework'

@chatController()
export class PixelChatController {
  constructor(@chatBot(PixelMindset) private pixelBot: ChatBot) {}

  @cmd()
  async onMessage(context: IReceivedMessage) {
    await this.pixelBot.sendMessage(context.message, async (replyMessage) => {
      await context.reply(replyMessage)
    })
  }
}
