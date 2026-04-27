import { TestBed } from '@angular/core/testing';
import { CategoryService } from './category.service';
import { CategoryRepository } from '../repositories/category.repository';
import { IdService } from './id.service';
import { Category } from '../models/category.model';

class FakeRepo {
  loaded: Category[] = [];
  load = jasmine.createSpy('load').and.callFake(async () => this.loaded);
  save = jasmine.createSpy('save').and.callFake(async () => undefined);
}

class FakeId {
  private n = 0;
  generate(): string {
    return `id-${++this.n}`;
  }
}

describe('CategoryService', () => {
  let service: CategoryService;
  let repo: FakeRepo;

  beforeEach(() => {
    repo = new FakeRepo();
    TestBed.configureTestingModule({
      providers: [
        CategoryService,
        { provide: CategoryRepository, useValue: repo },
        { provide: IdService, useClass: FakeId },
      ],
    });
    service = TestBed.inject(CategoryService);
  });

  it('hydrate populates categories from repo', async () => {
    repo.loaded = [{ id: 'x', name: 'Work', color: '#000', createdAt: 1 }];
    await service.hydrate();
    expect(service.categories().length).toBe(1);
    expect(service.categories()[0].name).toBe('Work');
  });

  it('add creates a category and persists', async () => {
    await service.add('Personal', '#5b8def');
    expect(service.categories().length).toBe(1);
    expect(service.categories()[0].name).toBe('Personal');
    expect(service.categories()[0].color).toBe('#5b8def');
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('add ignores empty names', async () => {
    await service.add('   ', '#000');
    expect(service.categories().length).toBe(0);
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('update changes name and color', async () => {
    await service.add('Work', '#000');
    const id = service.categories()[0].id;
    await service.update(id, { name: 'Office', color: '#fff' });
    expect(service.categories()[0].name).toBe('Office');
    expect(service.categories()[0].color).toBe('#fff');
  });

  it('remove deletes a category by id', async () => {
    await service.add('Work', '#000');
    await service.add('Home', '#fff');
    const idToRemove = service.categories()[0].id;
    await service.remove(idToRemove);
    expect(service.categories().length).toBe(1);
    expect(service.categories().find((c) => c.id === idToRemove)).toBeUndefined();
  });
});
