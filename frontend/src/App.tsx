import { useState } from "react";
import CreateView from "./components/CreateView";
import LibraryView from "./components/LibraryView";
import SettingsView from "./components/SettingsView";

type Tab = "create" | "library" | "settings";

export default function App() {
  const [tab, setTab] = useState<Tab>("create");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-xl shadow-lg shadow-violet-900/50">
            🎬
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              MoneyPrinter{" "}
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                Studio
              </span>
            </h1>
            <p className="text-xs text-zinc-500 -mt-0.5">
              Tạo video ngắn bằng AI
            </p>
          </div>
        </div>

        <nav className="flex gap-1 p-1 rounded-xl bg-zinc-900/80 border border-zinc-800">
          {(
            [
              ["create", "✨ Tạo video"],
              ["library", "📚 Thư viện"],
              ["settings", "⚙️ Cài đặt"],
            ] as [Tab, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                tab === key
                  ? "bg-zinc-700/80 text-white shadow"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {label}
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
        · MoneyPrinterTurbo
      </footer>
    </div>
  );
}
