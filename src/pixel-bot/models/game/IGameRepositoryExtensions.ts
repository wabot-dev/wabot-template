import { Game } from './Game'

export interface IGameRepositoryExtensions {
  findLongestInBacklog(userId: string, limit: number): Promise<Game[]>
}
