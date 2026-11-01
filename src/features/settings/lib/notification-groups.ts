export const notificationGroups = [
  {
    title: "E-posta Bildirimleri",
    items: [
      {
        key: "mailFailure",
        title: "Workflow hatası oluştuğunda",
        description: "Bir çalıştırma hatayla bitince e-posta alırsın.",
      },
      {
        key: "mailWeekly",
        title: "Haftalık özet raporu",
        description: "Her pazartesi haftanın özetini gönderir.",
      },
      {
        key: "mailProduct",
        title: "Ürün güncellemeleri",
        description: "Yeni özelliklerden haberdar olursun.",
      },
    ],
  },
  {
    title: "Uygulama İçi Bildirimler",
    items: [
      {
        key: "appFinished",
        title: "Workflow tamamlandığında",
        description: "Çalıştırma bitince bildirim gösterir.",
      },
      {
        key: "appTeam",
        title: "Ekip arkadaşı bir workflow'u düzenlediğinde",
        description: "Takımındaki değişiklikleri bildirir.",
      },
    ],
  },
];
