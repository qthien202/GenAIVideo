import { useEffect, useState, type ReactNode } from "react";
import CreateView from "./components/CreateView";
import LibraryView from "./components/LibraryView";
import SettingsView from "./components/SettingsView";

export default function App() {
  const [showLibrary, setShowLibrary] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xl shadow-lg shadow-cyan-900/50 ring-1 ring-white/20">
            🎬
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              GenAI{" "}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Video
              </span>
            </h1>
            <p className="text-xs text-zinc-500 -mt-0.5">
              Tạo video ngắn bằng AI
            </p>
          </div>
        </div>

        {/* Menu: 2 nút mở modal — chia đều trên mobile */}
        <nav className="glass-pill grid grid-cols-2 sm:flex gap-1 p-1.5">
          <button
            onClick={() => setShowLibrary(true)}
            className="flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2.5 sm:py-2 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/10 transition"
          >
            <span>📚</span>
            <span>Thư viện</span>
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2.5 sm:py-2 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/10 transition"
          >
            <span>⚙️</span>
            <span>Cài đặt</span>
          </button>
        </nav>
      </header>

      <CreateView />

      {showLibrary && (
        <Modal title="📚 Thư viện" wide onClose={() => setShowLibrary(false)}>
          <LibraryView />
        </Modal>
      )}

      {showSettings && (
        <Modal title="⚙️ Cài đặt" onClose={() => setShowSettings(false)}>
          <SettingsView />
        </Modal>
      )}

      <footer className="mt-12 text-center text-xs text-zinc-600">
        Backend:{" "}
        <a href="/docs" target="_blank" className="underline hover:text-zinc-400">
          API docs
        </a>{" "}
        · GenAIVideo
      </footer>
    </div>
  );
}

function Modal({
  title,
  wide,
  onClose,
  children,
}: {
  title: string;
  wide?: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  // Đóng bằng phím ESC + khóa scroll trang nền khi modal mở
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`glass w-full ${wide ? "sm:max-w-5xl" : "sm:max-w-2xl"} max-h-[92dvh] sm:max-h-[88dvh] overflow-y-auto rounded-t-3xl rounded-b-none sm:rounded-3xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Thanh tiêu đề dính trên cùng */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 sm:px-6 py-4 border-b border-white/10 bg-zinc-950/60 backdrop-blur-xl rounded-t-3xl">
          <h2 className="font-semibold flex items-center gap-2">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition"
            title="Đóng (Esc)"
          >
            ✕
          </button>
        </div>
        <div className="p-5 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
