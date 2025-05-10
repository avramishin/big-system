import _ from 'lodash';

export type Action = 'INSERT' | 'UPDATE' | 'DELETE';

export interface ChangeLog {
  action: Action;
  data: Record<string, any>;
}

export class DatabaseCollection<T extends { id: string }> {
  protected collection: Map<string, T> = new Map();
  protected changes: ChangeLog[] = [];
  protected tableName: string;
  protected immutable = false;

  private logChange(action: Action, item: T): void {
    this.changes.push({
      action,
      data: { ...item },
    });
  }

  insert(item: T): T {
    const insertObject = { ...item };
    this.collection.set(item.id, insertObject);
    this.logChange('INSERT', insertObject);
    return insertObject;
  }

  update(id: string, updatedItem: Partial<T>): T | null {
    const existingItem = this.collection.get(id);
    if (existingItem) {
      const updatedObject = { ...existingItem, ...updatedItem };
      this.collection.set(id, updatedObject);
      this.logChange('UPDATE', updatedObject);
      return updatedObject;
    }
    return null;
  }

  delete(id: string): T | null {
    const item = this.collection.get(id);
    if (item) {
      this.collection.delete(id);
      this.logChange('DELETE', item);
      return item;
    }
    return null;
  }

  getAll(): T[] {
    return Array.from(this.collection.values());
  }

  getById(id: string): T | undefined {
    return this.collection.get(id);
  }

  getChangeLog(): ChangeLog[] {
    return this.changes;
  }

  find(predicate: _.ListIterateeCustom<T, boolean>): T[] {
    return _.filter(Array.from(this.collection.values()), predicate);
  }

  findOne(predicate: _.ListIterateeCustom<T, boolean>): T | undefined {
    return _.first(this.find(predicate));
  }

  addOrUpdate(item: T) {
    const exists = this.collection.has(item.id);
    this.collection.set(item.id, item);
    this.logChange(exists ? 'UPDATE' : 'INSERT', item);
  }

  getChanges(): ChangeLog[] {
    const currentChanges = [...this.changes];
    this.changes = [];
    return currentChanges;
  }

  isImmutable(): boolean {
    return this.immutable;
  }

  getTableName(): string {
    return this.tableName;
  }

  setData(data: T[]) {
    this.collection = new Map(data.map((item) => [item.id, item]));
  }
}
