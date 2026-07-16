import { Entity, IEntityData } from '@wabot-dev/framework'

export interface ITaskData extends IEntityData {
  chatId: string
  title: string
  done: boolean
  doneAt?: number | null
}

/** A single to-do item, owned by the chat that created it. */
export class Task extends Entity<ITaskData> {
  get chatId() {
    return this.data.chatId
  }
  get title() {
    return this.data.title
  }
  get done() {
    return this.data.done
  }
  get doneAt(): Date | null {
    return this.data.doneAt ? new Date(this.data.doneAt) : null
  }
}
