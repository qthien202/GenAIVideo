import type { TaskInfo, VideoParams } from "./types";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.message || `HTTP ${res.status}`);
  }
  return json.data as T;
}

export function createVideo(params: VideoParams): Promise<{ task_id: string }> {
  // video_terms: BE nhận string hoặc list; gửi string gốc, rỗng thì để AI tự sinh
  return request("/api/v1/videos", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export function getTask(taskId: string): Promise<TaskInfo> {
  return request(`/api/v1/tasks/${taskId}`);
}

export function getTasks(
  page = 1,
  pageSize = 50
): Promise<{ tasks: TaskInfo[]; total: number }> {
  return request(`/api/v1/tasks?page=${page}&page_size=${pageSize}`);
}

export function deleteTask(taskId: string): Promise<void> {
  return request(`/api/v1/tasks/${taskId}`, { method: "DELETE" });
}

export function generateScript(body: {
  video_subject: string;
  video_language: string;
  paragraph_number: number;
}): Promise<{ video_script: string }> {
  return request("/api/v1/scripts", { method: "POST", body: JSON.stringify(body) });
}

export function generateTerms(body: {
  video_subject: string;
  video_script: string;
  amount: number;
}): Promise<{ video_terms: string[] }> {
  return request("/api/v1/terms", { method: "POST", body: JSON.stringify(body) });
}

export interface MusicFile {
  name: string;
  size: number;
  file: string;
}

export function getMusics(): Promise<{ files: MusicFile[] }> {
  return request("/api/v1/musics");
}

/** URL stream nhạc nền để nghe thử trên trình duyệt */
export function toMusicUrl(file: string): string {
  return `/api/v1/musics/${encodeURIComponent(file)}`;
}

export interface FontFile {
  name: string;
  label: string;
}

export function getFonts(): Promise<{ fonts: FontFile[] }> {
  return request("/api/v1/fonts");
}

/** URL tải file font để preview chữ thật (@font-face) trên trình duyệt */
export function toFontUrl(file: string): string {
  return `/api/v1/fonts/${encodeURIComponent(file)}`;
}

/** URL stream giọng mẫu để nghe thử (Edge free; Gemini/ElevenLabs cần key) */
export function previewVoiceUrl(voice: string, rate = 1.0): string {
  return `/api/v1/voices/preview?voice=${encodeURIComponent(voice)}&rate=${rate}`;
}

export interface ProviderConfig {
  api_key: string;
  model_name: string;
  base_url: string;
}

export interface AppSettings {
  llm_provider: string;
  providers: Record<string, ProviderConfig>;
  pexels_api_keys: string[];
  pixabay_api_keys: string[];
  elevenlabs_api_key: string;
  fpt_api_key: string;
  gcloud_tts_api_key: string;
}

export function getSettings(): Promise<AppSettings> {
  return request("/api/v1/config");
}

export function saveSettings(body: {
  llm_provider: string;
  api_key: string;
  model_name: string;
  base_url: string;
  pexels_api_keys: string[];
  pixabay_api_keys: string[];
  elevenlabs_api_key: string;
  fpt_api_key: string;
  gcloud_tts_api_key: string;
}): Promise<void> {
  return request("/api/v1/config", {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

/** URL tải toàn bộ API key thành 1 file .json (mang qua máy khác) */
export function exportKeysUrl(): string {
  return "/api/v1/config/export";
}

/** Nạp API key từ file .json đã tải về trước đó (multipart upload) */
export async function importKeys(file: File): Promise<{ applied: number }> {
  const form = new FormData();
  form.append("file", file);
  // KHÔNG set Content-Type để trình duyệt tự thêm boundary multipart
  const res = await fetch("/api/v1/config/import", { method: "POST", body: form });
  const json = await res.json().catch(() => ({}));
  // BE trả lỗi qua field "status" trong body (không phải HTTP code)
  if (!res.ok || (json?.status && json.status !== 200)) {
    throw new Error(json?.message || `HTTP ${res.status}`);
  }
  return json.data;
}

/** Chuyển đường dẫn video mà task trả về thành URL stream được qua proxy */
export function toStreamUrl(fileUrl: string): string {
  // BE trả dạng "/tasks/<task_id>/final-1.mp4" hoặc URL đầy đủ
  const m = fileUrl.match(/\/tasks\/(.+)$/);
  if (m) return `/api/v1/stream/${m[1]}`;
  return fileUrl;
}

export function toDownloadUrl(fileUrl: string): string {
  const m = fileUrl.match(/\/tasks\/(.+)$/);
  if (m) return `/api/v1/download/${m[1]}`;
  return fileUrl;
}
