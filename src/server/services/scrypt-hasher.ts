import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { PasswordHasher } from "@/server/repositories/types";

const derive = promisify(scrypt) as (
  password: string,
  salt: string,
  length: number,
) => Promise<Buffer>;

export class ScryptHasher implements PasswordHasher {
  async hash(password: string) {
    const salt = randomBytes(16).toString("hex");
    const key = await derive(password, salt, 64);
    return `${salt}:${key.toString("hex")}`;
  }

  async verify(password: string, stored: string) {
    const [salt, key] = stored.split(":");
    const expected = Buffer.from(key, "hex");
    const actual = await derive(password, salt, 64);
    return timingSafeEqual(actual, expected);
  }
}
