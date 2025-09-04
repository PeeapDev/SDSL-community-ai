"use client"

import MockRoleGuard from "@/components/layouts/MockRoleGuard"

export default function AdminSettingsApiPage() {
  return (
    <MockRoleGuard allow={["admin"]}>
      <main className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-slate-950 text-slate-100 p-6">
        <h1 className="text-2xl font-bold">Settings — API & Developer Tools</h1>
        <p className="text-slate-400 mt-2">API keys, webhooks, CORS/domain whitelist, SDK/docs. (Stub)</p>

        <section className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <h2 className="font-semibold">General API</h2>
            <p className="text-sm text-slate-400">Manage platform-wide API keys and access rules.</p>
            <div className="mt-3 space-y-3">
              <div className="space-y-1">
                <label className="text-sm text-slate-300">Admin API Key (stub)</label>
                <input type="password" placeholder="••••••••" className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-slate-300">Allowed Origins</label>
                <input type="text" placeholder="https://yourdomain.com, https://admin.yourdomain.com" className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm" />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <h2 className="font-semibold">WhatsApp Business API</h2>
            <p className="text-sm text-slate-400">Configure WhatsApp so students can continue learning chats via WhatsApp using the official API.</p>
            <div className="mt-3 space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm text-slate-300">Business Account ID (WABA ID)</label>
                  <input type="text" placeholder="e.g., 123456789012345" className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-slate-300">Phone Number ID</label>
                  <input type="text" placeholder="e.g., 987654321098765" className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm text-slate-300">Permanent Access Token</label>
                <input type="password" placeholder="EAAG..." className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm" />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm text-slate-300">Webhook Verify Token</label>
                  <input type="text" placeholder="choose-a-verify-token" className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-slate-300">Webhook URL (read-only)</label>
                  <input readOnly value="https://yourapp.com/api/webhooks/whatsapp" className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm text-slate-400" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm text-slate-300">Test Student WhatsApp Number</label>
                <input type="tel" placeholder="+1 555 000 1234" className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm" />
              </div>
              <div className="flex gap-3 pt-1">
                <button className="px-4 py-2 text-sm rounded bg-cyan-600 hover:bg-cyan-700">Save (stub)</button>
                <button className="px-4 py-2 text-sm rounded bg-slate-800 border border-slate-700">Send Test Message (stub)</button>
              </div>
              <p className="text-xs text-slate-500">Note: Use the official WhatsApp Business API. Store tokens securely (env/secret manager). Set webhook to receive messages and delivery updates.</p>
            </div>
          </div>
        </section>
      </main>
    </MockRoleGuard>
  )
}
