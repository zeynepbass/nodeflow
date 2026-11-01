import { beforeEach, describe, expect, it } from "vitest";
import { AppError } from "@/server/errors";
import { MemorySessionRepository } from "@/server/repositories/memory/session-repository";
import { MemoryUserRepository } from "@/server/repositories/memory/user-repository";
import { AuthService } from "./auth-service";
import { ScryptHasher } from "./scrypt-hasher";

const client = { device: "Test", location: "Test" };
const input = { name: "Ayşe", email: "ayse@ornek.com", password: "Guclu1234" };

describe("AuthService", () => {
  let auth: AuthService;

  beforeEach(() => {
    auth = new AuthService(
      new MemoryUserRepository(),
      new MemorySessionRepository(),
      new ScryptHasher(),
    );
  });

  it("kayıt olan kullanıcı oturumla doğrulanır", async () => {
    const { session, user } = await auth.register(input, client);
    expect(user.email).toBe(input.email);
    expect(user).not.toHaveProperty("passwordHash");
    expect((await auth.authenticate(session.token))?.user.id).toBe(user.id);
  });

  it("aynı e-posta ikinci kez kaydolamaz", async () => {
    await auth.register(input, client);
    await expect(auth.register(input, client)).rejects.toMatchObject({
      status: 409,
      code: "eposta-kayitli",
    });
  });

  it("hatalı şifre genel hata döndürür", async () => {
    await auth.register(input, client);
    await expect(
      auth.login({ email: input.email, password: "yanlis" }, client),
    ).rejects.toBeInstanceOf(AppError);
  });

  it("şifre değişince eski şifre geçersiz olur", async () => {
    const { user } = await auth.register(input, client);
    await auth.changePassword(user.id, input.password, "Yeni12345");
    await expect(auth.login(input, client)).rejects.toMatchObject({ status: 401 });
    await expect(
      auth.login({ email: input.email, password: "Yeni12345" }, client),
    ).resolves.toBeTruthy();
  });

  it("çıkış yapılan oturum geçersiz olur", async () => {
    const { session } = await auth.register(input, client);
    await auth.logout(session.id);
    expect(await auth.authenticate(session.token)).toBeNull();
  });
});
