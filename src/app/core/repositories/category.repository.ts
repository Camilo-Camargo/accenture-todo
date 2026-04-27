import { Injectable, inject } from '@angular/core';
import { Category } from '../models/category.model';
import { StorageService } from '../services/storage.service';

const STORAGE_KEY = 'categories';

@Injectable({ providedIn: 'root' })
export class CategoryRepository {
  private storage = inject(StorageService);

  async load(): Promise<Category[]> {
    return (await this.storage.get<Category[]>(STORAGE_KEY)) ?? [];
  }

  async save(categories: Category[]): Promise<void> {
    await this.storage.set(STORAGE_KEY, categories);
  }
}
