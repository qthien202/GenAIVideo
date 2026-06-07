import { useEffect, useState } from "react";
import * as api from "../api";

// Nhãn hiển thị thân thiện; thứ tự = thứ tự trong dropdown
const PROVIDER_LABELS: Record<string, string> = {
  openai: "OpenAI (hoặc API tương thích)",
  gemini: "Google Gemini",
  deepseek: "DeepSeek",
  groq: "Groq",
  grok: "xAI Grok",
  qwen: "Qwen (Alibaba)",
  moonshot: "Moonshot (Kimi)",
  azure: "Azure OpenAI",
  aihubmix: "AIHubMix",
  oneapi: "OneAPI",
  ollama: "Ollama (local, không cần key)",
  g4f: "GPT4Free (miễn phí, không ổn định)",
  pollinations: "Pollinations",
  cloudflare: "Cloudflare Workers AI",
  minimax: "MiniMax",
  mimo: "MiMo",
  modelscope: "ModelScope",
  ernie: "Ernie (Baidu)",
};

export default function SettingsView() {
  const [settings, setSettings] = useState<api.AppSettings | null>(null);
  const [provider, setProvider] = useState("openai");
  const [apiKey, setApiKey] = useState("");
  const [modelName, setModelName] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [pexelsKeys, setPexelsKeys] = useState("");
  const [pixabayKeys, setPixabayKeys] = useState("");
  const [showKeys, setShowKeys] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api
      .getSettings()
      .then((s) => {
        setSettings(s);
        applyProvider(s, s.llm_provider);
        setPexelsKeys(s.pexels_api_keys.join(", "));
        setPixabayKeys(s.pixabay_api_keys.join(", "));
      })
      .catch((e: any) => setError(`Không tải được cài đặt: ${e.message}`))
      .finally(() => setLoading(false));
  }, []);

  const applyProvider = (s: api.AppSettings, p: string) => {
    setProvider(p);
    const cfg = s.providers[p];
    setApiKey(cfg?.api_key ?? "");
    setModelName(cfg?.model_name ?? "");
    setBaseUrl(cfg?.base_url ?? "");
  };

  const handleProviderChange = (p: string) => {
    if (!settings) return;
    // Lưu giá trị đang gõ vào state cục bộ trước khi đổi provider
    settings.providers[provider] = {
      api_key: apiKey,
      model_name: modelName,
      base_url: baseUrl,
    };
    applyProvider(settings, p);
  };

  const handleSave = async () => {
    setError("");
    setSaved(false);
    setSaving(true);
    try {
      await api.saveSettings({
        llm_provider: provider,
        api_key: apiKey,
        model_name: modelName,
        base_url: baseUrl,
        pexels_api_keys: pexelsKeys.split(",").map((k) => k.trim()).filter(Boolean),
        pixabay_api_keys: pixabayKeys.split(",").map((k) => k.trim()).filter(Boolean),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setError(`Lưu thất bại: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <div className="text-center py-20 text-zinc-500">Đang tải...</div>;

  const needsKey = provider !== "ollama" && provider !== "g4f";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* LLM */}
      <div className="glass p-6 space-y-5">
        <h2 className="font-semibold flex items-center gap-2">🧠 Mô hình AI (LLM)</h2>
        <p className="text-xs text-zinc-500 -mt-3">
          Dùng để viết kịch bản và sinh từ khóa tìm video. Lưu vào{" "}
          <code className="text-zinc-400">config.toml</code>, có hiệu lực ngay
          không cần restart.
        </p>

        <div>
          <label className="label">Nhà cung cấp</label>
          <select
            className="input"
            value={provider}
            onChange={(e) => handleProviderChange(e.target.value)}
          >
            {Object.keys(PROVIDER_LABELS)
              .filter((p) => settings?.providers[p])
              .map((p) => (
                <option key={p} value={p}>
                  {PROVIDER_LABELS[p]}
                </option>
              ))}
          </select>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">
              API key{!needsKey && " (không bắt buộc)"}
            </label>
            <div className="flex gap-2">
              <input
                className="input"
                type={showKeys ? "text" : "password"}
                placeholder={needsKey ? "sk-..." : "Để trống"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <button
                className="btn-ghost px-3"
                onClick={() => setShowKeys((s) => !s)}
                title={showKeys ? "Ẩn key" : "Hiện key"}
              >
                {showKeys ? "🙈" : "👁️"}
              </button>
            </div>
          </div>
          <div>
            <label className="label">Tên model</label>
            <input
              className="input"
              placeholder="vd: gpt-4o-mini, gemini-2.5-flash"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="label">
            Base URL{" "}
            <span className="text-zinc-600 normal-case">
              (để trống → dùng mặc định; điền nếu dùng OpenRouter/proxy)
            </span>
          </label>
          <input
            className="input"
            placeholder="vd: https://openrouter.ai/api/v1"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
          />
        </div>
      </div>

      {/* Video material keys */}
      <div className="glass p-6 space-y-5">
        <h2 className="font-semibold flex items-center gap-2">🎞️ Nguồn video nền</h2>
        <p className="text-xs text-zinc-500 -mt-3">
          Cần ít nhất 1 key (đăng ký miễn phí). Nhiều key cách nhau bằng dấu
          phẩy — hết quota sẽ tự xoay vòng.
        </p>
        <div>
          <label className="label">
            Pexels API keys —{" "}
            <a
              href="https://www.pexels.com/api/"
              target="_blank"
              className="text-violet-400 underline normal-case"
            >
              lấy key
            </a>
          </label>
          <input
            className="input"
            type={showKeys ? "text" : "password"}
            placeholder="key1, key2, ..."
            value={pexelsKeys}
            onChange={(e) => setPexelsKeys(e.target.value)}
          />
        </div>
        <div>
          <label className="label">
            Pixabay API keys —{" "}
            <a
              href="https://pixabay.com/api/docs/"
              target="_blank"
              className="text-violet-400 underline normal-case"
            >
              lấy key
            </a>
          </label>
          <input
            className="input"
            type={showKeys ? "text" : "password"}
            placeholder="key1, key2, ..."
            value={pixabayKeys}
            onChange={(e) => setPixabayKeys(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-950/40 border border-red-900/50 rounded-xl px-4 py-3">
          ⚠️ {error}
        </div>
      )}

      <button
        className="btn-primary w-full text-base py-3.5"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? "Đang lưu..." : saved ? "✅ Đã lưu!" : "💾 Lưu cài đặt"}
      </button>
    </div>
  );
}
