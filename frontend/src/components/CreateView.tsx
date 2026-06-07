import { useEffect, useRef, useState } from "react";
import * as api from "../api";
import {
  DEFAULT_PARAMS,
  LANGUAGES,
  TASK_COMPLETE,
  TASK_FAILED,
  VOICES,
  type TaskInfo,
  type VideoParams,
} from "../types";

export default function CreateView() {
  const [params, setParams] = useState<VideoParams>({ ...DEFAULT_PARAMS });
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
    <div className="grid lg:grid-cols-[1fr_420px] gap-6 items-start">
      {/* ===== Cột trái: Form ===== */}
      <div className="glass p-6 space-y-5">
        {/* Chủ đề */}
        <div>
          <label className="label">Chủ đề video</label>
          <div className="flex gap-2">
            <input
              className="input"
              placeholder="Vd: 5 mẹo để ngủ ngon hơn"
              value={params.video_subject}
              onChange={(e) => set("video_subject", e.target.value)}
            />
            <button
              className="btn-ghost whitespace-nowrap"
              onClick={handleGenerateScript}
              disabled={scriptLoading}
            >
              {scriptLoading ? (
                <Spinner />
              ) : (
                <span className="text-violet-400">✨</span>
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
            <select
              className="input"
              value={params.voice_name}
              onChange={(e) => set("voice_name", e.target.value)}
            >
              {VOICES.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </select>
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
                  max={10}
                  className="w-full accent-violet-500"
                  value={params.video_clip_duration}
                  onChange={(e) => set("video_clip_duration", +e.target.value)}
                />
              </div>
              <div>
                <label className="label">Số video tạo: {params.video_count}</label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  className="w-full accent-violet-500"
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
                  className="w-full accent-violet-500"
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
                  className="w-full accent-violet-500"
                  value={params.bgm_volume}
                  onChange={(e) => set("bgm_volume", +e.target.value)}
                />
              </div>
              <div>
                <label className="label">Nhạc nền</label>
                <select
                  className="input"
                  value={params.bgm_type}
                  onChange={(e) => set("bgm_type", e.target.value)}
                >
                  <option value="random">🎲 Ngẫu nhiên</option>
                  <option value="">🔇 Không nhạc</option>
                </select>
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
      <div className="glass p-6 lg:sticky lg:top-6">
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
              <span className="font-mono text-violet-400">{progress}%</span>
            </div>
            <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-700"
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
          ? "border-violet-500/70 bg-violet-500/10 ring-2 ring-violet-500/20"
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
        props.checked ? "bg-violet-600" : "bg-zinc-700"
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
