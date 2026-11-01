import type { SessionRecord, SessionRepository } from "../types";

export class MemorySessionRepository implements SessionRepository {
  private readonly sessions = new Map<string, SessionRecord>();

  async findByToken(token: string) {
    return (
      [...this.sessions.values()].find((session) => session.token === token) ??
      null
    );
  }

  async listByUser(userId: string) {
    return [...this.sessions.values()].filter(
      (session) => session.userId === userId,
    );
  }

  async save(session: SessionRecord) {
    this.sessions.set(session.id, session);
  }

  async delete(id: string) {
    this.sessions.delete(id);
  }

  async deleteByUser(userId: string) {
    for (const session of await this.listByUser(userId)) {
      this.sessions.delete(session.id);
    }
  }
}
