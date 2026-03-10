import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { boardApi } from "../api/boardApi";
import { useWhiteboardSocket } from "./Usewhiteboardsocket";
import Canvas from "./whiteboard/Canvas";
import Toolbar from "./whiteboard/Toolbar";
import CursorOverlay from "./whiteboard/CursorOverlay";
import Participants from "./whiteboard/Participants";
import { useBoardStore } from "../store/boardStore";

export default function Whiteboard() {
  const { shareCode } = useParams();
  const navigate = useNavigate();

  const { setBoard, loadHistory, addEvent, reset } = useBoardStore();
  const board = useBoardStore((s) => s.board);

  const [color, setColor] = useState("#1a1a1a");
  const [strokeWidth, setStrokeWidth] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const boardData = await boardApi.joinByCode(shareCode);
        setBoard(boardData);
        const events = await boardApi.getEvents(boardData.id);
        loadHistory(events);
      } catch (err) {
        console.error("Failed to load board:", err);
        setError("Board not found. Check the link and try again.");
      } finally {
        setLoading(false);
      }
    }
    init();
    return () => reset();
  }, [shareCode]);

  const { sendDrawEvent, sendSegment, sendCursor } = useWhiteboardSocket(
    board?.id,
  );

  const handleClear = () => {
    if (!board) return;
    sendDrawEvent({
      elementId: crypto.randomUUID(),
      eventType: "CLEAR",
      payload: {},
    });
    addEvent({ eventType: "CLEAR", version: Date.now(), boardId: board.id });
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 font-medium mb-4">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen bg-gray-50 overflow-hidden">
      <Canvas
        color={color}
        strokeWidth={strokeWidth}
        sendDrawEvent={sendDrawEvent}
        sendSegment={sendSegment}
        sendCursor={sendCursor}
      />
      <CursorOverlay />
      <Toolbar
        color={color}
        strokeWidth={strokeWidth}
        onColorChange={setColor}
        onStrokeChange={setStrokeWidth}
        onClear={handleClear}
      />
      <Participants />
    </div>
  );
}
