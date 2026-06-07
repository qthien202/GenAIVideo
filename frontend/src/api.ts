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
}): Promise<void> {
  return request("/api/v1/config", {
    method: "PUT",
    body: JSON.stringify(body),
  });
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
