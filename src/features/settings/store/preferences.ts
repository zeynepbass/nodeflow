import { create } from "zustand";
import { persist } from "zustand/middleware";

export const notificationGroups = [
  {
    title: "E-posta Bildirimleri",
    items: [
      { key: "mailFailure", title: "Workflow hatası oluştuğunda", description: "Bir çalıştırma hatayla bitince e-posta alırsın." },
      { key: "mailWeekly", title: "Haftalık özet raporu", description: "Her pazartesi haftanın özetini gönderir." },
      { key: "mailProduct", title: "Ürün güncellemeleri", description: "Yeni özelliklerden haberdar olursun." },
    ],
  },
  {
    title: "Uygulama İçi Bildirimler",
    items: [
      { key: "appFinished", title: "Workflow tamamlandığında", description: "Çalıştırma bitince bildirim gösterir." },
      { key: "appTeam", title: "Ekip arkadaşı bir workflow'u düzenlediğinde", description: "Takımındaki değişiklikleri bildirir." },
    ],
  },
];

interface PreferencesState {
  notifications: Record<string, boolean>;
  twoFactor: boolean;
  setNotification: (key: string, value: boolean) => void;
  setTwoFactor: (value: boolean) => void;
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      notifications: {
        mailFailure: true,
        mailWeekly: true,
        mailProduct: false,
        appFinished: true,
        appTeam: false,
      },
      twoFactor: false,
      setNotification: (key, value) =>
        set((state) => ({
          notifications: { ...state.notifications, [key]: value },
        })),
      setTwoFactor: (twoFactor) => set({ twoFactor }),
    }),
    { name: "nodeflow-tercihler", skipHydration: true },
  ),
);
