import { useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { useBoardStore } from "../store/boardStore";

export function renderCanvas(canvas, events) {
  if (!canvas) return;
  if (canvas.width === 0 || canvas.height === 0) return;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const event of events) {
    if (event.eventType === "STROKE_ADD") {
      const { points, color, strokeWidth } = event.payload;
      if (!points || points.length < 2) continue;
      ctx.beginPath();
      ctx.strokeStyle = color || "#1a1a1a";
      ctx.lineWidth = strokeWidth || 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
    }
    if (event.eventType === "CLEAR") {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
}

export function useCanvas(
  canvasRef,
  { color, strokeWidth, sendDrawEvent, sendCursor, sendSegment },
) {
  const isDrawing = useRef(false);
  const currentPoints = useRef([]);
  const currentElementId = useRef(null);
  const lastCursorSend = useRef(0);
  const lastPos = useRef(null);
  const events = useBoardStore((s) => s.events);

  useEffect(() => {
    renderCanvas(canvasRef.current, events);
  }, [events]);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext("2d");
      ctx.scale(dpr, dpr);
      renderCanvas(canvas, useBoardStore.getState().events);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    return () => observer.disconnect();
  }, []);
  // Listen for live segments from other users
  useEffect(() => {
    const handler = (e: any) => {
      const seg = e.detail;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.beginPath();
      ctx.strokeStyle = seg.color || "#1a1a1a";
      ctx.lineWidth = seg.strokeWidth || 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(seg.from.x, seg.from.y);
      ctx.lineTo(seg.to.x, seg.to.y);
      ctx.stroke();
    };
    window.addEventListener("whiteboard-segment", handler);
    return () => window.removeEventListener("whiteboard-segment", handler);
  }, []);

  const getPos = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const onMouseDown = useCallback(
    (e) => {
      isDrawing.current = true;
      currentElementId.current = crypto.randomUUID();
      const pos = getPos(e);
      currentPoints.current = [pos];
      lastPos.current = pos;
      const ctx = canvasRef.current.getContext("2d");
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(pos.x, pos.y);
    },
    [color, strokeWidth, getPos],
  );

  const onMouseMove = useCallback(
    (e) => {
      const pos = getPos(e);
      const now = Date.now();

      if (now - lastCursorSend.current > 30) {
        sendCursor(pos.x, pos.y);
        lastCursorSend.current = now;
      }

      if (!isDrawing.current) return;

      currentPoints.current.push(pos);
      const ctx = canvasRef.current.getContext("2d");
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      console.log("sendSegment:", typeof sendSegment, lastPos.current, pos);
      if (lastPos.current) {
        sendSegment(lastPos.current, pos, color, strokeWidth);
      }
      lastPos.current = pos;
    },
    [getPos, sendCursor, sendSegment, color, strokeWidth],
  );

  const onMouseUp = useCallback(() => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    lastPos.current = null;
    const points = currentPoints.current;
    if (points.length < 2) return;
    sendDrawEvent({
      elementId: currentElementId.current,
      eventType: "STROKE_ADD",
      payload: { points, color, strokeWidth },
    });
    currentPoints.current = [];
  }, [color, strokeWidth, sendDrawEvent]);

  const onMouseLeave = useCallback(() => {
    if (isDrawing.current) onMouseUp();
  }, [onMouseUp]);

  return { onMouseDown, onMouseMove, onMouseUp, onMouseLeave };
}
