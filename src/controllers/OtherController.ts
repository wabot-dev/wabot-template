import { HelpMindset } from '@/mindsets/HelpMindset'
import { MyMindset } from '@/mindsets/MyMindset'
import {
  chatBot,
  ChatBot,
  chatController,
  cmd,
  telegram,
  type IReceivedMessage,
} from '@wabot-dev/framework'

@chatController()
export class MyController {
  constructor(
    @chatBot(MyMindset) private myBot: ChatBot,
    @chatBot(HelpMindset) private helpBot: ChatBot,
  ) {}

  @telegram({
    botToken: process.env.TELEGRAM_BOT_TOKEN!,
  })
  onMessage(context: IReceivedMessage) {
    this.myBot.sendMessage(context.message, (replyMessage) => {
      context.reply(replyMessage)
    })
  }

  @cmd()
  onCmdInput(context: IReceivedMessage) {
    this.helpBot.sendMessage(context.message, (replyMessage) => {
      context.reply(replyMessage)
    })
  }
}
