import type { ActivityRepository } from "@/server/repositories/types";

export class ActivityService {
  constructor(private readonly activities: ActivityRepository) {}

  async recent(ownerId: string, limit = 30) {
    const items = await this.activities.list(ownerId);
    return items.sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit);
  }
}
