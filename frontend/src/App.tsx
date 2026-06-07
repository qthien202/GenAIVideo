import { useEffect, useState } from "react";
import CreateView from "./components/CreateView";
import LibraryView from "./components/LibraryView";
import SettingsView from "./components/SettingsView";

type Tab = "create" | "library";

const TABS: [Tab, string, string][] = [
  ["create", "✨", "Tạo video"],
  ["library", "📚", "Thư viện"],
];

export default function App() {
  const [tab, setTab] = useState<Tab>("create");
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-xl shadow-lg shadow-violet-900/50 ring-1 ring-white/20">
            🎬
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              GenAI{" "}
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                Video
              </span>
            </h1>
            <p className="text-xs text-zinc-500 -mt-0.5">
              Tạo video ngắn bằng AI
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Nav: chia đều trên mobile, pill gọn trên desktop */}
          <nav className="glass-pill flex-1 sm:flex-none grid grid-cols-2 sm:flex gap-1 p-1.5">
            {TABS.map(([key, icon, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2.5 sm:py-2 rounded-xl text-sm font-medium transition ${
                  tab === key
                    ? "bg-white/15 text-white shadow ring-1 ring-white/15"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"
                }`}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </nav>

          {/* Nút mở modal cài đặt */}
          <button
            onClick={() => setShowSettings(true)}
            className="glass-pill p-3 sm:p-2.5 rounded-2xl text-lg leading-none text-zinc-300 hover:text-white hover:bg-white/10 transition shrink-0"
            title="Cài đặt"
          >
            ⚙️
          </button>
        </div>
      </header>

      {tab === "create" ? <CreateView /> : <LibraryView />}

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

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

function SettingsModal({ onClose }: { onClose: () => void }) {
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
        className="glass w-full sm:max-w-2xl max-h-[92dvh] sm:max-h-[88dvh] overflow-y-auto rounded-t-3xl rounded-b-none sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Thanh tiêu đề dính trên cùng */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 sm:px-6 py-4 border-b border-white/10 bg-zinc-950/60 backdrop-blur-xl rounded-t-3xl">
          <h2 className="font-semibold flex items-center gap-2">⚙️ Cài đặt</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition"
            title="Đóng (Esc)"
          >
            ✕
          </button>
        </div>
        <div className="p-5 sm:p-6">
          <SettingsView />
        </div>
      </div>
    </div>
  );
}
