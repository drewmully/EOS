"use client";

import { Card } from "./ui/Card";

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div
        className="text-[12px] font-bold tracking-[0.12em] uppercase text-white px-6 py-3.5 rounded-t-2xl"
        style={{ background: color }}
      >
        {title}
      </div>
      <Card className="!rounded-t-none !border-t-0" padding="lg">{children}</Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 mb-3 text-[15px] leading-relaxed">
      <span className="font-semibold text-gray-500 min-w-[90px] flex-shrink-0">{label}</span>
      <span className="text-gray-700">{value}</span>
    </div>
  );
}

export function VTOView() {
  return (
    <div className="animate-fadeSlideUp">
      <div className="mb-10">
        <h1 className="text-[32px] font-bold text-gray-900 tracking-tight">V/TO Reference</h1>
        <p className="text-[16px] text-gray-400 mt-2">Your north star. Vision, Traction, Organizing.</p>
      </div>

      <Section title="Core Values (Shared)" color="#10B981">
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
              className="flex items-center gap-2.5 text-[15px] text-gray-700 bg-emerald-50/50 rounded-xl px-4 py-3"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
              {v}
            </div>
          ))}
        </div>
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="MFS (3PL)" color="#0F766E">
          <Row label="Purpose" value="Making it simple for entrepreneurs to realize their dream, worry-free." />
          <Row label="Niche" value="Solopreneurs & small teams, post-revenue eComm." />
          <Row label="10-Year" value="5M orders/month" />
          <Row label="3-Year" value="$4M rev / $1M profit / 100 clients" />
          <Row label="1-Year" value="$600K rev / $120K profit" />
          <Row label="Uniques" value="Ships in 1 day + Open-book + Real human" />
          <Row label="Guarantee" value="Order free if SLA missed" />
        </Section>

        <Section title="Mully (eComm)" color="#B45309">
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
