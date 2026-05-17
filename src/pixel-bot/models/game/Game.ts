import { Entity, IEntityData } from '@wabot-dev/framework'

export type IGameStatus = 'backlog' | 'playing' | 'finished' | 'abandoned'

export interface IGameData extends IEntityData {
  userId: string
  title: string
  status: IGameStatus
  hoursPlayed: number
  addedAt: number
}

export class Game extends Entity<IGameData> {}
