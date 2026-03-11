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

const {
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
} = useCanvas(canvasRef, {
  color,
  strokeWidth,
  sendDrawEvent,
  sendSegment,
  sendCursor,
});

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ touchAction: "none" }} // ← add this too
    />
  );
}
