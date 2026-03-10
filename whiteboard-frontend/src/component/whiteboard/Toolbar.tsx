const COLORS = [
  "#1a1a1a",
  "#ef4444",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#ffffff",
];
const SIZES = [
  { value: 2, label: "S" },
  { value: 5, label: "M" },
  { value: 10, label: "L" },
  { value: 18, label: "XL" },
];

export default function Toolbar({
  color,
  strokeWidth,
  onColorChange,
  onStrokeChange,
  onClear,
}) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 px-4 py-2.5 bg-white rounded-2xl shadow-lg border border-gray-100">
      <div className="flex items-center gap-1.5">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => onColorChange(c)}
            className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
            style={{
              backgroundColor: c,
              borderColor: color === c ? "#6366f1" : "#e5e7eb",
              transform: color === c ? "scale(1.2)" : undefined,
              boxShadow:
                c === "#ffffff" ? "inset 0 0 0 1px #d1d5db" : undefined,
            }}
          />
        ))}
      </div>
      <div className="w-px h-6 bg-gray-200" />
      <div className="flex items-center gap-1">
        {SIZES.map((s) => (
          <button
            key={s.value}
            onClick={() => onStrokeChange(s.value)}
            className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors
              ${strokeWidth === s.value ? "bg-indigo-100 text-indigo-700" : "text-gray-500 hover:bg-gray-100"}`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="w-px h-6 bg-gray-200" />
      <button
        onClick={onClear}
        className="px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors"
      >
        Clear
      </button>
    </div>
  );
}
