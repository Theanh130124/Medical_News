"""
xray_classifier.py (updated)
------------------
Thêm logging chi tiết cho kết quả phân loại X-ray
"""

import io
import os
import logging
from functools import lru_cache
from typing import List, Dict
import json
from datetime import datetime

import torch
import torch.nn as nn
import torchvision.transforms as transforms
from PIL import Image
from einops import rearrange
from timm.models.layers import trunc_normal_
from huggingface_hub import hf_hub_download

# Cấu hình logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ── Labels 14 bệnh (bỏ No Finding) theo mapping model ─────────────────────────


XRAY_LABELS = [
    "No Finding",           # 0
    "Atelectasis",          # 1
    "Cardiomegaly",         # 2
    "Effusion",             # 3
    "Infiltration",         # 4
    "Mass",                 # 5
    "Nodule",               # 6
    "Pneumonia",            # 7
    "Pneumothorax",         # 8
    "Consolidation",        # 9
    "Edema",                # 10
    "Emphysema",            # 11
    "Fibrosis",             # 12
    "Pleural_Thickening",   # 13
    "Hernia",               # 14
]


LABEL_VI = {
    "No Finding": "Không phát hiện bất thường (No Finding)",
    "Atelectasis": "Xẹp phổi (Atelectasis)",
    "Cardiomegaly": "Tim to (Cardiomegaly)",
    "Consolidation": "Đông đặc phổi (Consolidation)",
    "Edema": "Phù phổi (Edema)",
    "Effusion": "Tràn dịch màng phổi (Effusion)",
    "Emphysema": "Khí phế thũng (Emphysema)",
    "Fibrosis": "Xơ phổi (Fibrosis)",
    "Hernia": "Thoát vị hoành (Hernia)",
    "Infiltration": "Thâm nhiễm phổi (Infiltration)",
    "Mass": "Khối u phổi (Mass)",
    "Nodule": "Nốt phổi (Nodule)",
    "Pleural_Thickening": "Dày màng phổi (Pleural Thickening)",
    "Pneumonia": "Viêm phổi (Pneumonia)",
    "Pneumothorax": "Tràn khí màng phổi (Pneumothorax)",
}

# Model mới từ HuggingFace
HF_REPO_ID = os.getenv("XRAY_HF_REPO", "tta1301/xray-vit-classifier-v3")
THRESHOLD = float(os.getenv("XRAY_THRESHOLD", "0.7"))


class _Block(nn.Module):
    def __init__(self, emb_dim: int, num_head: int):
        super().__init__()
        self.ln_1 = nn.LayerNorm(emb_dim)
        self.attention = nn.MultiheadAttention(emb_dim, num_head, batch_first=True)
        self.ln_2 = nn.LayerNorm(emb_dim)
        self.mlp = nn.Sequential(
            nn.Linear(emb_dim, emb_dim * 4),
            nn.GELU(),
            nn.Linear(emb_dim * 4, emb_dim),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        attn_out, _ = self.attention(self.ln_1(x), self.ln_1(x), self.ln_1(x))
        x = x + attn_out
        x = x + self.mlp(self.ln_2(x))
        return x


class _ClassificationHead(nn.Module):
    def __init__(self, emb_dim: int, num_classes: int):
        super().__init__()
        self.norm = nn.LayerNorm(emb_dim)
        self.head = nn.Linear(emb_dim, num_classes)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.head(self.norm(x))


class ViT_Classifier(nn.Module):
    """ViT Classifier được fine-tune từ MAE encoder."""

    def __init__(
            self,
            image_size: int = 224,
            patch_size: int = 16,
            emb_dim: int = 192,
            num_layer: int = 12,
            num_head: int = 6,
            num_classes: int = 15,
    ):
        super().__init__()
        self.patchify = nn.Conv2d(3, emb_dim, patch_size, patch_size)
        num_patches = (image_size // patch_size) ** 2
        self.pos_embedding = nn.Parameter(torch.zeros(1, num_patches + 1, emb_dim))
        self.cls_token = nn.Parameter(torch.zeros(1, 1, emb_dim))
        self.transformer = nn.Sequential(*[_Block(emb_dim, num_head) for _ in range(num_layer)])
        self.classifier = _ClassificationHead(emb_dim, num_classes)
        trunc_normal_(self.cls_token, std=0.02)
        trunc_normal_(self.pos_embedding, std=0.02)

    def forward(self, img: torch.Tensor) -> torch.Tensor:
        patches = self.patchify(img)  # [B, C, H, W]
        patches = rearrange(patches, "b c h w -> b (h w) c")  # [B, N, C]
        B = patches.shape[0]
        cls = self.cls_token.expand(B, -1, -1)  # [B, 1, C]
        x = torch.cat([cls, patches], dim=1)  # [B, N+1, C]
        x = x + self.pos_embedding
        x = self.transformer(x)
        return self.classifier(x[:, 0])  # CLS token → logits


# ── Singleton loader ──────────────────────────────────────────────────────────

@lru_cache(maxsize=1)
def _load_model() -> tuple:
    """
    Download model từ HuggingFace một lần duy nhất.
    Trả về (model, device).
    """
    logger.info(f"[XRay] Đang tải model từ HuggingFace: {HF_REPO_ID}")

    # Dùng transformers để load model đã push
    from transformers import AutoImageProcessor, AutoModelForImageClassification

    processor = AutoImageProcessor.from_pretrained(HF_REPO_ID)
    model = AutoModelForImageClassification.from_pretrained(HF_REPO_ID)

    model.eval()

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = model.to(device)

    logger.info(f"[XRay] Model đã sẵn sàng trên {device}")
    return model, device, processor


# ── Transform (dùng mean/std của model ViT) ───────────────────────────────────

def _get_transform(processor):
    return transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=processor.image_mean, std=processor.image_std),
    ])


