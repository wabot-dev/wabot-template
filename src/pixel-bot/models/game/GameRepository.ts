import {
  CrudRepository,
  memExtension,
  MemoryRepositoryExtension,
  pgExtension,
  PgRepositoryExtension,
  query,
  queryExtension,
  repository,
} from '@wabot-dev/framework'
import { Game, IGameStatus } from './Game'
import { IGameRepositoryExtensions } from './IGameRepositoryExtensions'

@repository({ table: 'game', constructor: Game })
export class GameRepository
  extends CrudRepository<Game, IGameRepositoryExtensions>
  implements IGameRepositoryExtensions
{
  @query() declare findByUserIdAndStatus: (userId: string, status: IGameStatus) => Promise<Game[]>
  @query() declare countByUserIdAndStatus: (userId: string, status: IGameStatus) => Promise<number>
  @queryExtension() declare findLongestInBacklog: (userId: string, limit: number) => Promise<Game[]>
}

@memExtension(GameRepository)
export class GameMemoryQueries
  extends MemoryRepositoryExtension<Game>
  implements IGameRepositoryExtensions
{
  async findLongestInBacklog(userId: string, limit: number): Promise<Game[]> {
    return [...this.items.values()]
      .filter((game) => game['data'].userId === userId && game['data'].status === 'backlog')
      .sort((a, b) => a['data'].addedAt - b['data'].addedAt)
      .slice(0, limit)
      .map((game) => this.clone(game))
  }
}

@pgExtension(GameRepository)
export class GamePgQueries
  extends PgRepositoryExtension<Game>
  implements IGameRepositoryExtensions
{
  async findLongestInBacklog(userId: string, limit: number): Promise<Game[]> {
    const sql = `
      SELECT ${this['columns']} FROM ${this['table']}
      WHERE "data"->>'userId' = $1 AND "data"->>'status' = 'backlog'
      ORDER BY ("data"->>'addedAt')::numeric ASC
      LIMIT $2
    `
    return this['query'](sql, [userId, limit])
  }
}
