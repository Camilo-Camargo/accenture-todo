import { Injectable, Signal, inject, signal } from '@angular/core';
import { Task } from '../models/task.model';
import { TaskRepository } from '../repositories/task.repository';
import { IdService } from './id.service';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private repo = inject(TaskRepository);
  private id = inject(IdService);

  private readonly _tasks = signal<Task[]>([]);
  readonly tasks: Signal<Task[]> = this._tasks.asReadonly();

  private hydratedPromise?: Promise<void>;

  // Idempotent. Mutations await this so they can't race the initial load.
  hydrate(): Promise<void> {
    return (this.hydratedPromise ??= this.doHydrate());
  }

  private async doHydrate(): Promise<void> {
    this._tasks.set(await this.repo.load());
  }

  async add(title: string, categoryId?: string): Promise<void> {
    const trimmed = title.trim();
    if (!trimmed) return;
    await this.hydrate();
    const task: Task = {
      id: this.id.generate(),
      title: trimmed,
      done: false,
      createdAt: Date.now(),
      categoryId,
    };
    this._tasks.update((list) => [task, ...list]);
    await this.repo.save(this._tasks());
  }

  async setCategory(id: string, categoryId: string | undefined): Promise<void> {
    await this.hydrate();
    this._tasks.update((list) =>
      list.map((t) => (t.id === id ? { ...t, categoryId } : t)),
    );
    await this.repo.save(this._tasks());
  }

  async toggleDone(id: string): Promise<void> {
    await this.hydrate();
    this._tasks.update((list) =>
      list.map((t) =>
        t.id === id ? { ...t, done: !t.done, completedAt: !t.done ? Date.now() : undefined } : t,
      ),
    );
    await this.repo.save(this._tasks());
  }

  async remove(id: string): Promise<void> {
    await this.hydrate();
    this._tasks.update((list) => list.filter((t) => t.id !== id));
    await this.repo.save(this._tasks());
  }
}
