import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { boardApi } from "../api/boardApi";


export default function Home() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [shareCode, setShareCode] = useState("");
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState(null);

  const handleCreate = async () => {
    if (!title.trim()) return;
    try {
      setCreating(true);
      setError(null);
      const board = await boardApi.create(title.trim());
      // Navigate straight to the board using its share code
      navigate(`/board/${board.shareCode}`);
    } catch (err) {
      setError("Failed to create board. Is the server running?");
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async () => {
    const code = shareCode.trim();
    if (!code) return;
    try {
      setJoining(true);
      setError(null);
      // Validate the code exists before navigating
      await boardApi.joinByCode(code);
      navigate(`/board/${code}`);
    } catch (err) {
      setError("Board not found. Check the code and try again.");
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🖊️</div>
          <h1 className="text-3xl font-bold text-gray-900">Whiteboard</h1>
          <p className="text-gray-500 mt-2">Draw together, in real time</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
            {error}
          </div>
        )}

        {/* Create a new board */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
            Create a new board
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="Board title..."
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm
                         focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <button
              onClick={handleCreate}
              disabled={creating || !title.trim()}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50
                         text-white text-sm font-semibold rounded-xl transition-colors"
            >
              {creating ? "..." : "Create"}
            </button>
          </div>
        </div>

        {/* Join an existing board */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
            Join with a code
          </h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={shareCode}
              onChange={(e) => setShareCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              placeholder="Enter share code..."
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm
                         focus:outline-none focus:ring-2 focus:ring-indigo-300 font-mono"
            />
            <button
              onClick={handleJoin}
              disabled={joining || !shareCode.trim()}
              className="px-5 py-2.5 bg-gray-800 hover:bg-gray-900 disabled:opacity-50
                         text-white text-sm font-semibold rounded-xl transition-colors"
            >
              {joining ? "..." : "Join"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
