import json
from typing import List

from fastapi import File, Request, UploadFile
from fastapi.responses import Response
from loguru import logger
from pydantic import BaseModel

from app.config import config
from app.controllers.v1.base import new_router
from app.utils import utils

# Các field key được export/import qua "file key" (ngoài các provider LLM)
_EXTRA_KEY_FIELDS = (
    "pexels_api_keys",
    "pixabay_api_keys",
    "elevenlabs_api_key",
    "fpt_api_key",
    "gcloud_tts_api_key",
)

# authentication dependency
# router = new_router(dependencies=[Depends(base.verify_token)])
router = new_router()

# Các provider dùng quy ước "<prefix>_api_key / _model_name / _base_url" trong config.toml
LLM_PROVIDERS = [
    "openai",
    "gemini",
    "deepseek",
    "groq",
    "grok",
    "qwen",
    "moonshot",
    "azure",
    "aihubmix",
    "oneapi",
    "ollama",
    "g4f",
    "pollinations",
    "cloudflare",
    "minimax",
    "mimo",
    "modelscope",
    "ernie",
]


def _to_key_list(value) -> List[str]:
    # config cho phép string đơn hoặc list
    if isinstance(value, str):
        return [value] if value else []
    return list(value or [])


@router.get("/config", summary="Get LLM & material provider settings")
def get_settings(request: Request):
    providers = {}
    for p in LLM_PROVIDERS:
        providers[p] = {
            "api_key": config.app.get(f"{p}_api_key", ""),
            "model_name": config.app.get(f"{p}_model_name", ""),
            "base_url": config.app.get(f"{p}_base_url", ""),
        }
    response = {
        "llm_provider": config.app.get("llm_provider", "openai"),
        "providers": providers,
        "pexels_api_keys": _to_key_list(config.app.get("pexels_api_keys")),
        "pixabay_api_keys": _to_key_list(config.app.get("pixabay_api_keys")),
        "elevenlabs_api_key": config.app.get("elevenlabs_api_key", ""),
        "fpt_api_key": config.app.get("fpt_api_key", ""),
        "gcloud_tts_api_key": config.app.get("gcloud_tts_api_key", ""),
    }
    return utils.get_response(200, response)


class SaveSettingsRequest(BaseModel):
    llm_provider: str
    api_key: str = ""
    model_name: str = ""
    base_url: str = ""
    pexels_api_keys: List[str] = []
    pixabay_api_keys: List[str] = []
    elevenlabs_api_key: str = ""
    fpt_api_key: str = ""
    gcloud_tts_api_key: str = ""


@router.put("/config", summary="Update LLM & material provider settings")
def save_settings(request: Request, body: SaveSettingsRequest):
    provider = body.llm_provider.strip().lower()
    if provider not in LLM_PROVIDERS:
        return utils.get_response(400, message=f"unsupported llm_provider: {provider}")

    config.app["llm_provider"] = provider
    config.app[f"{provider}_api_key"] = body.api_key.strip()
    config.app[f"{provider}_model_name"] = body.model_name.strip()
    config.app[f"{provider}_base_url"] = body.base_url.strip()
    config.app["pexels_api_keys"] = [k.strip() for k in body.pexels_api_keys if k.strip()]
    config.app["pixabay_api_keys"] = [k.strip() for k in body.pixabay_api_keys if k.strip()]
    config.app["elevenlabs_api_key"] = body.elevenlabs_api_key.strip()
    config.app["fpt_api_key"] = body.fpt_api_key.strip()
    config.app["gcloud_tts_api_key"] = body.gcloud_tts_api_key.strip()
    config.save_config()

    return utils.get_response(200)


def _collect_all_keys() -> dict:
    """Gom toàn bộ key (mọi provider LLM + nguồn video + TTS) thành 1 dict."""
    providers = {}
    for p in LLM_PROVIDERS:
        providers[p] = {
            "api_key": config.app.get(f"{p}_api_key", ""),
            "model_name": config.app.get(f"{p}_model_name", ""),
            "base_url": config.app.get(f"{p}_base_url", ""),
        }
    data = {"llm_provider": config.app.get("llm_provider", ""), "providers": providers}
    for k in _EXTRA_KEY_FIELDS:
        data[k] = config.app.get(k, "")
    return data


@router.get("/config/export", summary="Tải toàn bộ API key thành 1 file (mang qua máy khác)")
def export_keys(request: Request):
    content = json.dumps(_collect_all_keys(), ensure_ascii=False, indent=2)
    return Response(
        content=content,
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=genaivideo-keys.json"},
    )


@router.post("/config/import", summary="Nạp API key từ file đã tải về trước đó")
async def import_keys(request: Request, file: UploadFile = File(...)):
    raw = await file.read()
    try:
        data = json.loads(raw.decode("utf-8-sig"))
    except Exception as e:  # noqa: BLE001
        logger.warning(f"import keys: invalid file: {e}")
        return utils.get_response(400, message="File không hợp lệ — cần file key .json tải từ nút Xuất.")

    applied = 0
    if data.get("llm_provider"):
        config.app["llm_provider"] = str(data["llm_provider"]).strip().lower()
        applied += 1
    for p, cfg in (data.get("providers") or {}).items():
        if p not in LLM_PROVIDERS or not isinstance(cfg, dict):
            continue
        for suf in ("api_key", "model_name", "base_url"):
            v = cfg.get(suf)
            if v:  # chỉ ghi đè khi có giá trị, tránh xoá key đang có
                config.app[f"{p}_{suf}"] = v
                applied += 1
    for k in _EXTRA_KEY_FIELDS:
        if k in data and data[k]:
            config.app[k] = data[k]
            applied += 1

    if applied == 0:
        return utils.get_response(400, message="File không có key nào để nạp.")
    config.save_config()
    return utils.get_response(200, {"applied": applied})
