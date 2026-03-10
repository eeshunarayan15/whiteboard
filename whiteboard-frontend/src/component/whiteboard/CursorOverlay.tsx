import { useBoardStore } from "../../store/boardStore";


export default function CursorOverlay() {
  const cursors = useBoardStore((s) => s.cursors);
  const mySessionId = useBoardStore((s) => s.mySessionId);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Object.entries(cursors).map(([sessionId, cursor]: [string, any]) => {
        if (sessionId === mySessionId) return null;
        return (
          <div
            key={sessionId}
            className="absolute"
            style={{
              left: (cursor as any).x,
              top: (cursor as any).y,
              transform: "translate(-2px, -2px)",
            }}
          >
            <div
              className="w-3 h-3 rounded-full border-2 border-white shadow-md"
              style={{ backgroundColor: (cursor as any).color || "#6366f1" }}
            />
            <div
              className="absolute top-4 left-2 px-2 py-0.5 rounded-full text-white text-xs font-medium whitespace-nowrap"
              style={{ backgroundColor: (cursor as any).color || "#6366f1" }}
            >
              {(cursor as any).displayName || "User"}
            </div>
          </div>
        );
      })}
    </div>
  );
}
