import { MyMindset } from '@/mindsets/MyMindset'
import { chatBot, ChatBot, chatController, cmd, type IReceivedMessage } from '@wabot-dev/framework'

@chatController()
export class MyChatController {
  constructor(@chatBot(MyMindset) private myBot: ChatBot) {}

  @cmd()
  async onMessage(context: IReceivedMessage) {
    await this.myBot.sendMessage(context.message, async (replyMessage) => {
      await context.reply(replyMessage)
    })
  }
}
