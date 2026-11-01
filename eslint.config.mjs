import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "no-console": "error",
    },
  },
  {
    files: ["src/shared/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*", "@/widgets/*", "@/server/*", "@/app/*"],
              message: "shared katmanı üst katmanlara bağımlı olamaz.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/features/**", "src/widgets/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/server/*"],
              message: "İstemci kodu sunucu katmanına doğrudan erişemez.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/server/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*", "@/widgets/*", "@/app/*"],
              message: "Sunucu katmanı arayüz kodunu tanıyamaz.",
            },
          ],
        },
      ],
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
