const hourSuffix = [
  "da", "de", "de", "te", "te", "te", "da", "de", "de", "da", "da", "de",
  "de", "te", "te", "te", "da", "de", "de", "da", "de", "de", "de", "te",
];

const days = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];

const part = /^(\*|\*\/\d+|\d+(-\d+)?(,\d+(-\d+)?)*)$/;
const limits = [59, 23, 31, 12, 7];

export function isValidCron(expression: string) {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) return false;
  return parts.every((value, index) => {
    if (!part.test(value)) return false;
    const numbers = value.match(/\d+/g)?.map(Number) ?? [];
    return numbers.every((number) => number <= limits[index]);
  });
}

function clock(hour: number, minute: number) {
  const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  return minute === 0 ? `${time}'${hourSuffix[hour]}` : `saat ${time}`;
}

export function describeCron(expression: string) {
  if (!isValidCron(expression)) return "";
  const [minute, hour, dayOfMonth, month, dayOfWeek] = expression.trim().split(/\s+/);
  const exact = /^\d+$/;
  if (expression.trim() === "* * * * *") return "Her dakika";
  const interval = minute.match(/^\*\/(\d+)$/);
  if (interval && hour === "*") return `Her ${interval[1]} dakikada bir`;
  if (minute === "0" && hour === "*" && dayOfMonth === "*") return "Her saat başı";
  if (exact.test(minute) && exact.test(hour) && month === "*") {
    const time = clock(Number(hour), Number(minute));
    if (dayOfMonth === "*" && dayOfWeek === "*") return `Her gün ${time}`;
    if (dayOfMonth === "*" && exact.test(dayOfWeek)) {
      return `Her ${days[Number(dayOfWeek) % 7]} ${time}`;
    }
    if (dayOfMonth === "*" && dayOfWeek === "1-5") return `Hafta içi her gün ${time}`;
    if (exact.test(dayOfMonth) && dayOfWeek === "*") {
      return `Her ayın ${dayOfMonth}. günü ${time}`;
    }
  }
  return "Özel zamanlama";
}
