"""
xray_classifier.py
------------------
Load ViT_Classifier đã train từ HuggingFace (tta1301/xray-mae-vit-classifier)
và thực hiện multi-label classification cho ảnh X-quang ngực.

Model architecture phản ánh đúng file vit_mae_xrays.ipynb:
  - image_size=224, patch_size=16, emb_dim=192
  - encoder_layer=12, encoder_head=6, num_classes=15
  - Multi-label: sigmoid > 0.5 threshold
"""

#pip install einops timm huggingface_hub
import io
import os
import logging
from functools import lru_cache
from typing import List, Dict

import torch
import torch.nn as nn
import torchvision.transforms as transforms
from PIL import Image
from einops import rearrange
from timm.models.layers import trunc_normal_
from huggingface_hub import hf_hub_download

import logging
logger = logging.getLogger(__name__)

# ── Labels 15 bệnh NIH ChestX-ray ────────────────────────────────────────────

XRAY_LABELS = [
    "No Finding",        # 0
    "Atelectasis",       # 1
    "Cardiomegaly",      # 2
    "Effusion",          # 3
    "Infiltration",      # 4
    "Mass",              # 5
    "Nodule",            # 6
    "Pneumonia",         # 7
    "Pneumothorax",      # 8
    "Consolidation",     # 9
    "Edema",             # 10
    "Emphysema",         # 11
    "Fibrosis",          # 12
    "Pleural_Thickening",# 13
    "Hernia",            # 14
]

LABEL_VI = {
    "Atelectasis":        "Xẹp phổi (Atelectasis)",
    "Cardiomegaly":       "Tim to (Cardiomegaly)",
    "Consolidation":      "Đông đặc phổi (Consolidation)",
    "Edema":              "Phù phổi (Edema)",
    "Effusion":           "Tràn dịch màng phổi (Effusion)",
    "Emphysema":          "Khí thũng phổi (Emphysema)",
    "Fibrosis":           "Xơ phổi (Fibrosis)",
    "Hernia":             "Thoát vị (Hernia)",
    "Infiltration":       "Thâm nhiễm phổi (Infiltration)",
    "Mass":               "Khối u phổi (Mass)",
    "No Finding":         "Không phát hiện bất thường",
    "Nodule":             "Nốt phổi (Nodule)",
    "Pleural_Thickening": "Dày màng phổi (Pleural Thickening)",
    "Pneumonia":          "Viêm phổi (Pneumonia)",
    "Pneumothorax":       "Tràn khí màng phổi (Pneumothorax)",
}

HF_REPO_ID = os.getenv("XRAY_HF_REPO", "tta1301/xray-mae-vit-classifier")
THRESHOLD  = float(os.getenv("XRAY_THRESHOLD", "0.5"))  #Ngưỡng đúng cho phép




