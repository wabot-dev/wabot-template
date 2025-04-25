import { MyMindset } from '@/mindsets/MyMindset'
import { chatBot, ChatBot, chatController, cmd, type IMessageContext } from '@wabot-dev/framework'

@chatController()
export class MyController {
  constructor(@chatBot(MyMindset) private myBot: ChatBot) {}

  @cmd()
  onMessage(context: IMessageContext) {
    this.myBot.sendMessage(context.message, (replyMessage) => {
      context.reply(replyMessage)
    })
  }
}
