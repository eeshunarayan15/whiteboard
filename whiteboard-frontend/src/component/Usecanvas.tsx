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

  // Prevent page scroll when drawing on touch devices
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const prevent = (e: TouchEvent) => e.preventDefault();
    canvas.addEventListener("touchstart", prevent, { passive: false });
    canvas.addEventListener("touchmove", prevent, { passive: false });
    return () => {
      canvas.removeEventListener("touchstart", prevent);
      canvas.removeEventListener("touchmove", prevent);
    };
  }, []);

  const getPos = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const getTouchPos = useCallback((touch: Touch) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  }, []);

  // --- Shared start/move/end logic ---
  const startDrawing = useCallback(
    (pos) => {
      console.log("startDrawing called", pos)
      isDrawing.current = true;
      currentElementId.current = crypto.randomUUID();
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
    [color, strokeWidth],
  );

  const continueDrawing = useCallback(
    (pos) => {
        console.log("continueDrawing called", isDrawing.current, pos);
      if (!isDrawing.current) return;
      currentPoints.current.push(pos);
      const ctx = canvasRef.current.getContext("2d");
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      if (lastPos.current) {
        sendSegment(lastPos.current, pos, color, strokeWidth);
      }
      lastPos.current = pos;
    },
    [sendSegment, color, strokeWidth],
  );

  const stopDrawing = useCallback(() => {
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

  // --- Mouse events ---
  const onMouseDown = useCallback(
    (e) => startDrawing(getPos(e)),
    [startDrawing, getPos],
  );

  const onMouseMove = useCallback(
    (e) => {
      const pos = getPos(e);
      const now = Date.now();
      if (now - lastCursorSend.current > 30) {
        sendCursor(pos.x, pos.y);
        lastCursorSend.current = now;
      }
      continueDrawing(pos);
    },
    [getPos, sendCursor, continueDrawing],
  );

  const onMouseUp = useCallback(() => stopDrawing(), [stopDrawing]);

  const onMouseLeave = useCallback(() => {
    if (isDrawing.current) stopDrawing();
  }, [stopDrawing]);

  // --- Touch events ---
  const onTouchStart = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      if (e.touches.length !== 1) return; // ignore multi-touch
      startDrawing(getTouchPos(e.touches[0]));
    },
    [startDrawing, getTouchPos],
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      if (e.touches.length !== 1) return;
      continueDrawing(getTouchPos(e.touches[0]));
    },
    [continueDrawing, getTouchPos],
  );

  const onTouchEnd = useCallback(() => stopDrawing(), [stopDrawing]);

  return {
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}
