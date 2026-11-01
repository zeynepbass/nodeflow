import { randomBytes } from "node:crypto";
import { conflict, invalidCredentials, notFound } from "@/server/errors";
import type {
  PasswordHasher,
  SessionRecord,
  SessionRepository,
  UserRecord,
  UserRepository,
} from "@/server/repositories/types";
import { createId } from "@/shared/lib/id";
import type { SessionInfo } from "@/shared/contracts/auth";
import type { UserProfile } from "@/shared/domain/types";

export interface ClientInfo {
  device: string;
  location: string;
}

export interface AuthenticatedSession {
  session: SessionRecord;
  user: UserProfile;
}

const toProfile = (user: UserRecord): UserProfile => ({
  id: user.id,
  name: user.name,
  username: user.username,
  email: user.email,
  timezone: user.timezone,
});

export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly sessions: SessionRepository,
    private readonly hasher: PasswordHasher,
  ) {}

  private async openSession(user: UserRecord, client: ClientInfo) {
    const session: SessionRecord = {
      id: createId("oturum"),
      token: randomBytes(32).toString("hex"),
      userId: user.id,
      device: client.device,
      location: client.location,
      createdAt: new Date().toISOString(),
    };
    await this.sessions.save(session);
    return { session, user: toProfile(user) };
  }

  async register(
    input: { name: string; email: string; password: string },
    client: ClientInfo,
  ): Promise<AuthenticatedSession> {
    if (await this.users.findByEmail(input.email)) {
      throw conflict("eposta-kayitli", "Bu e-posta zaten kullanılıyor.");
    }
    const user: UserRecord = {
      id: createId("kullanici"),
      name: input.name,
      username: input.email.split("@")[0],
      email: input.email,
      timezone: "Europe/Istanbul",
      passwordHash: await this.hasher.hash(input.password),
    };
    await this.users.save(user);
    return this.openSession(user, client);
  }

  async login(
    input: { email: string; password: string },
    client: ClientInfo,
  ): Promise<AuthenticatedSession> {
    const user = await this.users.findByEmail(input.email);
    if (!user || !(await this.hasher.verify(input.password, user.passwordHash))) {
      throw invalidCredentials();
    }
    return this.openSession(user, client);
  }

  async authenticate(token: string): Promise<AuthenticatedSession | null> {
    const session = await this.sessions.findByToken(token);
    if (!session) return null;
    const user = await this.users.findById(session.userId);
    return user ? { session, user: toProfile(user) } : null;
  }

  async logout(sessionId: string) {
    await this.sessions.delete(sessionId);
  }

  async updateProfile(
    userId: string,
    patch: Pick<UserProfile, "name" | "username" | "timezone">,
  ) {
    const user = await this.users.findById(userId);
    if (!user) throw notFound("Kullanıcı");
    const updated = { ...user, ...patch };
    await this.users.save(updated);
    return toProfile(updated);
  }

  async changePassword(userId: string, current: string, next: string) {
    const user = await this.users.findById(userId);
    if (!user || !(await this.hasher.verify(current, user.passwordHash))) {
      throw conflict("mevcut-sifre-hatali", "Mevcut şifre hatalı.");
    }
    await this.users.save({
      ...user,
      passwordHash: await this.hasher.hash(next),
    });
  }

  async listSessions(userId: string, currentId: string): Promise<SessionInfo[]> {
    const sessions = await this.sessions.listByUser(userId);
    return sessions.map(({ id, device, location }) => ({
      id,
      device,
      location,
      current: id === currentId,
    }));
  }

  async endSession(userId: string, sessionId: string) {
    const sessions = await this.sessions.listByUser(userId);
    if (!sessions.some((session) => session.id === sessionId)) {
      throw notFound("Oturum");
    }
    await this.sessions.delete(sessionId);
  }

  async deleteAccount(userId: string) {
    await this.sessions.deleteByUser(userId);
    await this.users.delete(userId);
  }
}
