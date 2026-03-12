interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  size?: "sm" | "md";
}

export function Checkbox({ checked, onChange, size = "md" }: CheckboxProps) {
  const s = size === "sm" ? "w-[18px] h-[18px]" : "w-5 h-5";
  const icon = size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3";
  return (
    <button
      type="button"
      onClick={onChange}
      className={[
        s,
        "rounded border-[1.5px] flex items-center justify-center flex-shrink-0",
        "transition-all duration-150 cursor-pointer",
        checked
          ? "bg-gray-900 border-gray-900"
          : "border-gray-300 bg-white hover:border-gray-400",
      ].join(" ")}
    >
      {checked && (
        <svg
          className={`${icon} text-white`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{ animation: "checkPop 200ms ease-out" }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      )}
    </button>
  );
}
