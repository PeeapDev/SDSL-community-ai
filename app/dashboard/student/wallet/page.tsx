import MockRoleGuard from "@/components/layouts/MockRoleGuard"
import { WalletPanel } from "@/components/wallet/WalletPanel"

export default function Page({ searchParams }: { searchParams: { tab?: string } }) {
  const tab = (searchParams?.tab as any) || "overview"
  return (
    <MockRoleGuard allow={["student", "admin"]}>
      <div className="p-6 space-y-4">
        <h1 className="text-xl font-semibold">Wallet</h1>
        <WalletPanel defaultTab={tab} />
      </div>
    </MockRoleGuard>
  )
}
