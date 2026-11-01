export const passwordRules = [
  { label: "En az 8 karakter", test: (value: string) => value.length >= 8 },
  { label: "Bir büyük harf", test: (value: string) => /\p{Lu}/u.test(value) },
  { label: "Bir rakam", test: (value: string) => /\d/.test(value) },
];

export const MIN_PASSWORD_SCORE = 2;

export function passwordScore(value: string) {
  return passwordRules.filter((rule) => rule.test(value)).length;
}
