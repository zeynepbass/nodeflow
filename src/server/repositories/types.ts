import type { Preferences } from "@/shared/contracts/preferences";
import type { Activity, Execution, UserProfile, Workflow } from "@/shared/domain/types";

export interface UserRecord extends UserProfile {
  passwordHash: string;
}

export interface SessionRecord {
  id: string;
  token: string;
  userId: string;
  device: string;
  location: string;
  createdAt: string;
}

export interface UserRepository {
  findById(id: string): Promise<UserRecord | null>;
  findByEmail(email: string): Promise<UserRecord | null>;
  save(user: UserRecord): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface SessionRepository {
  findByToken(token: string): Promise<SessionRecord | null>;
  listByUser(userId: string): Promise<SessionRecord[]>;
  save(session: SessionRecord): Promise<void>;
  delete(id: string): Promise<void>;
  deleteByUser(userId: string): Promise<void>;
}

export interface OwnedRepository<T extends { id: string }> {
  list(ownerId: string): Promise<T[]>;
  find(ownerId: string, id: string): Promise<T | null>;
  save(ownerId: string, item: T): Promise<void>;
  delete(ownerId: string, ids: string[]): Promise<void>;
  deleteOwner(ownerId: string): Promise<void>;
}

export type WorkflowRepository = OwnedRepository<Workflow>;
export type ExecutionRepository = OwnedRepository<Execution>;
export type ActivityRepository = OwnedRepository<Activity>;

export interface PreferenceRepository {
  find(userId: string): Promise<Preferences | null>;
  save(userId: string, preferences: Preferences): Promise<void>;
  delete(userId: string): Promise<void>;
}

export interface PasswordHasher {
  hash(password: string): Promise<string>;
  verify(password: string, hash: string): Promise<boolean>;
}
