export interface TaskInfo {
  task_id: string;
  state: number; // -1 failed | 1 complete | 4 processing
  progress: number;
  videos?: string[];
  combined_videos?: string[];
  error?: string;
  script?: string;
}

export const TASK_FAILED = -1;
export const TASK_COMPLETE = 1;
export const TASK_PROCESSING = 4;

export interface VideoParams {
  video_subject: string;
  video_script: string;
  video_terms: string;
  video_aspect: "9:16" | "16:9";
  video_concat_mode: "random" | "sequential";
  video_clip_duration: number;
  video_count: number;
  video_source: "pexels" | "pixabay";
  video_language: string;
  voice_name: string;
  voice_volume: number;
  voice_rate: number;
  bgm_type: string;
  bgm_file: string;
  bgm_volume: number;
  subtitle_enabled: boolean;
  subtitle_position: string;
  font_name: string;
  font_size: number;
  text_fore_color: string;
  text_background_color: boolean;
  stroke_color: string;
  stroke_width: number;
  paragraph_number: number;
}

export const DEFAULT_PARAMS: VideoParams = {
  video_subject: "",
  video_script: "",
  video_terms: "",
  video_aspect: "9:16",
  video_concat_mode: "random",
  video_clip_duration: 5,
  video_count: 1,
  video_source: "pexels",
  video_language: "vi-VN",
  voice_name: "vi-VN-HoaiMyNeural-Female",
  voice_volume: 1.0,
  voice_rate: 1.0,
  bgm_type: "random",
  bgm_file: "",
  bgm_volume: 0.2,
  subtitle_enabled: true,
  subtitle_position: "bottom",
  font_name: "TikTokSans-Bold.ttf",
  font_size: 60,
  text_fore_color: "#FFFFFF",
  text_background_color: false,
  stroke_color: "#000000",
  stroke_width: 2,
  paragraph_number: 1,
};

export interface VoiceOption {
  value: string;
  label: string;
  /** nhóm hiển thị trong dropdown */
  group: string;
}

