import { BanksList } from "@/components/banks-list";
import { listBanks } from "@/lib/banks/queries";

export default async function BancosPage() {
  const banks = await listBanks();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bancos</h1>
        <p className="text-sm text-muted-foreground">
          Cadastre suas contas bancárias e cartões. Eles serão usados para
          conciliação de extratos importados.
        </p>
      </div>

      <BanksList banks={banks} />
    </div>
  );
}
