import {
  Chat,
  description,
  isBoolean,
  isNotEmpty,
  isOptional,
  isString,
  tools,
} from '@wabot-dev/framework'
import { Task } from '../models/Task'
import { TaskRepository } from '../models/TaskRepository'

export class AddTaskRequest {
  @isString()
  @isNotEmpty()
  @description('What the user wants to get done, in their own words')
  title: string = ''
}

export class TaskIdRequest {
  @isString()
  @isNotEmpty()
  @description('The id of the task, exactly as returned by listTasks')
  taskId: string = ''
}

export class ListTasksRequest {
  @isOptional()
  @isBoolean()
  @description('Filter by state: false = still pending, true = already done. Omit for every task.')
  done?: boolean
}

function summarize(task: Task) {
  return { id: task.id, title: task.title, done: task.done }
}

/**
 * The tools Nova can call. Every `@description` method becomes a tool the model
 * sees; its request class is validated before the method runs, so a tool body
 * never deals with malformed input.
 *
 * Tasks are scoped to the current `Chat` — injectable here because tools resolve
 * inside the per-message chat container.
 */
@tools({ language: 'english' })
export class TaskTools {
  constructor(
    private tasks: TaskRepository,
    private chat: Chat,
  ) {}

  @description("Add a task to the user's list")
  async addTask(req: AddTaskRequest) {
    const task = new Task({ chatId: this.chat.id, title: req.title, done: false })
    await this.tasks.create(task)
    return summarize(task)
  }

  @description('List the tasks in this conversation, optionally filtered by state')
  async listTasks(req: ListTasksRequest) {
    const tasks =
      req.done === undefined
        ? await this.tasks.findByChatIdOrderByCreatedAtAsc(this.chat.id)
        : await this.tasks.findByChatIdAndDoneOrderByCreatedAtAsc(this.chat.id, req.done)
    return tasks.map(summarize)
  }

  @description('Mark a task as done')
  async completeTask(req: TaskIdRequest) {
    const task = await this.requireOwnTask(req.taskId)
    task.update({ done: true, doneAt: Date.now() })
    await this.tasks.update(task)
    return summarize(task)
  }

  @description('Delete a task from the list for good')
  async removeTask(req: TaskIdRequest) {
    const task = await this.requireOwnTask(req.taskId)
    await this.tasks.delete(task)
    return { removed: task.id, title: task.title }
  }

  /** Ids come from the model, so never touch a task belonging to another chat. */
  private async requireOwnTask(taskId: string): Promise<Task> {
    const task = await this.tasks.findOrThrow(taskId)
    if (task.chatId !== this.chat.id) {
      throw new Error(`task ${taskId} not found`)
    }
    return task
  }
}
