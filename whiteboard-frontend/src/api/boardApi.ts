import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : "/api",
  headers: { "Content-Type": "application/json" },
});

export const boardApi = {
  create: (title) => api.post("/boards", { title }).then((r) => r.data),

  getById: (boardId) => api.get(`/boards/${boardId}`).then((r) => r.data),

  joinByCode: (shareCode) =>
    api.get(`/boards/join/${shareCode}`).then((r) => r.data),

  getEvents: (boardId) =>
    api.get(`/boards/${boardId}/events`).then((r) => r.data),

  getEventsSince: (boardId, fromVersion) =>
    api
      .get(`/boards/${boardId}/events?fromVersion=${fromVersion}`)
      .then((r) => r.data),
};
