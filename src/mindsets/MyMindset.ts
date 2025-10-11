import { IMindsetLlm, mindset, type IMindset, type IMindsetIdentity } from '@wabot-dev/framework'

@mindset()
export class MyMindset implements IMindset {
  async workflow(): Promise<string> {
    return ``
  }

  async llms(): Promise<IMindsetLlm[]> {
    return [
      {
        model: 'gpt-4o',
        provider: 'openai',
      },
    ]
  }

  async identity(): Promise<IMindsetIdentity> {
    return {
      name: 'Elia',
      language: 'Español',
    }
  }

  async skills(): Promise<string> {
    return 'Saber sobre pokemons, sus poderes y su historia'
  }

  async limits(): Promise<string> {
    return ''
  }
}
