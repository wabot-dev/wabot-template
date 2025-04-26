import {
  ChatBotAdapter,
  ChatRepository,
  OpenaiChatBotAdapter,
  RamChatRepository,
  runServer,
} from '@wabot-dev/framework'
import { MyController } from './controllers/MyController'

runServer({
  controllers: [MyController],
  providers: [
    {
      replace: ChatRepository,
      with: RamChatRepository,
    },
    {
      replace: ChatBotAdapter,
      with: OpenaiChatBotAdapter,
    },
  ],
})
