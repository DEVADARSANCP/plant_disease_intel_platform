import os
from dotenv import load_dotenv

load_dotenv()

print(f"DEBUG: CWD = {os.getcwd()}")
print(f"DEBUG: .env exists = {os.path.exists('.env')}")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
print(f"DEBUG: GROQ_API_KEY loaded = {'Yes' if GROQ_API_KEY else 'No'}")

GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
DATA_GOV_API_KEY = os.getenv("DATA_GOV_API_KEY", "")
HF_VISION_MODEL = os.getenv(
    "HF_VISION_MODEL",
    "ozair23/mobilenet_v2_1.0_224-finetuned-plantdisease",
)
