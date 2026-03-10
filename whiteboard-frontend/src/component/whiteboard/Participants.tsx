import { useState } from "react";
import { useBoardStore } from "../../store/boardStore";


export default function Participants() {
  const participants = useBoardStore((s) => s.participants);
  const board = useBoardStore((s) => s.board);
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/board/${board?.shareCode}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="absolute top-4 right-4 z-10 w-52">
      <button
        onClick={copyLink}
        className="w-full mb-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors shadow"
      >
        {copied ? "✓ Copied!" : "🔗 Copy invite link"}
      </button>
      <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
        <div className="px-3 py-2 border-b border-gray-100">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Online — {participants.length}
          </span>
        </div>
        {participants.length === 0 ? (
          <div className="px-3 py-3 text-xs text-gray-400">
            Just you so far...
          </div>
        ) : (
          participants.map((p: any) => (
            <div
              key={p.sessionId}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50"
            >
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: p.color }}
              />
              <span className="text-sm text-gray-700 truncate">
                {p.displayName}
              </span>
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
