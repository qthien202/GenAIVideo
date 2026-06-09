import { useEffect, useRef, useState } from "react";
import * as api from "../api";
import {
  DEFAULT_PARAMS,
  LANGUAGES,
  TASK_COMPLETE,
  TASK_FAILED,
  VOICES,
  VOICE_GROUPS,
  type TaskInfo,
  type VideoParams,
} from "../types";

// Preset bối cảnh: điền sẵn từ khóa tìm video nền trên Pexels/Pixabay.
// Từ khóa đã khảo sát thực tế trên Pexels — mỗi tổ hợp đều có 2.000-8.000 video dọc 9:16.
// Chủ đề × Địa điểm tách riêng, ghép lại thành từ khóa tìm kiếm.
// Các modifier "aerial / golden hour / slow motion / cinematic" là kiểu cảnh
// hay viral trên TikTok nên được trộn sẵn vào core terms.

type SceneTheme = { label: string; terms: string[] };

const THEMES: SceneTheme[] = [
  { label: "🌏 Tự động — AI chọn theo chủ đề", terms: [] },
  { label: "🌅 Bình minh", terms: ["sunrise aerial", "sunrise golden hour", "morning mist"] },
  { label: "🌇 Hoàng hôn", terms: ["sunset aerial", "sunset golden hour", "sunset silhouette"] },
  { label: "🌆 Chiều tà", terms: ["dusk city", "twilight", "evening golden hour"] },
  { label: "🌾 Cánh đồng", terms: ["field aerial", "rice field", "meadow golden hour"] },
  { label: "🌸 Hoa", terms: ["flower field", "flowers blooming", "cherry blossom"] },
  { label: "🏙️ Đường phố", terms: ["street cinematic", "city street", "crosswalk aerial"] },
  { label: "🌃 Đêm thành phố", terms: ["city lights night", "neon street", "night aerial"] },
  { label: "☕ Chill — Cafe", terms: ["coffee shop cozy", "cafe window", "pouring coffee slow motion"] },
  { label: "🌧️ Chill — Mưa", terms: ["rain window", "rain street night", "rain umbrella"] },
  { label: "🕯️ Chill — Cozy trong nhà", terms: ["cozy room candle", "cozy bed window", "reading book cozy"] },
  { label: "🌊 Biển", terms: ["ocean waves slow", "beach aerial", "beach sunset"] },
  { label: "⛰️ Núi non", terms: ["mountain aerial", "mountain mist", "alpine landscape"] },
];

type SceneLocation = { label: string; key: string; curated?: string };

const LOCATIONS: SceneLocation[] = [
  { label: "🌍 Không cố định", key: "" },
  // Việt Nam — curated dùng khi chủ đề để Tự động
  { label: "🇻🇳 Việt Nam (chung)", key: "vietnam", curated: "vietnam, hanoi, saigon street, ha long bay, hoi an" },
  { label: "🇻🇳 Hà Nội", key: "hanoi", curated: "hanoi, hanoi old quarter, hanoi night, hanoi cafe, hanoi aerial" },
  { label: "🇻🇳 TP. Hồ Chí Minh", key: "saigon", curated: "ho chi minh city, saigon street, saigon night, saigon aerial, vietnam rooftop" },
  { label: "🇻🇳 Đà Nẵng", key: "da nang", curated: "da nang, da nang beach, da nang night, da nang aerial, vietnam bridge" },
  { label: "🇻🇳 Hội An", key: "hoi an", curated: "hoi an, hoi an lantern, hoi an night, hoi an old town, vietnam river" },
  { label: "🇻🇳 Huế", key: "hue", curated: "hue vietnam, hue aerial, hue night, vietnam citadel, vietnam temple" },
  { label: "🇻🇳 Cần Thơ", key: "can tho", curated: "can tho, can tho aerial, can tho night, mekong river, floating market vietnam" },
  { label: "🇻🇳 Đà Lạt", key: "da lat", curated: "da lat, da lat night, da lat cafe, da lat vietnam, vietnam mountains" },
  { label: "🇻🇳 Nha Trang", key: "nha trang", curated: "nha trang, nha trang beach, nha trang night, nha trang aerial, vietnam island" },
  { label: "🇻🇳 Sa Pa", key: "sapa", curated: "sapa, sapa aerial, vietnam rice field, vietnam mountains, rice terraces" },
  { label: "🇻🇳 Phú Quốc", key: "phu quoc", curated: "phu quoc, phu quoc beach, phu quoc aerial, vietnam beach sunset, vietnam island" },
  { label: "🇻🇳 Vũng Tàu", key: "vung tau", curated: "vung tau, vung tau aerial, vung tau night, vietnam coast, vietnam city beach" },
  { label: "🇻🇳 Hạ Long", key: "ha long bay", curated: "ha long bay, halong bay vietnam, ha long aerial, vietnam islands, vietnam boat" },
  // Quốc tế
  { label: "🇨🇭 Thụy Sĩ", key: "switzerland", curated: "switzerland, switzerland alps, switzerland aerial, swiss village, switzerland lake" },
  { label: "🇯🇵 Nhật Bản", key: "japan", curated: "japan, japan street, tokyo night, kyoto, japan cherry blossom" },
  { label: "🇰🇷 Seoul", key: "seoul", curated: "seoul, seoul street, seoul night, korea city, han river" },
  { label: "🇫🇷 Paris", key: "paris", curated: "paris, paris street, eiffel tower, paris cafe, paris night" },
  { label: "🇮🇩 Bali", key: "bali", curated: "bali, bali beach, bali rice terrace, bali temple, bali sunset" },
  { label: "🇹🇭 Thái Lan", key: "thailand", curated: "thailand, bangkok street, thailand temple, thailand beach, bangkok night" },
];