# ── Helper function để log đẹp ────────────────────────────────────────────────

def _log_prediction_result(result: Dict, image_size: int = None):
    """
    In kết quả dự đoán X-ray ra log với format đẹp
    """
    logger.info("=" * 80)
    logger.info(" X-RAY CLASSIFICATION RESULT")
    logger.info("=" * 80)

    if image_size:
        logger.info(f" Image size: {image_size} bytes")

    logger.info(f" Threshold: {THRESHOLD}")
    logger.info(f" No Finding detected: {result['no_finding']}")
    logger.info("-" * 80)

    if result["no_finding"]:
        logger.info("KẾT QUẢ: Không phát hiện bất thường")
    else:
        logger.info(" PHÁT HIỆN BỆNH LÝ:")
        for en_name, vi_name in zip(result["findings"], result["findings_vi"]):
            score = result["scores"][en_name]
            logger.info(f"   • {vi_name:35} | {en_name:20} | Độ tin cậy: {score:.2%}")

    logger.info("-" * 80)
    logger.info(" CHI TIẾT ĐIỂM SỐ CHO TẤT CẢ CÁC CLASS:")

    # Sắp xếp theo score giảm dần
    sorted_scores = sorted(result["raw_scores"].items(), key=lambda x: x[1], reverse=True)
    for label, score in sorted_scores:
        vi_name = LABEL_VI.get(label, label)
        marker = "✓" if score >= THRESHOLD else " "
        logger.info(f"   [{marker}] {vi_name:35} | {label:20} | {score:.2%}")

    logger.info("=" * 80)

    # Log JSON format cho dễ parse
    logger.info(" JSON format:")
    logger.info(json.dumps({
        "timestamp": datetime.now().isoformat(),
        "findings": result["findings"],
        "findings_vi": result["findings_vi"],
        "top_scores": {k: v for k, v in sorted_scores[:5]},
        "no_finding": result["no_finding"]
    }, indent=2, ensure_ascii=False))
    logger.info("=" * 80)


# ── Public API ────────────────────────────────────────────────────────────────

def classify_xray(image_bytes: bytes, threshold: float = THRESHOLD) -> Dict:
    """
    Nhận vào bytes của file ảnh, trả về dict kết quả phân loại.

    Có log chi tiết kết quả dự đoán ra console.

    Returns:
        {
            "findings":     ["Pneumonia", "Effusion"],   # en
            "findings_vi":  ["Viêm phổi", "Tràn dịch màng phổi"],
            "scores":       {"Pneumonia": 0.82, ...},    # chỉ các class > threshold
            "no_finding":   False,
            "raw_scores":   {"Atelectasis": 0.12, ...},  # tất cả 14 class
        }
    """
    logger.info(" Bắt đầu phân tích ảnh X-quang...")

    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        logger.info(f"Đọc ảnh thành công: {img.size}, mode={img.mode}")
    except Exception as e:
        logger.error(f" Không thể đọc ảnh: {e}")
        raise ValueError(f"Không thể đọc ảnh: {e}")

    model, device, processor = _load_model()
    logger.info(f"  Đang chạy trên device: {device}")

    transform = _get_transform(processor)
    tensor = transform(img).unsqueeze(0).to(device)  # [1, 3, 224, 224]
    logger.info(f" Tensor shape: {tensor.shape}")

    with torch.no_grad():
        outputs = model(pixel_values=tensor)
        logits = outputs.logits
        probs = torch.sigmoid(logits).squeeze(0)  # [14]
        logger.info(f" Probabilities: {probs.tolist()}")

    scores_all: Dict[str, float] = {
        label: round(probs[i].item(), 4)
        for i, label in enumerate(XRAY_LABELS)
    }

    findings = [
        label for label, score in scores_all.items()
        if score >= threshold
    ]

    # Nếu không tìm thấy bệnh nào thì coi như No Finding
    no_finding = scores_all.get("No Finding", 0) >= threshold or len(findings) == 0

    result = {
        "findings": findings,
        "findings_vi": [LABEL_VI[f] for f in findings],
        "scores": {f: scores_all[f] for f in findings},
        "no_finding": no_finding,
        "raw_scores": scores_all,
    }

    # Log kết quả chi tiết
    _log_prediction_result(result, image_size=len(image_bytes))

    return result


def format_xray_result(result: Dict) -> str:
    """
    Chuyển dict kết quả sang chuỗi mô tả ngắn gọn để đưa vào RAG context.
    """
    if result["no_finding"]:
        return (
            "Kết quả phân tích X-quang ngực bằng AI: "
            "**Không phát hiện bất thường rõ ràng** trên ảnh X-quang này. "
            "Độ tin cậy: không có dấu hiệu bệnh lý nào vượt ngưỡng phát hiện."
        )

    lines = [
        "Kết quả phân tích X-quang ngực bằng AI (ViT-MAE):",
        "Các dấu hiệu bệnh lý có thể phát hiện:",
    ]
    for vi_name, en_name in zip(result["findings_vi"], result["findings"]):
        score = result["scores"][en_name]
        pct = int(score * 100)
        lines.append(f"  • {vi_name} — độ tin cậy {pct}%")

    lines.append(
        "\n Đây là kết quả hỗ trợ từ AI, KHÔNG thay thế chẩn đoán của bác sĩ chuyên khoa."
    )
    return "\n".join(lines)