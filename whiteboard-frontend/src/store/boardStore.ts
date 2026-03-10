import { create } from "zustand";

export const useBoardStore = create((set) => ({
  board: null,
  setBoard: (board) => set({ board }),

  events: [],
  currentVersion: 0,

  addEvent: (event) =>
    set((state) => {
      const existingIndex = state.events.findIndex(
        (e) => e.elementId === event.elementId,
      );

      if (existingIndex !== -1) {
        const events = [...state.events];
        events[existingIndex] = event;
        return {
          events,
          currentVersion: Math.max(state.currentVersion, event.version ?? 0),
        };
      }

      return {
        events: [...state.events, event],
        currentVersion: Math.max(state.currentVersion, event.version ?? 0),
      };
    }),

  loadHistory: (events) => {
    const sorted = [...events].sort((a, b) => a.version - b.version);
    set({ events: sorted, currentVersion: sorted.at(-1)?.version ?? 0 });
  },

  reset: () => set({ board: null, events: [], currentVersion: 0 }),

  participants: [],
  setParticipants: (participants) => set({ participants }),

  cursors: {},
  updateCursor: (sessionId, cursor) =>
    set((state) => ({
      cursors: { ...state.cursors, [sessionId]: cursor },
    })),
  removeCursor: (sessionId) =>
    set((state) => {
      const cursors = { ...state.cursors };
      delete cursors[sessionId];
      return { cursors };
    }),

  mySessionId: null,
  setMySessionId: (id) => set({ mySessionId: id }),
}));
