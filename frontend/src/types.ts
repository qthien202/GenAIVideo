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

export const VOICES: { value: string; label: string }[] = [
  // ElevenLabs (cần API key trong Cài đặt) — giọng đa ngôn ngữ, nói được cả tiếng Việt
  { value: "elevenlabs:pNInz6obpgDQGcFmaJgB:Adam-Male", label: "🎙️ Adam (ElevenLabs) — Nam trầm" },
  { value: "elevenlabs:21m00Tcm4TlvDq8ikWAM:Rachel-Female", label: "🎙️ Rachel (ElevenLabs) — Nữ" },
  { value: "elevenlabs:TxGEqnHWrfWFTfGW9XjX:Josh-Male", label: "🎙️ Josh (ElevenLabs) — Nam trẻ" },
  { value: "elevenlabs:EXAVITQu4vr4xnSDxMaL:Bella-Female", label: "🎙️ Bella (ElevenLabs) — Nữ nhẹ nhàng" },
  // Gemini TTS — miễn phí với key Gemini sẵn có, giọng AI tự nhiên, đọc tốt tiếng Việt
  { value: "gemini:Puck-Male", label: "✨ Puck (Gemini) — Nam" },
  { value: "gemini:Zephyr-Female", label: "✨ Zephyr (Gemini) — Nữ" },
  { value: "gemini:Charon-Male", label: "✨ Charon (Gemini) — Nam trầm" },
  { value: "gemini:Kore-Female", label: "✨ Kore (Gemini) — Nữ" },
  { value: "gemini:Aoede-Female", label: "✨ Aoede (Gemini) — Nữ nhẹ nhàng" },
  { value: "gemini:Fenrir-Male", label: "✨ Fenrir (Gemini) — Nam khỏe" },
  // Edge TTS — miễn phí, không cần key
  { value: "vi-VN-HoaiMyNeural-Female", label: "🇻🇳 Hoài My — Nữ" },
  { value: "vi-VN-NamMinhNeural-Male", label: "🇻🇳 Nam Minh — Nam" },
  { value: "en-US-JennyNeural-Female", label: "🇺🇸 Jenny — Female" },
  { value: "en-US-AriaNeural-Female", label: "🇺🇸 Aria — Female" },
  { value: "en-US-GuyNeural-Male", label: "🇺🇸 Guy — Male" },
  { value: "en-US-ChristopherNeural-Male", label: "🇺🇸 Christopher — Male" },
  { value: "en-US-AvaMultilingualNeural-Female", label: "🇺🇸 Ava (Đa ngôn ngữ) — Female" },
  { value: "en-US-AndrewMultilingualNeural-Male", label: "🇺🇸 Andrew (Đa ngôn ngữ) — Male" },
  { value: "zh-CN-XiaoxiaoNeural-Female", label: "🇨🇳 Xiaoxiao — 女" },
  { value: "zh-CN-YunxiNeural-Male", label: "🇨🇳 Yunxi — 男" },
];

export const LANGUAGES: { value: string; label: string }[] = [
  { value: "vi-VN", label: "Tiếng Việt" },
  { value: "en-US", label: "English" },
  { value: "zh-CN", label: "中文" },
  { value: "", label: "Tự phát hiện" },
];
