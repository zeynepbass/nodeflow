export class AppError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export const unauthorized = () =>
  new AppError(401, "yetkisiz", "Oturumun sona erdi. Tekrar giriş yap.");

export const invalidCredentials = () =>
  new AppError(401, "hatali-giris", "E-posta veya şifre hatalı.");

export const notFound = (subject: string) =>
  new AppError(404, "bulunamadi", `${subject} bulunamadı.`);

export const conflict = (code: string, message: string) =>
  new AppError(409, code, message);

export const badRequest = (message: string) =>
  new AppError(400, "gecersiz-istek", message);
