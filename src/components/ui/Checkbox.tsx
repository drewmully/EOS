interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  size?: "sm" | "md";
}

export function Checkbox({ checked, onChange, size = "md" }: CheckboxProps) {
  const s = size === "sm" ? "w-[22px] h-[22px]" : "w-[26px] h-[26px]";
  const icon = size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5";
  return (
    <button
      type="button"
      onClick={onChange}
      className={[
        s,
        "rounded-full border-2 flex items-center justify-center flex-shrink-0",
        "transition-all duration-200 cursor-pointer",
        checked
          ? "bg-emerald-500 border-emerald-500 scale-100"
          : "border-gray-300 bg-white hover:border-emerald-400 hover:bg-emerald-50",
      ].join(" ")}
    >
      {checked && (
        <svg
          className={`${icon} text-white`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{ animation: "checkPop 250ms ease-out" }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      )}
    </button>
  );
}
