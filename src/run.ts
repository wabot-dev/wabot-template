import { runServer } from '@wabot-dev/framework'
import { MyController } from './controllers/MyController'

runServer({
  controllers: [MyController],
})
