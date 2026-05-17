import {
  description,
  isIn,
  isNotEmpty,
  isNumber,
  isString,
  max,
  min,
  mindsetModule,
} from '@wabot-dev/framework'
import { GameRepository } from '../models/game/GameRepository'
import { Game } from '../models/game/Game'

const DEFAULT_USER_ID = 'player-one'

function summarize(game: Game) {
  const data = (game as any).data
  return {
    id: game.id,
    title: data.title as string,
    status: data.status as string,
    hoursPlayed: data.hoursPlayed as number,
    addedAt: new Date(data.addedAt as number).toISOString(),
  }
}

export class AddGameRequest {
  @isString()
  @isNotEmpty()
  @description('The title of the game to add to the backlog')
  title!: string
}

export class GameIdRequest {
  @isString()
  @isNotEmpty()
  @description('The id of the game')
  gameId!: string
}

export class FinishGameRequest {
  @isString()
  @isNotEmpty()
  @description('The id of the game that was finished')
  gameId!: string

  @isNumber()
  @min(0)
  @max(2000)
  @description('Total hours the player spent on this game')
  hoursPlayed: number = 0
}

export class ListGamesRequest {
  @isString()
  @isIn(['backlog', 'playing', 'finished', 'abandoned'])
  @description('Filter by status: "backlog", "playing", "finished" or "abandoned"')
  status: 'backlog' | 'playing' | 'finished' | 'abandoned' = 'backlog'

  @isNumber()
  @min(1)
  @max(20)
  @description('Maximum number of games to return')
  limit: number = 5
}

@mindsetModule({ language: 'english' })
export class BacklogModule {
  constructor(private games: GameRepository) {}

  @description("Add a new game to the player's backlog")
  async addToBacklog(req: AddGameRequest) {
    const game = new Game({
      userId: DEFAULT_USER_ID,
      title: req.title,
      status: 'backlog',
      hoursPlayed: 0,
      addedAt: Date.now(),
    })
    await this.games.create(game)
    return summarize(game)
  }

  @description('Mark a game as currently being played')
  async startPlaying(req: GameIdRequest) {
    const game = await this.games.findOrThrow(req.gameId)
    game.update({ status: 'playing' })
    await this.games.update(game)
    return summarize(game)
  }

  @description('Mark a game as finished and record total hours played')
  async finishGame(req: FinishGameRequest) {
    const game = await this.games.findOrThrow(req.gameId)
    game.update({ status: 'finished', hoursPlayed: req.hoursPlayed })
    await this.games.update(game)
    return summarize(game)
  }

  @description('Abandon a game the player will not finish')
  async abandonGame(req: GameIdRequest) {
    const game = await this.games.findOrThrow(req.gameId)
    game.update({ status: 'abandoned' })
    await this.games.update(game)
    return summarize(game)
  }

  @description("List the player's games filtered by status")
  async listGames(req: ListGamesRequest) {
    const games = await this.games.findByUserIdAndStatus(DEFAULT_USER_ID, req.status)
    return games.slice(0, req.limit).map(summarize)
  }

  @description('List the games that have been sitting in the backlog the longest')
  async listOldestBacklog(req: ListGamesRequest) {
    const games = await this.games.findLongestInBacklog(DEFAULT_USER_ID, req.limit)
    return games.map(summarize)
  }

  @description('Count how many games are still waiting in the backlog')
  async backlogSize() {
    const count = await this.games.countByUserIdAndStatus(DEFAULT_USER_ID, 'backlog')
    return { backlog: count }
  }
}