export const VOICES: VoiceOption[] = [
  // ===== Edge TTS — FREE, không cần key (giọng "hay + free" nên để lên đầu) =====
  { group: "🆓 Miễn phí — Tiếng Việt (Edge)", value: "vi-VN-HoaiMyNeural-Female", label: "🇻🇳 Hoài My — Nữ (khuyên dùng)" },
  { group: "🆓 Miễn phí — Tiếng Việt (Edge)", value: "vi-VN-NamMinhNeural-Male", label: "🇻🇳 Nam Minh — Nam" },
  // Giọng đa ngôn ngữ gen mới — đọc được tiếng Việt, rất tự nhiên (vẫn free qua Edge)
  { group: "🆓 Miễn phí — Đa ngôn ngữ (hợp tiếng Anh; đọc tiếng Việt bị giọng lai)", value: "en-US-AvaMultilingualNeural-Female", label: "🌐 Ava — Nữ, tự nhiên" },
  { group: "🆓 Miễn phí — Đa ngôn ngữ (hợp tiếng Anh; đọc tiếng Việt bị giọng lai)", value: "en-US-AndrewMultilingualNeural-Male", label: "🌐 Andrew — Nam, ấm" },
  { group: "🆓 Miễn phí — Đa ngôn ngữ (hợp tiếng Anh; đọc tiếng Việt bị giọng lai)", value: "en-US-EmmaMultilingualNeural-Female", label: "🌐 Emma — Nữ, trẻ" },
  { group: "🆓 Miễn phí — Đa ngôn ngữ (hợp tiếng Anh; đọc tiếng Việt bị giọng lai)", value: "en-US-BrianMultilingualNeural-Male", label: "🌐 Brian — Nam, trầm" },
  // Giọng Anh-Mỹ phổ biến kiểu TikTok (free)
  { group: "🆓 Miễn phí — English (Edge)", value: "en-US-AriaNeural-Female", label: "🇺🇸 Aria — Nữ, kiểu TikTok" },
  { group: "🆓 Miễn phí — English (Edge)", value: "en-US-JennyNeural-Female", label: "🇺🇸 Jenny — Nữ" },
  { group: "🆓 Miễn phí — English (Edge)", value: "en-US-GuyNeural-Male", label: "🇺🇸 Guy — Nam" },
  { group: "🆓 Miễn phí — English (Edge)", value: "en-US-ChristopherNeural-Male", label: "🇺🇸 Christopher — Nam, MC" },
  { group: "🆓 Miễn phí — English (Edge)", value: "en-US-MichelleNeural-Female", label: "🇺🇸 Michelle — Nữ, dịu" },
  { group: "🆓 Miễn phí — 中文 (Edge)", value: "zh-CN-XiaoxiaoNeural-Female", label: "🇨🇳 Xiaoxiao — 女" },
  { group: "🆓 Miễn phí — 中文 (Edge)", value: "zh-CN-YunxiNeural-Male", label: "🇨🇳 Yunxi — 男" },
  // ===== Google Cloud TTS — giọng vi-VN native chất cao, free ~1tr ký tự/tháng (cần key GCP) =====
  { group: "🌟 Google Cloud — Giọng Việt native (free ~1tr ký tự/tháng, cần key)", value: "gcloud:vi-VN-Wavenet-A-Female", label: "🌟 WaveNet A — Nữ (khuyên dùng)" },
  { group: "🌟 Google Cloud — Giọng Việt native (free ~1tr ký tự/tháng, cần key)", value: "gcloud:vi-VN-Wavenet-C-Female", label: "🌟 WaveNet C — Nữ" },
  { group: "🌟 Google Cloud — Giọng Việt native (free ~1tr ký tự/tháng, cần key)", value: "gcloud:vi-VN-Neural2-A-Female", label: "🌟 Neural2 A — Nữ (mới)" },
  { group: "🌟 Google Cloud — Giọng Việt native (free ~1tr ký tự/tháng, cần key)", value: "gcloud:vi-VN-Wavenet-B-Male", label: "🌟 WaveNet B — Nam" },
  { group: "🌟 Google Cloud — Giọng Việt native (free ~1tr ký tự/tháng, cần key)", value: "gcloud:vi-VN-Wavenet-D-Male", label: "🌟 WaveNet D — Nam" },
  { group: "🌟 Google Cloud — Giọng Việt native (free ~1tr ký tự/tháng, cần key)", value: "gcloud:vi-VN-Neural2-D-Male", label: "🌟 Neural2 D — Nam (mới)" },
  // ===== FPT.AI — giọng Việt tự nhiên kiểu voiceover TikTok (cần key FPT, có free tier) =====
  // Giọng ấm/truyền cảm hợp video postcard/chill để đầu danh sách.
  { group: "💌 FPT.AI — Giọng Việt postcard (cần key FPT)", value: "fpt:banmai-Female", label: "💌 Ban Mai — Nữ ấm, postcard (khuyên dùng)" },
  { group: "💌 FPT.AI — Giọng Việt postcard (cần key FPT)", value: "fpt:ngoclam-Female", label: "💌 Ngọc Lam — Nữ truyền cảm (miền Trung)" },
  { group: "💌 FPT.AI — Giọng Việt postcard (cần key FPT)", value: "fpt:thuminh-Female", label: "💌 Thu Minh — Nữ nhẹ nhàng" },
  { group: "💌 FPT.AI — Giọng Việt postcard (cần key FPT)", value: "fpt:linhsan-Female", label: "🌸 Linh San — Nữ miền Nam" },
  { group: "💌 FPT.AI — Giọng Việt postcard (cần key FPT)", value: "fpt:myan-Female", label: "🌸 Mỹ An — Nữ miền Trung" },
  { group: "💌 FPT.AI — Giọng Việt postcard (cần key FPT)", value: "fpt:lannhi-Female", label: "🌸 Lan Nhi — Nữ miền Nam" },
  { group: "💌 FPT.AI — Giọng Việt postcard (cần key FPT)", value: "fpt:leminh-Male", label: "🎙️ Lê Minh — Nam ấm (miền Bắc)" },
  { group: "💌 FPT.AI — Giọng Việt postcard (cần key FPT)", value: "fpt:minhquang-Male", label: "🎙️ Minh Quang — Nam miền Nam" },
  { group: "💌 FPT.AI — Giọng Việt postcard (cần key FPT)", value: "fpt:giahuy-Male", label: "🎙️ Gia Huy — Nam miền Trung" },
  // ===== Gemini TTS — miễn phí với key Gemini sẵn có (quota ngày ít) =====
  { group: "✨ Gemini (free, cần key Gemini)", value: "gemini:Aoede-Female", label: "✨ Aoede — Nữ nhẹ nhàng (postcard)" },
  { group: "✨ Gemini (free, cần key Gemini)", value: "gemini:Charon-Male", label: "✨ Charon — Nam trầm" },
  { group: "✨ Gemini (free, cần key Gemini)", value: "gemini:Puck-Male", label: "✨ Puck — Nam" },
  { group: "✨ Gemini (free, cần key Gemini)", value: "gemini:Zephyr-Female", label: "✨ Zephyr — Nữ" },
  { group: "✨ Gemini (free, cần key Gemini)", value: "gemini:Kore-Female", label: "✨ Kore — Nữ" },
  { group: "✨ Gemini (free, cần key Gemini)", value: "gemini:Fenrir-Male", label: "✨ Fenrir — Nam khỏe" },
  // ===== ElevenLabs — chất nhất, cần key (10k ký tự/tháng free) =====
  { group: "🎙️ ElevenLabs (cần key, chất nhất)", value: "elevenlabs:pNInz6obpgDQGcFmaJgB:Adam-Male", label: "🎙️ Adam — Nam trầm" },
  { group: "🎙️ ElevenLabs (cần key, chất nhất)", value: "elevenlabs:21m00Tcm4TlvDq8ikWAM:Rachel-Female", label: "🎙️ Rachel — Nữ" },
  { group: "🎙️ ElevenLabs (cần key, chất nhất)", value: "elevenlabs:TxGEqnHWrfWFTfGW9XjX:Josh-Male", label: "🎙️ Josh — Nam trẻ" },
  { group: "🎙️ ElevenLabs (cần key, chất nhất)", value: "elevenlabs:EXAVITQu4vr4xnSDxMaL:Bella-Female", label: "🎙️ Bella — Nữ nhẹ nhàng" },
];

/** Thứ tự nhóm voice hiển thị trong dropdown */
export const VOICE_GROUPS: string[] = [
  "🌟 Google Cloud — Giọng Việt native (free ~1tr ký tự/tháng, cần key)",
  "💌 FPT.AI — Giọng Việt postcard (cần key FPT)",
  "🆓 Miễn phí — Tiếng Việt (Edge)",
  "🆓 Miễn phí — Đa ngôn ngữ (hợp tiếng Anh; đọc tiếng Việt bị giọng lai)",
  "🆓 Miễn phí — English (Edge)",
  "🆓 Miễn phí — 中文 (Edge)",
  "✨ Gemini (free, cần key Gemini)",
  "🎙️ ElevenLabs (cần key, chất nhất)",
];

export const LANGUAGES: { value: string; label: string }[] = [
  { value: "vi-VN", label: "Tiếng Việt" },
  { value: "en-US", label: "English" },
  { value: "zh-CN", label: "中文" },
  { value: "", label: "Tự phát hiện" },
];
