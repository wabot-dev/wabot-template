import {
  ChatOperator,
  description,
  isNotEmpty,
  isString,
  mindsetModule,
} from '@wabot-dev/framework'
import { LANGUAGE_ASSOCIATION_TYPE } from '@/pixel-bot/config/language'

export class SetLanguageRequest {
  @isString()
  @isNotEmpty()
  @description(
    'The language the player wants to chat in, written in english and lowercase ' +
      '(for example: "english", "spanish", "french", "japanese")',
  )
  language: string = ''
}

@mindsetModule({ language: 'english' })
export class LanguageModule {
  constructor(private chat: ChatOperator) {}

  @description(
    'Save the language the player chose for the conversation. Call this ' +
      'as soon as the player tells you which language they want to speak.',
  )
  async setLanguage(req: SetLanguageRequest) {
    for (const existing of this.chat.findAssociations(LANGUAGE_ASSOCIATION_TYPE)) {
      await this.chat.removeAssociation(existing)
    }
    await this.chat.addAssociation({
      type: LANGUAGE_ASSOCIATION_TYPE,
      id: req.language.toLowerCase(),
    })
    return { language: req.language.toLowerCase() }
  }
}
