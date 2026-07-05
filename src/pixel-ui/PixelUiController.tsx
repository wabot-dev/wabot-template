import { isNotEmpty, isString } from '@wabot-dev/framework'
import { uiController, view, action } from '@wabot-dev/framework/ui'
import { HomePage } from './HomePage'

// Action input is a validated DTO, exactly like a rest-controller request model.
class EchoDto {
  @isString()
  @isNotEmpty()
  message?: string
}

// A @uiController server-renders web pages (@view -> GET) and exposes JSON
// endpoints for its islands (@action -> POST <path>/_action/<name>). The runner
// discovers it from src/ — no manual registration. See the `wabot-ui` skill.
@uiController('/')
export class PixelUiController {
  @view({ title: 'PixelBot' })
  index() {
    return <HomePage />
  }

  // POST /_action/echo — called by the Echo island via callAction().
  @action()
  echo(input: EchoDto) {
    return { reply: `PixelBot heard: ${input.message}` }
  }
}
