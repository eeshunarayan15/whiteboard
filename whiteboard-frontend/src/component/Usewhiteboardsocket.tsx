import { useEffect, useRef, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useBoardStore } from "../store/boardStore";

export function useWhiteboardSocket(boardId: string | undefined) {
  const clientRef = useRef<Client | null>(null);
  const {
    addEvent,
    setParticipants,
    updateCursor,
    removeCursor,
    setMySessionId,
  } = useBoardStore.getState();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Find the canvas element in the DOM for direct segment drawing
    canvasRef.current = document.querySelector("canvas");
  }, [boardId]);

  useEffect(() => {
    if (!boardId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS("/ws"),
      reconnectDelay: 3000,

      onConnect: () => {
        console.log("STOMP connected");

        const sessionId = client.sessionId;
        if (sessionId) setMySessionId(sessionId);

        // Full strokes — add to store
        client.subscribe(`/topic/board/${boardId}`, (message) => {
          const event = JSON.parse(message.body);
          addEvent(event);
        });

        // Live segments — draw directly on canvas, skip store
        // client.subscribe(`/topic/board/${boardId}/segments`, (message) => {
        //   const seg = JSON.parse(message.body);
        //   const canvas = canvasRef.current;
        //   if (!canvas) return;
        //   const ctx = canvas.getContext("2d");
        //   if (!ctx) return;
        //   const dpr = window.devicePixelRatio || 1;
        //   const rect = canvas.getBoundingClientRect();
        //   // Convert from logical to physical coords
        //   ctx.beginPath();
        //   ctx.strokeStyle = seg.color || "#1a1a1a";
        //   ctx.lineWidth = seg.strokeWidth || 3;
        //   ctx.lineCap = "round";
        //   ctx.lineJoin = "round";
        //   ctx.moveTo(seg.from.x, seg.from.y);
        //   ctx.lineTo(seg.to.x, seg.to.y);
        //   ctx.stroke();
        // });
        client.subscribe(`/topic/board/${boardId}/segments`, (message) => {
          const seg = JSON.parse(message.body);
          window.dispatchEvent(
            new CustomEvent("whiteboard-segment", { detail: seg }),
          );
        });

        // Cursors
        client.subscribe(`/topic/board/${boardId}/cursors`, (message) => {
          const cursor = JSON.parse(message.body);
          updateCursor(cursor.sessionId, cursor);
        });

        // Presence
        client.subscribe(`/topic/board/${boardId}/presence`, (message) => {
          const presence = JSON.parse(message.body);
          setParticipants(presence.currentParticipants || []);
          if (presence.action === "LEFT") {
            removeCursor(presence.sessionId);
          }
        });

        // Errors
        client.subscribe(`/user/queue/errors`, (message) => {
          console.error("WS error:", message.body);
        });

        // Register presence
        client.publish({
          destination: `/app/board/${boardId}/subscribe`,
          body: JSON.stringify({}),
        });
      },

      onDisconnect: () => console.log("STOMP disconnected"),
      onStompError: (frame) => console.error("STOMP error", frame),
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [boardId]);

  const sendDrawEvent = useCallback(
    (event: any) => {
      clientRef.current?.publish({
        destination: `/app/board/${boardId}/draw`,
        body: JSON.stringify(event),
      });
    },
    [boardId],
  );

  const sendSegment = useCallback(
    (from: any, to: any, color: string, strokeWidth: number) => {
      clientRef.current?.publish({
        destination: `/app/board/${boardId}/segment`,
        body: JSON.stringify({ from, to, color, strokeWidth }),
      });
    },
    [boardId],
  );

  const sendCursor = useCallback(
    (x: number, y: number) => {
      clientRef.current?.publish({
        destination: `/app/board/${boardId}/cursor`,
        body: JSON.stringify({ x, y }),
      });
    },
    [boardId],
  );

  return { sendDrawEvent, sendSegment, sendCursor };
}
