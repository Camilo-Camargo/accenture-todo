import { Injectable, inject } from '@angular/core';
import { Task } from '../models/task.model';
import { StorageService } from '../services/storage.service';

const STORAGE_KEY = 'tasks';

@Injectable({ providedIn: 'root' })
export class TaskRepository {
  private storage = inject(StorageService);

  async load(): Promise<Task[]> {
    return (await this.storage.get<Task[]>(STORAGE_KEY)) ?? [];
  }

  async save(tasks: Task[]): Promise<void> {
    await this.storage.set(STORAGE_KEY, tasks);
  }
}
