import { z } from "zod";

export const updatePreferencesSchema = z.object({
  notifications: z.record(z.string(), z.boolean()).optional(),
  twoFactor: z.boolean().optional(),
});

export interface Preferences {
  notifications: Record<string, boolean>;
  twoFactor: boolean;
}

export type UpdatePreferencesInput = z.input<typeof updatePreferencesSchema>;

export const defaultPreferences: Preferences = {
  notifications: {
    mailFailure: true,
    mailWeekly: true,
    mailProduct: false,
    appFinished: true,
    appTeam: false,
  },
  twoFactor: false,
};
