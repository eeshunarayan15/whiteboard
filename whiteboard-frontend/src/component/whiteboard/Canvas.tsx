import { useRef } from "react";
import { useCanvas } from "../Usecanvas";

export default function Canvas({
  color,
  strokeWidth,
  sendDrawEvent,
  sendSegment,
  sendCursor,
}) {
  const canvasRef = useRef(null);

  const { onMouseDown, onMouseMove, onMouseUp, onMouseLeave } = useCanvas(
    canvasRef,
    {
      color,
      strokeWidth,
      sendDrawEvent,
      sendSegment,
      sendCursor,
    },
  );

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ cursor: "crosshair" }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
    />
  );
}
