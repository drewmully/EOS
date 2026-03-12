"use client";

import { Card } from "./ui/Card";

function Section({ title, children, accent }: { title: string; children: React.ReactNode; accent?: string }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2.5 mb-3">
        {accent && <div className={`w-1 h-4 rounded-full ${accent}`} />}
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {title}
        </span>
      </div>
      <Card padding="lg">{children}</Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 py-2.5 text-[14px] border-b border-gray-50 last:border-0">
      <span className="font-semibold text-gray-400 min-w-[80px] flex-shrink-0">{label}</span>
      <span className="text-gray-700">{value}</span>
    </div>
  );
}

export function VTOView() {
  return (
    <div className="animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">V/TO</h1>
        <p className="text-sm text-gray-400 mt-1">Vision, Traction, Organizing.</p>
      </div>

      <Section title="Core Values" accent="bg-gradient-to-b from-emerald-400 to-teal-500">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            "Serve First",
            "Move the Mission",
            "Win Together",
            "Live the Standard",
            "Tell the Truth",
            "Choose Positive",
          ].map((v) => (
            <div
              key={v}
              className="flex items-center gap-2.5 text-[14px] font-medium text-gray-700 bg-gradient-to-r from-emerald-50 to-teal-50/50 rounded-xl px-4 py-3 border border-emerald-100/50"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
              {v}
            </div>
          ))}
        </div>
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Section title="MFS (3PL)" accent="bg-gradient-to-b from-blue-400 to-indigo-500">
          <Row label="Purpose" value="Making it simple for entrepreneurs to realize their dream, worry-free." />
          <Row label="Niche" value="Solopreneurs & small teams, post-revenue eComm." />
          <Row label="10-Year" value="5M orders/month" />
          <Row label="3-Year" value="$4M rev / $1M profit / 100 clients" />
          <Row label="1-Year" value="$600K rev / $120K profit" />
          <Row label="Uniques" value="Ships in 1 day + Open-book + Real human" />
          <Row label="Guarantee" value="Order free if SLA missed" />
        </Section>

        <Section title="Mully (eComm)" accent="bg-gradient-to-b from-violet-400 to-purple-500">
          <Row label="Purpose" value="Helping people feel comfortable, included, access a gated community." />
          <Row label="Niche" value="Driven adults seeking golf community access." />
          <Row label="10-Year" value="$250M revenue" />
          <Row label="3-Year" value="$10M rev / $2M profit / 10K subs" />
          <Row label="1-Year" value="$2.5M rev / $500K profit" />
          <Row label="Uniques" value="Insider culture + White-glove + Superior tech" />
          <Row label="Guarantee" value="Swap anything, update your profile." />
        </Section>
      </div>
    </div>
  );
}
