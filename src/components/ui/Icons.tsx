import React from "react";

const I = (d: string) =>
  function Icon({ className = "w-5 h-5" }: { className?: string }) {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d={d} />
      </svg>
    );
  };

const IF = (paths: React.ReactNode) =>
  function Icon({ className = "w-5 h-5" }: { className?: string }) {
    return (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        {paths}
      </svg>
    );
  };

export const IconToday = IF(
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </>
);

export const IconRocks = IF(
  <>
    <path d="M2 22l10-10" />
    <path d="M16 8l-4.8 4.8" />
    <path d="M22 2l-6 6" />
    <path d="M18 2h4v4" />
    <path d="M2 12l5.1 5.1" />
  </>
);

export const IconInbox = IF(
  <>
    <rect x="2" y="3" width="20" height="18" rx="3" />
    <path d="M2 12h6l2 3h4l2-3h6" />
  </>
);

export const IconSeats = IF(
  <>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </>
);

export const IconGrowth = IF(
  <>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </>
);

export const IconVTO = IF(
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </>
);

export const IconPlus = I("M12 5v14m-7-7h14");
export const IconTrash = IF(
  <>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </>
);
export const IconChevron = I("M6 9l6 6 6-6");
export const IconMenu = IF(
  <>
    <path d="M4 6h16" />
    <path d="M4 12h16" />
    <path d="M4 18h16" />
  </>
);
export const IconX = IF(
  <>
    <path d="M18 6L6 18" />
    <path d="M6 6l12 12" />
  </>
);
