import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getServices, type Services } from "@/server/container";
import { AppError, badRequest, unauthorized } from "@/server/errors";
import type { AuthenticatedSession } from "@/server/services/auth-service";
import { getSession } from "./session";

interface RouteContext<P> {
  params: Promise<P>;
}

interface PublicHandlerContext<P> {
  request: Request;
  params: P;
  services: Services;
}

type AuthedHandlerContext<P> = PublicHandlerContext<P> & AuthenticatedSession;

const delayMs = Number(process.env.MOCK_API_DELAY_MS ?? 200);

const pause = () =>
  new Promise((resolve) => setTimeout(resolve, delayMs));

function toResponse(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      { code: error.code, message: error.message },
      { status: error.status },
    );
  }
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        code: "dogrulama",
        message: error.issues[0]?.message ?? "Gönderilen veri geçersiz.",
      },
      { status: 422 },
    );
  }
  return NextResponse.json(
    { code: "sunucu", message: "Beklenmeyen bir hata oluştu." },
    { status: 500 },
  );
}

const toBody = (result: unknown) =>
  result === undefined
    ? new NextResponse(null, { status: 204 })
    : NextResponse.json(result);

export function publicRoute<P = unknown>(
  handler: (context: PublicHandlerContext<P>) => Promise<unknown>,
) {
  return async (request: Request, context: RouteContext<P>) => {
    try {
      await pause();
      const services = await getServices();
      const params = await context.params;
      return toBody(await handler({ request, params, services }));
    } catch (error) {
      return toResponse(error);
    }
  };
}

export function authedRoute<P = unknown>(
  handler: (context: AuthedHandlerContext<P>) => Promise<unknown>,
) {
  return publicRoute<P>(async (context) => {
    const session = await getSession();
    if (!session) throw unauthorized();
    return handler({ ...context, ...session });
  });
}

export async function readBody<S extends z.ZodType>(request: Request, schema: S) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw badRequest("İstek gövdesi geçerli JSON değil.");
  }
  return schema.parse(body) as z.output<S>;
}

export function clientInfo(request: Request) {
  const agent = request.headers.get("user-agent") ?? "";
  const browser =
    ["Edg", "Chrome", "Firefox", "Safari"].find((name) => agent.includes(name)) ??
    "Tarayıcı";
  const platform =
    ["iPhone", "Android", "Macintosh", "Windows", "Linux"].find((name) =>
      agent.includes(name),
    ) ?? "Cihaz";
  return { device: `${platform} · ${browser}`, location: "Konum bilinmiyor" };
}
