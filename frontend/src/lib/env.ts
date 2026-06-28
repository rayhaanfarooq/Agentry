import { z } from "zod";

const envSchema = z.object({
  VITE_API_URL: z
    .string({
      required_error: "VITE_API_URL is required.",
      invalid_type_error: "VITE_API_URL must be a string.",
    })
    .min(1, "VITE_API_URL cannot be empty.")
    .url("VITE_API_URL must be a valid URL, including http:// or https://."),
});

export type AppEnv = z.infer<typeof envSchema>;

let cachedEnv: AppEnv | null = null;

export function getAppEnv(): AppEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  const parsedEnv = envSchema.safeParse(import.meta.env);

  if (!parsedEnv.success) {
    const issues = parsedEnv.error.issues
      .map(
        (issue) => `${issue.path.join(".") || "environment"}: ${issue.message}`,
      )
      .join("\n");

    throw new Error(`Frontend environment validation failed.\n${issues}`);
  }

  cachedEnv = {
    ...parsedEnv.data,
    VITE_API_URL: parsedEnv.data.VITE_API_URL.replace(/\/$/, ""),
  };

  return cachedEnv;
}