/** Ghép chủ đề × địa điểm thành chuỗi từ khóa tìm video */
function buildSceneTerms(theme: SceneTheme, loc: SceneLocation): string {
  const hasTheme = theme.terms.length > 0;
  if (!hasTheme && !loc.key) return ""; // cả hai Tự động → AI tự sinh
  if (!hasTheme) return loc.curated ?? loc.key;
  if (!loc.key) return theme.terms.join(", ");
  // Có cả hai: ghép "địa điểm + chủ đề" + giữ 1 từ khóa địa điểm thuần cho đa dạng
  const combos = theme.terms.map((t) => `${loc.key} ${t.split(" ")[0]}`);
  return [...new Set([...combos, `${loc.key} aerial`])].join(", ");
}

/** "postcard-slow-walk.mp3" → "Slow Walk" */
function prettyMusicName(file: string): string {
  return file
    .replace(/^postcard-/, "")
    .replace(/\.mp3$/i, "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Tên CSS font-family duy nhất cho 1 file font (dùng để preview chữ thật) */
function fontFamilyFor(file: string): string {
  return "vf_" + file.replace(/[^a-zA-Z0-9]/g, "_");
}

/** Inject @font-face cho từng font để trình duyệt render chữ đúng kiểu (1 lần) */
function injectFontFaces(list: { name: string }[]) {
  const id = "subtitle-font-faces";
  const css = list
    .map(
      (f) =>
        `@font-face{font-family:'${fontFamilyFor(f.name)}';` +
        `src:url('${api.toFontUrl(f.name)}');font-display:swap;}`
    )
    .join("\n");
  let el = document.getElementById(id) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = css;
}

export default function CreateView() {
  const [params, setParams] = useState<VideoParams>({ ...DEFAULT_PARAMS });
  const [themeIdx, setThemeIdx] = useState(0);
  const [locIdx, setLocIdx] = useState(0);
  const [musics, setMusics] = useState<api.MusicFile[]>([]);
  const [previewing, setPreviewing] = useState(false);
  const previewRef = useRef<HTMLAudioElement | null>(null);
  // Nghe thử giọng đọc (tạo mẫu on-the-fly ở backend)
  const [voicePreviewing, setVoicePreviewing] = useState(false);
  const [voicePreviewLoading, setVoicePreviewLoading] = useState(false);
  const [voicePreviewError, setVoicePreviewError] = useState("");
  const voicePreviewRef = useRef<HTMLAudioElement | null>(null);
  // Danh sách font phụ đề (nạp từ backend)
  const [fonts, setFonts] = useState<api.FontFile[]>([]);
  // Import giọng ngoài (tải file ghi âm làm lời đọc)
  const [audioUploading, setAudioUploading] = useState(false);
  const [audioName, setAudioName] = useState("");
  const [audioError, setAudioError] = useState("");
  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [scriptLoading, setScriptLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Task đang theo dõi
  const [taskId, setTaskId] = useState<string | null>(null);
  const [task, setTask] = useState<TaskInfo | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const set = <K extends keyof VideoParams>(key: K, value: VideoParams[K]) =>
    setParams((p) => ({ ...p, [key]: value }));

  // Nạp danh sách nhạc nền + font, dọn audio preview khi unmount
  useEffect(() => {
    api.getMusics().then((res) => setMusics(res.files || [])).catch(() => {});
    api
      .getFonts()
      .then((res) => {
        const list = res.fonts || [];
        setFonts(list);
        injectFontFaces(list);
      })
      .catch(() => {});
    return () => {
      stopPreview();
      stopVoicePreview();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopPreview = () => {
    previewRef.current?.pause();
    previewRef.current = null;
    setPreviewing(false);
  };

  // Nghe thử giọng đọc: backend tạo mẫu ngắn (Edge free; Gemini/ElevenLabs cần key)
  const stopVoicePreview = () => {
    voicePreviewRef.current?.pause();
    voicePreviewRef.current = null;
    setVoicePreviewing(false);
    setVoicePreviewLoading(false);
  };

  const toggleVoicePreview = () => {
    if (voicePreviewing || voicePreviewLoading) {
      stopVoicePreview();
      return;
    }
    setVoicePreviewError("");
    setVoicePreviewLoading(true);
    const audio = new Audio(api.previewVoiceUrl(params.voice_name, params.voice_rate));
    audio.volume = 0.9;
    audio.onplaying = () => {
      setVoicePreviewLoading(false);
      setVoicePreviewing(true);
    };
    audio.onended = () => stopVoicePreview();
    audio.onerror = () => {
      setVoicePreviewError(
        "Không tạo được giọng mẫu — kiểm tra key (Gemini/ElevenLabs) hoặc dùng giọng 🆓 Edge."
      );
      stopVoicePreview();
    };
    audio.play().catch(() => {
      setVoicePreviewError("Trình duyệt chặn phát audio — bấm lại lần nữa.");
      stopVoicePreview();
    });
    voicePreviewRef.current = audio;
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (e.target) e.target.value = "";
    if (!f) return;
    setAudioError("");
    setAudioUploading(true);
    try {
      const res = await api.uploadCustomAudio(f);
      set("custom_audio_file", res.path);
      setAudioName(res.file);
    } catch (err: any) {
      setAudioError(`Tải lên thất bại: ${err.message}`);
    } finally {
      setAudioUploading(false);
    }
  };

  const clearCustomAudio = () => {
    set("custom_audio_file", "");
    setAudioName("");
    setAudioError("");
  };

  const togglePreview = () => {
    if (previewing) {
      stopPreview();
      return;
    }
    if (!params.bgm_file) return;
    const audio = new Audio(api.toMusicUrl(params.bgm_file));
    audio.volume = 0.8;
    audio.onended = () => setPreviewing(false);
    audio.play();
    previewRef.current = audio;
    setPreviewing(true);
  };

  // Poll tiến độ task
  useEffect(() => {
    if (!taskId) return;
    const poll = async () => {
      try {
        const t = await api.getTask(taskId);
        setTask({ ...t, task_id: taskId });
        if (t.state === TASK_COMPLETE || t.state === TASK_FAILED) {
          if (pollRef.current) clearInterval(pollRef.current);
        }
      } catch {
        /* giữ poll, task có thể chưa kịp ghi state */
      }
    };
    poll();
    pollRef.current = setInterval(poll, 2500);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [taskId]);

  const handleGenerateScript = async () => {
    if (!params.video_subject.trim()) {
      setError("Nhập chủ đề video trước đã.");
      return;
    }
    setError("");
    setScriptLoading(true);
    try {
      const res = await api.generateScript({
        video_subject: params.video_subject,
        video_language: params.video_language,
        paragraph_number: params.paragraph_number,
      });
      set("video_script", res.video_script);
    } catch (e: any) {
      setError(`Không sinh được kịch bản: ${e.message}. Kiểm tra LLM API key trong config.toml.`);
    } finally {
      setScriptLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!params.video_subject.trim() && !params.video_script.trim()) {
      setError("Cần nhập chủ đề hoặc kịch bản.");
      return;
    }
    setError("");
    setSubmitting(true);
    setTask(null);
    try {
      const res = await api.createVideo(params);
      setTaskId(res.task_id);
    } catch (e: any) {
      setError(`Tạo task thất bại: ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const progress = task?.progress ?? 0;
  const isDone = task?.state === TASK_COMPLETE;
  const isFailed = task?.state === TASK_FAILED;
  const isRunning = !!taskId && !isDone && !isFailed;

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_420px] gap-6 items-start">
      {/* ===== Cột trái: Form ===== */}
      <div className="glass p-5 sm:p-6 space-y-5 min-w-0">
        {/* Chủ đề */}
        <div>
          <label className="label">Chủ đề video</label>
          <div className="flex gap-2">
            <input
              className="input flex-1 min-w-0"
              placeholder="Vd: 5 mẹo để ngủ ngon hơn"
              value={params.video_subject}
              onChange={(e) => set("video_subject", e.target.value)}
            />
            <button
              className="btn-ghost whitespace-nowrap shrink-0"
              onClick={handleGenerateScript}
              disabled={scriptLoading}
            >
              {scriptLoading ? (
                <Spinner />
              ) : (
                <span className="text-cyan-400">✨</span>
              )}
              AI viết kịch bản
            </button>
          </div>
        </div>

        {/* Kịch bản */}
        <div>
          <label className="label">
            Kịch bản{" "}
            <span className="text-zinc-600 normal-case">
              (để trống → AI tự viết khi tạo video)
            </span>
          </label>
          <textarea
            className="input min-h-28 resize-y"
            placeholder="Nội dung lời bình của video..."
            value={params.video_script}
            onChange={(e) => set("video_script", e.target.value)}
          />
        </div>

        {/* Giọng đọc + Ngôn ngữ */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Giọng đọc</label>
            <div className="flex gap-2">
              <select
                className="input flex-1 min-w-0"
                value={params.voice_name}
                onChange={(e) => {
                  stopVoicePreview();
                  set("voice_name", e.target.value);
                }}
              >
                {VOICE_GROUPS.map((g) => (
                  <optgroup key={g} label={g}>
                    {VOICES.filter((v) => v.group === g).map((v) => (
                      <option key={v.value} value={v.value}>
                        {v.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <button
                type="button"
                className="btn-ghost px-3 shrink-0"
                onClick={toggleVoicePreview}
                title={voicePreviewing ? "Dừng" : "Nghe thử giọng"}
              >
                {voicePreviewLoading ? "⏳" : voicePreviewing ? "⏹" : "🔊"}
              </button>
            </div>
            {voicePreviewError && (
              <p className="text-xs text-amber-400 mt-1">{voicePreviewError}</p>
            )}

            {/* Import giọng ngoài: tải file ghi âm dùng làm lời đọc */}
            {!params.custom_audio_file ? (
              <div className="mt-2">
                <button
                  type="button"
                  className="text-xs text-cyan-400 hover:text-cyan-300 transition"
                  onClick={() => audioInputRef.current?.click()}
                  disabled={audioUploading}
                >
                  {audioUploading ? "⏳ Đang tải..." : "🎤 Hoặc tải giọng của bạn (mp3/wav...)"}
                </button>
                <input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg"
                  className="hidden"
                  onChange={handleAudioUpload}
                />
              </div>
            ) : (
              <div className="mt-2 flex items-center gap-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1.5">
                <span className="text-xs text-cyan-300 truncate flex-1">
                  🎤 Dùng giọng của bạn: <b>{audioName}</b>
                </span>
                <button
                  type="button"
                  className="text-xs text-zinc-400 hover:text-white shrink-0"
                  onClick={clearCustomAudio}
                  title="Bỏ, dùng lại giọng TTS"
                >
                  ✕
                </button>
              </div>
            )}
            {params.custom_audio_file && (
              <p className="text-[11px] text-zinc-500 mt-1">
                Bỏ qua giọng TTS ở trên. Dán đúng kịch bản → phụ đề tự khớp theo file.
              </p>
            )}
            {audioError && (
              <p className="text-xs text-red-400 mt-1">{audioError}</p>
            )}
          </div>
          <div>
            <label className="label">Ngôn ngữ kịch bản</label>
            <select
              className="input"
              value={params.video_language}
              onChange={(e) => set("video_language", e.target.value)}
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tỉ lệ khung hình */}
        <div>
          <label className="label">Tỉ lệ khung hình</label>
          <div className="flex gap-2">
            <AspectButton
              active={params.video_aspect === "9:16"}
              onClick={() => set("video_aspect", "9:16")}
              icon="📱"
              title="9:16 Dọc"
              sub="TikTok / Reels / Shorts"
            />
            <AspectButton
              active={params.video_aspect === "16:9"}
              onClick={() => set("video_aspect", "16:9")}
              icon="🖥️"
              title="16:9 Ngang"
              sub="YouTube"
            />
          </div>
        </div>

        {/* Bối cảnh video nền: Chủ đề × Địa điểm */}
        <div>
          <label className="label">
            Bối cảnh video nền{" "}
            <span className="text-zinc-600 normal-case">
              (chủ đề × địa điểm → tự điền từ khóa, sửa được trong Nâng cao)
            </span>
          </label>
          <div className="grid sm:grid-cols-2 gap-2">
            <select
              className="input"
              value={themeIdx}
              onChange={(e) => {
                const idx = +e.target.value;
                setThemeIdx(idx);
                set("video_terms", buildSceneTerms(THEMES[idx], LOCATIONS[locIdx]));
              }}
            >
              {THEMES.map((t, i) => (
                <option key={t.label} value={i}>
                  {t.label}
                </option>
              ))}
            </select>
            <select
              className="input"
              value={locIdx}
              onChange={(e) => {
                const idx = +e.target.value;
                setLocIdx(idx);
                set("video_terms", buildSceneTerms(THEMES[themeIdx], LOCATIONS[idx]));
              }}
            >
              {LOCATIONS.map((l, i) => (
                <option key={l.label} value={i}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
          {params.video_terms && (
            <p className="text-xs text-zinc-500 mt-1.5 truncate" title={params.video_terms}>
              🔍 {params.video_terms}
            </p>
          )}
        </div>

        {/* Nâng cao */}
        <div className="border-t border-zinc-800 pt-4">
          <button
            className="text-sm text-zinc-400 hover:text-zinc-200 transition flex items-center gap-1.5"
            onClick={() => setShowAdvanced((s) => !s)}
          >
            <span
              className={`inline-block transition-transform ${showAdvanced ? "rotate-90" : ""}`}
            >
              ▸
            </span>
            Thiết lập nâng cao
          </button>

          {showAdvanced && (
            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Nguồn video</label>
                <select
                  className="input"
                  value={params.video_source}
                  onChange={(e) => set("video_source", e.target.value as any)}
                >
                  <option value="pexels">Pexels</option>
                  <option value="pixabay">Pixabay</option>
                </select>
              </div>
              <div>
                <label className="label">Từ khóa tìm video (tùy chọn)</label>
                <input
                  className="input"
                  placeholder="Để trống → AI tự sinh"
                  value={params.video_terms}
                  onChange={(e) => set("video_terms", e.target.value)}
                />
              </div>
              <div>
                <label className="label">
                  Độ dài mỗi clip: {params.video_clip_duration}s
                </label>
                <input
                  type="range"
                  min={2}
                  max={30}
                  className="w-full accent-cyan-500"
                  value={params.video_clip_duration}
                  onChange={(e) => set("video_clip_duration", +e.target.value)}
                />
              </div>
              <div>
                <label className="label">
                  Độ dài kịch bản: {params.paragraph_number} đoạn (≈
                  {Math.round(params.paragraph_number * 0.7 * 10) / 10} phút)
                </label>
                <input
                  type="range"
                  min={1}
                  max={15}
                  className="w-full accent-cyan-500"
                  value={params.paragraph_number}
                  onChange={(e) => set("paragraph_number", +e.target.value)}
                />
              </div>
              <div>
                <label className="label">Số video tạo: {params.video_count}</label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  className="w-full accent-cyan-500"
                  value={params.video_count}
                  onChange={(e) => set("video_count", +e.target.value)}
                />
              </div>
              <div>
                <label className="label">
                  Tốc độ đọc: {params.voice_rate.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min={0.5}
                  max={2}
                  step={0.1}
                  className="w-full accent-cyan-500"
                  value={params.voice_rate}
                  onChange={(e) => set("voice_rate", +e.target.value)}
                />
              </div>
              <div>
                <label className="label">
                  Âm lượng nhạc nền: {Math.round(params.bgm_volume * 100)}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  className="w-full accent-cyan-500"
                  value={params.bgm_volume}
                  onChange={(e) => set("bgm_volume", +e.target.value)}
                />
              </div>
              <div>
                <label className="label">Nhạc nền</label>
                <div className="flex gap-2">
                  <select
                    className="input flex-1 min-w-0"
                    value={params.bgm_file || params.bgm_type}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "random" || v === "") {
                        set("bgm_type", v);
                        set("bgm_file", "");
                      } else {
                        set("bgm_type", "custom");
                        set("bgm_file", v);
                      }
                      stopPreview();
                    }}
                  >
                    <option value="random">🎲 Ngẫu nhiên</option>
                    <option value="">🔇 Không nhạc</option>
                    {musics.some((m) => m.file.startsWith("postcard-")) && (
                      <optgroup label="💌 Postcard / Chill">
                        {musics
                          .filter((m) => m.file.startsWith("postcard-"))
                          .map((m) => (
                            <option key={m.file} value={m.file}>
                              {prettyMusicName(m.file)}
                            </option>
                          ))}
                      </optgroup>
                    )}
                    {musics.some((m) => !m.file.startsWith("postcard-")) && (
                      <optgroup label="🎵 Khác">
                        {musics
                          .filter((m) => !m.file.startsWith("postcard-"))
                          .map((m) => (
                            <option key={m.file} value={m.file}>
                              {prettyMusicName(m.file)}
                            </option>
                          ))}
                      </optgroup>
                    )}
                  </select>
                  <button
                    className="btn-ghost px-3 shrink-0"
                    disabled={!params.bgm_file}
                    onClick={togglePreview}
                    title={previewing ? "Dừng nghe thử" : "Nghe thử"}
                  >
                    {previewing ? "⏹" : "🔊"}
                  </button>
                </div>
              </div>
              <div>
                <label className="label">Phụ đề</label>
                <div className="flex items-center gap-3 h-10">
                  <Toggle
                    checked={params.subtitle_enabled}
                    onChange={(v) => set("subtitle_enabled", v)}
                  />
                  {params.subtitle_enabled && (
                    <select
                      className="input flex-1"
                      value={params.subtitle_position}
                      onChange={(e) => set("subtitle_position", e.target.value)}
                    >
                      <option value="bottom">Dưới</option>
                      <option value="center">Giữa</option>
                      <option value="top">Trên</option>
                    </select>
                  )}
                </div>
              </div>

              {params.subtitle_enabled && (
                <div className="sm:col-span-2">
                  <label className="label">
                    Font phụ đề{" "}
                    <span className="text-zinc-600 normal-case">
                      (bấm để chọn — chữ mẫu hiển thị đúng font)
                    </span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
                    {fonts.map((f) => {
                      const active = params.font_name === f.name;
                      return (
                        <button
                          type="button"
                          key={f.name}
                          onClick={() => set("font_name", f.name)}
                          title={f.label}
                          className={
                            "rounded-xl border px-3 py-2 text-left transition min-w-0 " +
                            (active
                              ? "border-cyan-500 bg-cyan-500/10 ring-1 ring-cyan-500/40"
                              : "border-white/10 bg-black/30 hover:border-white/30")
                          }
                        >
                          <div
                            className="truncate leading-tight"
                            style={{
                              fontFamily: fontFamilyFor(f.name),
                              fontSize: 22,
                              color: "#fff",
                            }}
                          >
                            Việt Nam ơi
                          </div>
                          <div className="text-[10px] text-zinc-400 truncate mt-0.5 normal-case">
                            {f.label}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {/* Cỡ chữ phụ đề */}
                  <label className="label mt-3">
                    Cỡ chữ phụ đề: {params.font_size}
                  </label>
                  <input
                    type="range"
                    min={30}
                    max={100}
                    step={2}
                    className="w-full accent-cyan-500"
                    value={params.font_size}
                    onChange={(e) => set("font_size", +e.target.value)}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="text-sm text-red-400 bg-red-950/40 border border-red-900/50 rounded-xl px-4 py-3">
            ⚠️ {error}
          </div>
        )}

        <button
          className="btn-primary w-full text-base py-3.5"
          onClick={handleSubmit}
          disabled={submitting || isRunning}
        >
          {submitting ? <Spinner /> : "🚀"}
          {isRunning ? "Đang tạo video..." : "Tạo video ngay"}
        </button>
      </div>

      {/* ===== Cột phải: Tiến độ & Preview ===== */}
      <div className="glass p-5 sm:p-6 lg:sticky lg:top-6 min-w-0">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          📺 Kết quả
        </h2>

        {!taskId && (
          <div className="text-center py-16 text-zinc-500">
            <div className="text-5xl mb-3 opacity-50">🎬</div>
            <p className="text-sm">
              Nhập chủ đề rồi bấm <b>Tạo video ngay</b>
              <br />
              video sẽ hiện ở đây
            </p>
          </div>
        )}

        {taskId && !isDone && !isFailed && (
          <div className="py-8">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-zinc-400">Đang xử lý...</span>
              <span className="font-mono text-cyan-400">{progress}%</span>
            </div>
            <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-700"
                style={{ width: `${Math.max(progress, 3)}%` }}
              />
            </div>
            <p className="text-xs text-zinc-500 mt-3">
              Kịch bản → Giọng đọc → Phụ đề → Tải video nền → Ghép video. Có thể
              mất vài phút.
            </p>
          </div>
        )}

        {isFailed && (
          <div className="text-sm text-red-400 bg-red-950/40 border border-red-900/50 rounded-xl px-4 py-3">
            ❌ Tạo video thất bại.{" "}
            {task?.error || "Kiểm tra API key (LLM + Pexels/Pixabay) trong config.toml và log backend."}
          </div>
        )}

        {isDone && task?.videos && task.videos.length > 0 && (
          <div className="space-y-4">
            {task.videos.map((v, i) => (
              <div key={v}>
                <video
                  src={api.toStreamUrl(v)}
                  controls
                  className="w-full rounded-xl border border-zinc-800 bg-black"
                  style={{ maxHeight: 420 }}
                />
                <div className="flex gap-2 mt-2">
                  <a
                    href={api.toDownloadUrl(v)}
                    className="btn-ghost flex-1"
                    download
                  >
                    ⬇️ Tải video {task.videos!.length > 1 ? i + 1 : ""}
                  </a>
                </div>
              </div>
            ))}
            <button
              className="btn-ghost w-full"
              onClick={() => {
                setTaskId(null);
                setTask(null);
              }}
            >
              ✨ Tạo video mới
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function AspectButton(props: {
  active: boolean;
  onClick: () => void;
  icon: string;
  title: string;
  sub: string;
}) {
  return (
    <button
      onClick={props.onClick}
      className={`flex-1 rounded-xl border px-4 py-3 text-left transition ${
        props.active
          ? "border-cyan-500/70 bg-cyan-500/10 ring-2 ring-cyan-500/20"
          : "border-zinc-700/60 bg-zinc-800/40 hover:bg-zinc-800/80"
      }`}
    >
      <div className="text-sm font-semibold">
        {props.icon} {props.title}
      </div>
      <div className="text-xs text-zinc-500 mt-0.5">{props.sub}</div>
    </button>
  );
}

function Toggle(props: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => props.onChange(!props.checked)}
      className={`relative w-11 h-6 rounded-full transition ${
        props.checked ? "bg-cyan-600" : "bg-zinc-700"
      }`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${
          props.checked ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

function Spinner() {
  return (
    <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
  );
}
