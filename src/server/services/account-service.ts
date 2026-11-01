import type {
  ActivityRepository,
  ExecutionRepository,
  PreferenceRepository,
  WorkflowRepository,
} from "@/server/repositories/types";
import type { AuthService } from "./auth-service";

export class AccountService {
  constructor(
    private readonly auth: AuthService,
    private readonly workflows: WorkflowRepository,
    private readonly executions: ExecutionRepository,
    private readonly activities: ActivityRepository,
    private readonly preferences: PreferenceRepository,
  ) {}

  async delete(userId: string) {
    await this.workflows.deleteOwner(userId);
    await this.executions.deleteOwner(userId);
    await this.activities.deleteOwner(userId);
    await this.preferences.delete(userId);
    await this.auth.deleteAccount(userId);
  }
}
