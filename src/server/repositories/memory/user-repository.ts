import type { UserRecord, UserRepository } from "../types";

export class MemoryUserRepository implements UserRepository {
  private readonly users = new Map<string, UserRecord>();

  async findById(id: string) {
    return this.users.get(id) ?? null;
  }

  async findByEmail(email: string) {
    return [...this.users.values()].find((user) => user.email === email) ?? null;
  }

  async save(user: UserRecord) {
    this.users.set(user.id, { ...user });
  }

  async delete(id: string) {
    this.users.delete(id);
  }
}
