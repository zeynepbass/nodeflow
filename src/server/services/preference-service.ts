import type { PreferenceRepository } from "@/server/repositories/types";
import {
  defaultPreferences,
  type UpdatePreferencesInput,
} from "@/shared/contracts/preferences";

export class PreferenceService {
  constructor(private readonly preferences: PreferenceRepository) {}

  async get(userId: string) {
    return (await this.preferences.find(userId)) ?? defaultPreferences;
  }

  async update(userId: string, patch: UpdatePreferencesInput) {
    const current = await this.get(userId);
    const updated = {
      twoFactor: patch.twoFactor ?? current.twoFactor,
      notifications: { ...current.notifications, ...patch.notifications },
    };
    await this.preferences.save(userId, updated);
    return updated;
  }
}
