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

  async seed(count: number, categoryIds: string[] = []): Promise<void> {
    await this.hydrate();
    // Yield once so the "Seeding…" label can paint before we block the thread.
    await new Promise((r) => setTimeout(r, 0));

    const offset = this._tasks().length;
    const now = Date.now();
    const generated: Task[] = new Array(count);
    for (let i = 0; i < count; i++) {
      generated[i] = {
        id: this.id.generate(),
        title: `Task #${offset + i + 1}`,
        done: false,
        createdAt: now - (count - i) * 1000,
        categoryId: categoryIds.length && Math.random() < 0.85
          ? categoryIds[Math.floor(Math.random() * categoryIds.length)]
          : undefined,
      };
    }
    // Append so the numbering stays sequential when scrolling — handy for verifying
    // pagination. Real user-added tasks still go on top via add().
    this._tasks.update((list) => [...list, ...generated]);
    this.repo.save(this._tasks()).catch((err) => console.error('[Tasks] seed save failed', err));
  }

  async clearAll(): Promise<void> {
    await this.hydrate();
    this._tasks.set([]);
    await this.repo.save([]);
  }
}
