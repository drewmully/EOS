"use client";

import { useState } from "react";
import { Card } from "./ui/Card";
import { IconChevron } from "./ui/Icons";

const CORE_VALUES: { name: string; description: string; icon: string }[] = [
  { name: "Serve First", description: "Put others' needs before your own. Lead with generosity and a servant's heart. When you serve first, trust and loyalty follow.", icon: "heart" },
  { name: "Move the Mission", description: "Stay focused on the bigger picture. Every action should advance the company forward. Don't get lost in busywork — be strategic.", icon: "rocket" },
  { name: "Win Together", description: "Collaborate, support, and celebrate each other. Individual success means nothing if the team fails. We rise together.", icon: "team" },
  { name: "Live the Standard", description: "Hold yourself to the highest bar in everything you do. Be the example others aspire to follow. Excellence is a habit.", icon: "star" },
  { name: "Tell the Truth", description: "Be radically transparent. Honest communication — even when it's hard — builds trust and drives growth. No sugarcoating.", icon: "truth" },
  { name: "Choose Positive", description: "Bring energy and optimism to every situation. Attitude is a choice. Choose to lift others up and find opportunity in challenge.", icon: "sun" },
];

function Section({ title, children, accent }: { title: string; children: React.ReactNode; accent?: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div className="flex items-center gap-2.5" style={{ marginBottom: 12 }}>
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
    <div className="flex" style={{ gap: 16, padding: "10px 0", borderBottom: "1px solid #F9FAFB" }}>
      <span className="font-semibold text-gray-400 text-[14px] flex-shrink-0" style={{ minWidth: 80 }}>{label}</span>
      <span className="text-[14px] text-gray-700 leading-relaxed">{value}</span>
    </div>
  );
}

export function VTOView() {
  const [expandedValue, setExpandedValue] = useState<string | null>(null);

  return (
    <div className="animate-fadeIn">
      <div style={{ marginBottom: 32 }}>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">V/TO</h1>
        <p className="text-sm text-gray-400 mt-1">Vision, Traction, Organizing.</p>
      </div>

      {/* Interactive Core Values */}
      <div style={{ marginBottom: 24 }}>
        <div className="flex items-center gap-2.5" style={{ marginBottom: 12 }}>
          <div className="w-1 h-4 rounded-full bg-gradient-to-b from-emerald-400 to-teal-500" />
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Core Values</span>
          <span className="text-xs text-gray-300 ml-auto">Click to learn more</span>
        </div>
        <Card padding="lg">
          <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 10 }}>
            {CORE_VALUES.map((cv) => {
              const isExpanded = expandedValue === cv.name;
              return (
                <div
                  key={cv.name}
                  className="rounded-xl border border-emerald-100/50 transition-all duration-200 cursor-pointer"
                  style={{
                    background: isExpanded
                      ? "linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)"
                      : "linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 50%, #FFFFFF 100%)",
                    overflow: "hidden",
                  }}
                  onClick={() => setExpandedValue(isExpanded ? null : cv.name)}
                >
                  <div className="flex items-center" style={{ padding: "14px 16px", gap: 10 }}>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 flex-shrink-0" />
                    <span className="text-[14px] font-medium text-gray-700 flex-1">{cv.name}</span>
                    <div className={`text-emerald-300 transition-transform duration-150 flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`}>
                      <IconChevron className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="animate-fadeIn" style={{ padding: "0 16px 14px 38px" }}>
                      <p className="text-[13px] text-gray-500 leading-relaxed">{cv.description}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 20 }}>
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
