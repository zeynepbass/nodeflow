export const workflowTemplates = [
  {
    id: "siparis",
    name: "Sipariş bildirimi",
    description: "Webhook ile gelen siparişi koşula göre işler.",
  },
  {
    id: "rapor",
    name: "Günlük rapor",
    description: "Veriyi her sabah okuyup e-postayla gönderir.",
  },
] as const;

export type WorkflowTemplateId = (typeof workflowTemplates)[number]["id"];
