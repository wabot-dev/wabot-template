import {
  ChatBotAdapter,
  ChatRepository,
  OpenaiChatBotAdapter,
  RamChatRepository,
  RamUserRepository,
  runServer,
  UserRepository,
} from '@wabot-dev/framework'
import { MyController } from './controllers/MyController'

runServer({
  controllers: [MyController],
  providers: [
    {
      replace: ChatRepository,
      with: RamChatRepository,
      singleton: true,
    },
    {
      replace: UserRepository,
      with: RamUserRepository,
      singleton: true,
    },
    {
      replace: ChatBotAdapter,
      with: OpenaiChatBotAdapter,
    },
  ],
})
