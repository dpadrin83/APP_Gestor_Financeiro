import { Badge } from "@/components/ui/badge";
import type { BillStatus } from "@/lib/constants";

const LABEL: Record<BillStatus, string> = {
  pendente: "Pendente",
  agendado: "Agendado",
  pago: "Pago",
  vencido: "Vencido",
};

export function BillStatusBadge({ status }: { status: BillStatus }) {
  if (status === "pago") return <Badge variant="success">{LABEL[status]}</Badge>;
  if (status === "vencido")
    return <Badge variant="destructive">{LABEL[status]}</Badge>;
  if (status === "agendado") return <Badge>{LABEL[status]}</Badge>;
  return <Badge variant="secondary">{LABEL[status]}</Badge>;
}
