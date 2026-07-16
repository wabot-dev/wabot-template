import { CrudRepository, query, repository } from '@wabot-dev/framework'
import { Task } from './Task'

/**
 * The `@query()` declares are implemented by the framework from their method
 * names, and run against whichever adapter is active — the in-memory store by
 * default, PostgreSQL when DATABASE_URL is set. No SQL, no extension classes.
 */
@repository({ table: 'task', constructor: Task })
export class TaskRepository extends CrudRepository<Task> {
  @query() declare findByChatIdOrderByCreatedAtAsc: (chatId: string) => Promise<Task[]>
  @query() declare findByChatIdAndDoneOrderByCreatedAtAsc: (
    chatId: string,
    done: boolean,
  ) => Promise<Task[]>
}
