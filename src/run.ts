import {
  ChatAdapter,
  ChatRepository,
  container,
  WabotChatAdapter,
  PgChatRepository,
  runChatControllers,
  Env,
} from '@wabot-dev/framework'
import { MyChatController } from './controllers/MyChatController'
import { Pool } from 'pg'
const env = container.resolve(Env)

container.registerInstance(Pool, new Pool({ connectionString: env.requireString('DATABASE_URL') }))

container.registerType(ChatAdapter, WabotChatAdapter)
container.registerType(ChatRepository, PgChatRepository)

runChatControllers([MyChatController])
