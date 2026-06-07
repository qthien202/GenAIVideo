import { useState } from "react";
import CreateView from "./components/CreateView";
import LibraryView from "./components/LibraryView";
import SettingsView from "./components/SettingsView";

type Tab = "create" | "library" | "settings";

const TABS: [Tab, string, string][] = [
  ["create", "✨", "Tạo video"],
  ["library", "📚", "Thư viện"],
  ["settings", "⚙️", "Cài đặt"],
];

export default function App() {
  const [tab, setTab] = useState<Tab>("create");

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

        {/* Nav: full-width 3 cột trên mobile, pill gọn trên desktop */}
        <nav className="glass-pill grid grid-cols-3 sm:flex gap-1 p-1.5">
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
      </header>

      {tab === "create" ? (
        <CreateView />
      ) : tab === "library" ? (
        <LibraryView />
      ) : (
        <SettingsView />
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