class _Block(nn.Module):
    def __init__(self, emb_dim: int, num_head: int):
        super().__init__()
        self.ln_1      = nn.LayerNorm(emb_dim)
        self.attention = nn.MultiheadAttention(emb_dim, num_head, batch_first=True)
        self.ln_2      = nn.LayerNorm(emb_dim)
        self.mlp       = nn.Sequential(
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
        emb_dim:    int = 192,
        num_layer:  int = 12,
        num_head:   int = 6,
        num_classes: int = 15,
    ):
        super().__init__()
        self.patchify     = nn.Conv2d(3, emb_dim, patch_size, patch_size)
        num_patches       = (image_size // patch_size) ** 2
        self.pos_embedding = nn.Parameter(torch.zeros(1, num_patches + 1, emb_dim))
        self.cls_token    = nn.Parameter(torch.zeros(1, 1, emb_dim))
        self.transformer  = nn.Sequential(*[_Block(emb_dim, num_head) for _ in range(num_layer)])
        self.classifier   = _ClassificationHead(emb_dim, num_classes)
        trunc_normal_(self.cls_token,     std=0.02)
        trunc_normal_(self.pos_embedding, std=0.02)

    def forward(self, img: torch.Tensor) -> torch.Tensor:
        patches = self.patchify(img)                           # [B, C, H, W]
        patches = rearrange(patches, "b c h w -> b (h w) c")  # [B, N, C]
        B       = patches.shape[0]
        cls     = self.cls_token.expand(B, -1, -1)            # [B, 1, C]
        x       = torch.cat([cls, patches], dim=1)            # [B, N+1, C]
        x       = x + self.pos_embedding
        x       = self.transformer(x)
        return self.classifier(x[:, 0])                       # CLS token → logits


# ── Singleton loader ──────────────────────────────────────────────────────────

@lru_cache(maxsize=1)
def _load_model() -> tuple:
    """
    Download config + weights từ HuggingFace một lần duy nhất.
    Trả về (model, device).
    """
    logger.info(f"[XRay] Đang tải model từ HuggingFace: {HF_REPO_ID}")

    cfg_path    = hf_hub_download(repo_id=HF_REPO_ID, filename="config.pth")
    weight_path = hf_hub_download(repo_id=HF_REPO_ID, filename="pytorch_model.bin")

    cfg = torch.load(cfg_path, map_location="cpu")
    logger.info(f"[XRay] Config: {cfg}")

    model = ViT_Classifier(
        image_size  = cfg.get("image_size",  224),
        patch_size  = cfg.get("patch_size",  16),
        emb_dim     = cfg.get("emb_dim",     192),
        num_layer   = cfg.get("num_layer",   12),
        num_head    = cfg.get("num_head",    6),
        num_classes = cfg.get("num_classes", 15),
    )

    state_dict = torch.load(weight_path, map_location="cpu")
    model.load_state_dict(state_dict)
    model.eval()

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model  = model.to(device)

    logger.info(f"[XRay] Model đã sẵn sàng trên {device}")
    return model, device


# ── Transform

_TRANSFORM = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225]),
])


# ── Public API ────────────────────────────────────────────────────────────────

def classify_xray(image_bytes: bytes, threshold: float = THRESHOLD) -> Dict:
    """
    Nhận vào bytes của file ảnh, trả về dict kết quả phân loại.

    Returns:
        {
            "findings":     ["Pneumonia", "Effusion"],   # en
            "findings_vi":  ["Viêm phổi", "Tràn dịch màng phổi"],
            "scores":       {"Pneumonia": 0.82, ...},    # chỉ các class > threshold
            "no_finding":   False,
            "raw_scores":   {"Atelectasis": 0.12, ...},  # tất cả 15 class
        }
    """
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as e:
        raise ValueError(f"Không thể đọc ảnh: {e}")

    model, device = _load_model()

    tensor = _TRANSFORM(img).unsqueeze(0).to(device)   # [1, 3, 224, 224]

    with torch.no_grad():
        logits = model(tensor)                          # [1, 15]
        probs  = torch.sigmoid(logits).squeeze(0)      # [15]

    scores_all: Dict[str, float] = {
        label: round(probs[i].item(), 4)
        for i, label in enumerate(XRAY_LABELS)
    }

    findings = [
        label for label, score in scores_all.items()
        if score >= threshold and label != "No Finding"
    ]

    # Nếu không tìm thấy bệnh nào thì xem xét No Finding
    if not findings:
        findings = ["No Finding"]

    return {
        "findings":    findings,
        "findings_vi": [LABEL_VI[f] for f in findings],
        "scores":      {f: scores_all[f] for f in findings},
        "no_finding":  findings == ["No Finding"],
        "raw_scores":  scores_all,
    }


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
        pct   = int(score * 100)
        lines.append(f"  • {vi_name} — độ tin cậy {pct}%")

    lines.append(
        "\n Đây là kết quả hỗ trợ từ AI, KHÔNG thay thế chẩn đoán của bác sĩ chuyên khoa."
    )
    return "\n".join(lines)