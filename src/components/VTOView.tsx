"use client";

import { Card } from "./ui/Card";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="text-xs font-medium text-gray-400 uppercase tracking-wider px-1 mb-2">
        {title}
      </div>
      <Card padding="md">{children}</Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 py-2 text-[14px]">
      <span className="font-medium text-gray-400 min-w-[80px] flex-shrink-0">{label}</span>
      <span className="text-gray-700">{value}</span>
    </div>
  );
}

export function VTOView() {
  return (
    <div className="animate-fadeIn">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">V/TO</h1>
        <p className="text-[13px] text-gray-400 mt-0.5">Vision, Traction, Organizing.</p>
      </div>

      <Section title="Core Values">
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
              className="flex items-center gap-2 text-[14px] text-gray-700 bg-gray-50 rounded-lg px-3.5 py-2.5"
            >
              <span className="w-1 h-1 rounded-full bg-emerald-400 flex-shrink-0" />
              {v}
            </div>
          ))}
        </div>
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section title="MFS (3PL)">
          <Row label="Purpose" value="Making it simple for entrepreneurs to realize their dream, worry-free." />
          <Row label="Niche" value="Solopreneurs & small teams, post-revenue eComm." />
          <Row label="10-Year" value="5M orders/month" />
          <Row label="3-Year" value="$4M rev / $1M profit / 100 clients" />
          <Row label="1-Year" value="$600K rev / $120K profit" />
          <Row label="Uniques" value="Ships in 1 day + Open-book + Real human" />
          <Row label="Guarantee" value="Order free if SLA missed" />
        </Section>

        <Section title="Mully (eComm)">
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
