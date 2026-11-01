import type { OwnedRepository } from "../types";

export class MemoryOwnedRepository<
  T extends { id: string },
> implements OwnedRepository<T> {
  private readonly owners = new Map<string, Map<string, T>>();

  private collection(ownerId: string) {
    const existing = this.owners.get(ownerId);
    if (existing) return existing;
    const created = new Map<string, T>();
    this.owners.set(ownerId, created);
    return created;
  }

  async list(ownerId: string) {
    return [...this.collection(ownerId).values()].map((item) => structuredClone(item));
  }

  async find(ownerId: string, id: string) {
    const item = this.collection(ownerId).get(id);
    return item ? structuredClone(item) : null;
  }

  async save(ownerId: string, item: T) {
    this.collection(ownerId).set(item.id, structuredClone(item));
  }

  async delete(ownerId: string, ids: string[]) {
    const collection = this.collection(ownerId);
    ids.forEach((id) => collection.delete(id));
  }

  async deleteOwner(ownerId: string) {
    this.owners.delete(ownerId);
  }
}
