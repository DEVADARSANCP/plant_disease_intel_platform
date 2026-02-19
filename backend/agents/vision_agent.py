"""
Vision Detection Agent
Uses local Hugging Face Transformers model to classify plant diseases from leaf images.
"""

from datetime import datetime
import io
import torch
from PIL import Image
from transformers import AutoImageProcessor, AutoModelForImageClassification
from config import HF_VISION_MODEL

# Global cache for model and processor
_model = None
_processor = None


def get_model():
    """Lazy load the model and processor on first request."""
    global _model, _processor
    if _model is None:
        print(f"Loading vision model: {HF_VISION_MODEL}...")
        try:
            _processor = AutoImageProcessor.from_pretrained(HF_VISION_MODEL)
            _model = AutoModelForImageClassification.from_pretrained(HF_VISION_MODEL)
            print("Vision model loaded successfully.")
        except Exception as e:
            print(f"Error loading vision model: {e}")
            raise e
    return _model, _processor


# ── Severity heuristic based on confidence ──
def _estimate_severity(confidence: float) -> str:
    if confidence >= 90:
        return "Stage 4 — Severe / Advanced"
    elif confidence >= 75:
        return "Stage 3 — Moderate Spread"
    elif confidence >= 50:
        return "Stage 2 — Early Development"
    else:
        return "Stage 1 — Initial Onset"


# ── Clean up HF model labels ──
def _clean_label(label: str) -> str:
    """Convert labels like 'Tomato___Late_blight' to 'Tomato — Late Blight'."""
    parts = label.replace("___", " — ").replace("_", " ")
    return parts.title()


async def analyze_image(image_bytes: bytes) -> dict:
    """
    Classify plant disease using local Hugging Face model.
    """
    try:
        model, processor = get_model()

        # Load image from bytes
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        # Preprocess
        inputs = processor(images=image, return_tensors="pt")

        # Inference
        with torch.no_grad():
            outputs = model(**inputs)
            logits = outputs.logits
            probs = torch.nn.functional.softmax(logits, dim=-1)

        # Get top 5 predictions
        top_probs, top_indices = torch.topk(probs, 5)
        
        top_predictions = []
        for score, idx in zip(top_probs[0], top_indices[0]):
            label = model.config.id2label[idx.item()]
            top_predictions.append({
                "label": _clean_label(label),
                "confidence": round(score.item() * 100, 2),
            })

        if not top_predictions:
            return {
                "disease_name": "No result",
                "confidence": 0.0,
                "severity_stage": "Unknown",
                "top_predictions": [],
                "analyzed_at": datetime.now().strftime("%Y-%m-%d %I:%M %p"),
            }

        top = top_predictions[0]

        return {
            "disease_name": top["label"],
            "confidence": top["confidence"],
            "severity_stage": _estimate_severity(top["confidence"]),
            "top_predictions": top_predictions,
            "analyzed_at": datetime.now().strftime("%Y-%m-%d %I:%M %p"),
        }

    except Exception as e:
        print(f"Vision analysis failed: {e}")
        # Return a graceful error structure or re-raise
        raise ValueError(f"Model inference failed: {str(e)}")


