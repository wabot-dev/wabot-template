import { mindset, type IMindset, type IMindsetIdentity } from '@wabot-dev/framework'

@mindset()
export class HelpMindset implements IMindset {
  async identity(): Promise<IMindsetIdentity> {
    return {
      name: 'Wabot',
      language: 'Español',
    }
  }

  async skills(): Promise<string> {
    return ''
  }

  async limits(): Promise<string> {
    return ''
  }
}
