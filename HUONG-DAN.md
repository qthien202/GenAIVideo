# 🎬 GenAI Video — Hướng dẫn sử dụng

Tạo video ngắn (TikTok / Reels / Shorts) tự động bằng AI: viết kịch bản → giọng đọc → phụ đề → ghép video nền → xuất MP4.

Fork từ [MoneyPrinterTurbo](https://github.com/harry0703/MoneyPrinterTurbo), thay WebUI Streamlit bằng **React frontend mới** (Vite + Tailwind, giao diện tiếng Việt) cùng nhiều fix & tính năng riêng.

## Có gì khác bản gốc

- ✨ **Frontend React mới**: glassmorphism, responsive mobile, modal Thư viện / Cài đặt
- ⚙️ **Cài đặt ngay trên web**: chọn LLM provider (18 loại), model, API key — không cần sửa file
- 🎙️ **Giọng ElevenLabs** (Adam, Rachel, Josh, Bella) bên cạnh Edge TTS miễn phí
- 🇻🇳 **Preset bối cảnh Việt Nam**: 12 tỉnh thành (Hà Nội, TP.HCM, Cần Thơ, Đà Lạt...) — từ khóa đã khảo sát thật trên Pexels
- 🔤 **Font phụ đề Be Vietnam Pro**: hết vỡ dấu tiếng Việt; phụ đề viền chữ, không hộp đen
- 🐛 **Fix lỗi gốc**: task treo vĩnh viễn khi lỗi, search Pexels từng-ký-tự khi LLM lỗi, phụ đề rơi sang Whisper 3GB khi lệch dòng

## Cài đặt

Yêu cầu: Python 3.11+, [uv](https://docs.astral.sh/uv/), Node 18+, [pnpm](https://pnpm.io/), ffmpeg.

```bash
git clone git@github.com:qthien202/GenAIVideo.git
cd GenAIVideo

# Backend
uv sync

# Frontend
cd frontend && pnpm install && cd ..
```

## Chạy

Mở 2 terminal:

```bash
# Terminal 1 — Backend (FastAPI, port 8080)
.venv/bin/python main.py

# Terminal 2 — Frontend (Vite, port 3000)
cd frontend && pnpm dev
```

Mở **http://localhost:3000**. API docs: http://localhost:3000/docs

## Lấy API key (cần trước khi tạo video)

Mở web → nút **⚙️ Cài đặt** → điền 3 nhóm key:

| Key | Bắt buộc | Lấy ở đâu | Free tier |
|---|---|---|---|
| **LLM** (Gemini/Groq/...) | ✅ | [Gemini](https://aistudio.google.com/apikey) · [Groq](https://console.groq.com/keys) | Có, đủ dùng |
| **Pexels** (video nền) | ✅ | [pexels.com/api](https://www.pexels.com/api/) | 200 req/giờ |
| **ElevenLabs** (giọng xịn) | ❌ | [elevenlabs.io](https://elevenlabs.io/app/settings/api-keys) | 10k ký tự/tháng |

- Không có ElevenLabs key vẫn dùng được **giọng Edge TTS miễn phí** (Hoài My, Nam Minh...)
- Gemini hay dính 429 (hết quota ngày) → đổi model `gemini-2.5-flash-lite` hoặc chuyển qua Groq
- Key lưu vào `config.toml` (đã gitignore — không lo lộ key khi push)

## Tạo video

1. Nhập **chủ đề** (vd: *"5 quán cà phê chill ở Cần Thơ"*)
2. Bấm **✨ AI viết kịch bản** hoặc tự viết / sửa
3. Chọn **giọng đọc** — 🎙️ Adam (ElevenLabs) hoặc 🇻🇳 giọng Việt miễn phí
4. Chọn **bối cảnh video nền**:
   - 🌏 Tự động — AI sinh từ khóa theo chủ đề
   - 🏙️ Theo thành phố — 12 tỉnh thành VN, mỗi nơi trộn landmark + cảnh phố chill
   - 🎨 Theo chủ đề — Thiên nhiên / Chill Cafe / Tổng hợp
5. (Tùy chọn) **Thiết lập nâng cao**: từ khóa tự gõ (tiếng Anh ra nhiều cảnh hơn, tiếng Việt vẫn chạy), độ dài clip, tốc độ đọc, nhạc nền, phụ đề...
6. **🚀 Tạo video ngay** — theo dõi tiến độ, xong thì xem + tải ngay trên web

Video lưu tại `storage/tasks/<task-id>/`. Tab **📚 Thư viện** xem lại tất cả.

> 💡 **Mẹo tiết kiệm quota LLM**: giữ kịch bản đã sinh + chọn preset bối cảnh (thay vì Tự động) → tạo video không tốn request LLM nào.

## Phụ đề

- Font mặc định **Be Vietnam Pro Bold** — đầy đủ dấu tiếng Việt
- Kiểu chữ trắng + viền đen (không hộp đen che cảnh)
- Muốn đổi font: thả file `.ttf` vào `resource/fonts/` rồi đổi `font_name` khi gọi API

## Lỗi thường gặp

| Triệu chứng | Nguyên nhân → Cách xử lý |
|---|---|
| Task báo lỗi `pexels_api_keys is not set` | Chưa điền Pexels key → ⚙️ Cài đặt |
| Lỗi `429 ... exceeded your current quota` | LLM hết quota → đổi model nhẹ hơn / qua Groq / điền từ khóa tay |
| Modal Cài đặt trống trơn | Backend chưa chạy → bật `python main.py` rồi mở lại modal |
| Sửa code backend xong không ăn | Restart backend (Ctrl+C → chạy lại); riêng key/config thì ăn ngay không cần |
| Phụ đề vỡ dấu (video cũ) | Tạo trước khi fix font → tạo video mới |

## Cập nhật code mới từ repo gốc

```bash
git fetch upstream
git merge upstream/main
git push origin main
```

(`upstream` = harry0703/MoneyPrinterTurbo; `frontend/` là folder riêng nên hầu như không bao giờ conflict)
