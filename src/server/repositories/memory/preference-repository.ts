import type { Preferences } from "@/shared/contracts/preferences";
import type { PreferenceRepository } from "../types";

export class MemoryPreferenceRepository implements PreferenceRepository {
  private readonly items = new Map<string, Preferences>();

  async find(userId: string) {
    return this.items.get(userId) ?? null;
  }

  async save(userId: string, preferences: Preferences) {
    this.items.set(userId, preferences);
  }

  async delete(userId: string) {
    this.items.delete(userId);
  }
}
