import { TestBed } from '@angular/core/testing';
import { TaskService } from './task.service';
import { TaskRepository } from '../repositories/task.repository';
import { IdService } from './id.service';
import { Task } from '../models/task.model';

class FakeRepo {
  saved: Task[][] = [];
  loaded: Task[] = [];
  load = jasmine.createSpy('load').and.callFake(async () => this.loaded);
  save = jasmine.createSpy('save').and.callFake(async (tasks: Task[]) => {
    this.saved.push(tasks);
  });
}

class FakeId {
  private n = 0;
  generate(): string {
    return `id-${++this.n}`;
  }
}

describe('TaskService', () => {
  let service: TaskService;
  let repo: FakeRepo;

  beforeEach(() => {
    repo = new FakeRepo();
    TestBed.configureTestingModule({
      providers: [
        TaskService,
        { provide: TaskRepository, useValue: repo },
        { provide: IdService, useClass: FakeId },
      ],
    });
    service = TestBed.inject(TaskService);
  });

  it('hydrate populates tasks from repo', async () => {
    repo.loaded = [{ id: 'x', title: 'a', done: false, createdAt: 1 }];
    await service.hydrate();
    expect(service.tasks().length).toBe(1);
    expect(service.tasks()[0].id).toBe('x');
  });

  it('add creates a task at the head and persists it', async () => {
    await service.add('  buy milk  ');
    expect(service.tasks().length).toBe(1);
    expect(service.tasks()[0].title).toBe('buy milk');
    expect(service.tasks()[0].done).toBe(false);
    expect(repo.save).toHaveBeenCalledTimes(1);
  });

  it('add ignores empty / whitespace titles', async () => {
    await service.add('   ');
    await service.add('');
    expect(service.tasks().length).toBe(0);
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('remove deletes a task by id and persists', async () => {
    await service.add('one');
    await service.add('two');
    const idToRemove = service.tasks()[0].id;
    await service.remove(idToRemove);
    expect(service.tasks().length).toBe(1);
    expect(service.tasks().find((t) => t.id === idToRemove)).toBeUndefined();
  });

  it('toggleDone flips done flag and stamps completedAt', async () => {
    await service.add('task');
    const id = service.tasks()[0].id;

    await service.toggleDone(id);
    expect(service.tasks()[0].done).toBe(true);
    expect(service.tasks()[0].completedAt).toBeDefined();

    await service.toggleDone(id);
    expect(service.tasks()[0].done).toBe(false);
    expect(service.tasks()[0].completedAt).toBeUndefined();
  });

});
