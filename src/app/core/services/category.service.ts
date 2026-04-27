import { Injectable, Signal, inject, signal } from '@angular/core';
import { Category } from '../models/category.model';
import { CategoryRepository } from '../repositories/category.repository';
import { IdService } from './id.service';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private repo = inject(CategoryRepository);
  private id = inject(IdService);

  private readonly _categories = signal<Category[]>([]);
  readonly categories: Signal<Category[]> = this._categories.asReadonly();

  private hydratedPromise?: Promise<void>;

  hydrate(): Promise<void> {
    return (this.hydratedPromise ??= this.doHydrate());
  }

  private async doHydrate(): Promise<void> {
    this._categories.set(await this.repo.load());
  }

  async add(name: string, color: string): Promise<void> {
    const trimmed = name.trim();
    if (!trimmed) return;
    await this.hydrate();
    const category: Category = {
      id: this.id.generate(),
      name: trimmed,
      color,
      createdAt: Date.now(),
    };
    this._categories.update((list) => [...list, category]);
    await this.repo.save(this._categories());
  }

  async update(id: string, patch: Partial<Pick<Category, 'name' | 'color'>>): Promise<void> {
    await this.hydrate();
    this._categories.update((list) =>
      list.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    );
    await this.repo.save(this._categories());
  }

  async remove(id: string): Promise<void> {
    await this.hydrate();
    this._categories.update((list) => list.filter((c) => c.id !== id));
    await this.repo.save(this._categories());
  }

  byId(id: string | undefined): Category | undefined {
    if (!id) return undefined;
    return this._categories().find((c) => c.id === id);
  }
}
