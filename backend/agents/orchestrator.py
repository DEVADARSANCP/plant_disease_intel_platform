"""
Orchestration Agent
Uses Groq (Llama 3.3 70B) to synthesize outputs from all four agents
into a unified risk assessment and actionable recommendations.

The orchestrator is self-fetching: when context params (state_id,
commodity_id, market_id, lat, lon) are provided, it calls all agents
in parallel before invoking the LLM reasoning layer.
"""

import json
import asyncio
from datetime import datetime
from groq import Groq
from config import GROQ_API_KEY, GROQ_MODEL
from domains.market import get_market_data, resolve_coords_for_state
from agents.climate_agent import get_climate_risk
from agents.satellite_agent import get_satellite_health


SYSTEM_PROMPT = """You are an expert agricultural intelligence orchestrator.
You analyze outputs from four specialized AI agents:
1. Vision Detection Agent — classifies plant diseases from leaf images
2. Climate Risk Agent — assesses weather-based outbreak risk
3. Satellite Health Agent — monitors vegetation health via remote sensing
4. Market Intelligence Agent — provides real-time mandi prices, arrival volumes, and buyer signals

Your job is to synthesize their outputs into a unified assessment. You MUST respond with ONLY valid JSON (no markdown, no explanation outside JSON) matching this exact structure:

{
  "agents": [
    {
      "name": "Vision Detection Agent",
      "status": "Verified|Pending|Conflict",
      "confidence": <number>,
      "reasoning": "<brief explanation>"
    },
    {
      "name": "Climate Risk Agent",
      "status": "Verified|Pending|Conflict",
      "confidence": <number>,
      "reasoning": "<brief explanation>"
    },
    {
      "name": "Satellite Health Agent",
      "status": "Verified|Pending|Conflict",
      "confidence": <number>,
      "reasoning": "<brief explanation>"
    },
    {
      "name": "Market Intelligence Agent",
      "status": "Verified|Pending|Conflict",
      "confidence": <number>,
      "reasoning": "<brief explanation>"
    }
  ],
  "overall_status": "Confirmed Threat|Probable Threat|Under Review|Low Risk",
  "consensus_score": <0-100>,
  "risk_level": "High|Moderate|Low",
  "ai_recommendation": "BUY|HOLD|SELL",
  "recommendation_reason": "<1-2 sentence rationale combining disease risk + market signal>",
  "action_summary": "<2-3 sentence action plan>",
  "biological_controls": [
    {
      "name": "<organism/product name>",
      "application": "<how to apply>",
      "priority": "High|Medium|Low"
    }
  ],
  "chemical_advisory": {
    "recommendation": "<Minimal Use|Not Required|Targeted Application>",
    "notes": "<detailed guidance>",
    "restrictions": ["<restriction 1>", "<restriction 2>"]
  },
  "conflicts": ["<any data conflicts or concerns>"]
}

Rules:
- Set agent status to "Verified" if data is consistent and recent
- Set to "Pending" if data is stale (>6 hours old) or confidence is low (<60%)
- Set to "Conflict" if agent data contradicts other agents
- Always prioritize biological controls over chemical intervention
- ai_recommendation must factor in BOTH disease risk AND market price trend
- If market trend is "up" and disease risk is Low → BUY
- If market trend is "down" or disease risk is High → SELL or HOLD
- If vision data is missing, note it but still analyze climate + satellite + market data
"""


async def run_orchestration(agent_data: dict) -> dict:
    """
    Self-fetching orchestrator: accepts context params and calls all agents
    in parallel before passing combined data to the Groq LLM.
    """
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY is not set. Please add it to your .env file.")

    # ── Extract context params (text-based, matching CSV columns) ──
    region    = str(agent_data.get("region",    "Kerala_Kottayam"))
    commodity = str(agent_data.get("commodity", "Banana"))
    lat       = agent_data.get("lat")
    lon       = agent_data.get("lon")

    # Resolve coordinates from region name if not provided
    if lat is None or lon is None:
        lat, lon = resolve_coords_for_state(region)

    # ── Parallel agent calls ──
    market_task   = get_market_data(region, commodity)
    climate_task  = get_climate_risk(lat, lon)
    satellite_task = get_satellite_health(lat, lon)

    market_result, climate_result, satellite_result = await asyncio.gather(
        market_task, climate_task, satellite_task,
        return_exceptions=True,
    )

    # Safely unwrap results (replace exceptions with error dicts)
    def _safe(result, label):
        if isinstance(result, Exception):
            return {"status": "error", "error": str(result), "agent": label}
        return result

    market_data   = agent_data.get("market")   or _safe(market_result,   "market")
    climate_data  = agent_data.get("climate")  or _safe(climate_result,  "climate")
    satellite_data = agent_data.get("satellite") or _safe(satellite_result, "satellite")
    vision_data   = agent_data.get("vision")

    # ── Build LLM user message ──
    user_message = "Analyze the following agent outputs and provide your orchestrated assessment:\n\n"
    user_message += f"## Context\nRegion: {region} | Commodity: {commodity}\nCoordinates: {lat:.4f}°N, {lon:.4f}°E\n\n"

    if vision_data:
        user_message += f"## Vision Detection Agent Output\n```json\n{json.dumps(vision_data, indent=2)}\n```\n\n"
    else:
        user_message += "## Vision Detection Agent Output\nNo image has been analyzed yet. Skip vision assessment.\n\n"

    user_message += f"## Climate Risk Agent Output\n```json\n{json.dumps(climate_data, indent=2)}\n```\n\n"
    user_message += f"## Satellite Health Agent Output\n```json\n{json.dumps(satellite_data, indent=2)}\n```\n\n"
    user_message += f"## Market Intelligence Agent Output\n```json\n{json.dumps(market_data, indent=2)}\n```\n\n"
    user_message += f"Current timestamp: {datetime.now().strftime('%Y-%m-%d %I:%M %p')}"

    # ── Call Groq ──
    client = Groq(api_key=GROQ_API_KEY)
    chat_completion = client.chat.completions.create(
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user",   "content": user_message},
        ],
        model=GROQ_MODEL,
        temperature=0.3,
        max_tokens=2000,
        response_format={"type": "json_object"},
    )

    response_text = chat_completion.choices[0].message.content

    try:
        result = json.loads(response_text)
    except json.JSONDecodeError:
        result = {
            "agents": [],
            "overall_status": "Under Review",
            "consensus_score": 0,
            "risk_level": "Moderate",
            "ai_recommendation": "HOLD",
            "recommendation_reason": "Orchestration produced non-standard output. Manual review recommended.",
            "action_summary": "Manual review recommended.",
            "biological_controls": [],
            "chemical_advisory": {
                "recommendation": "Pending Review",
                "notes": response_text[:500],
                "restrictions": [],
            },
            "conflicts": ["LLM output format error — manual review needed"],
        }

    # ── Attach raw agent data to response ──
    result["context"] = {
        "state_id":     state_id,
        "commodity_id": commodity_id,
        "market_id":    market_id,
        "lat":          lat,
        "lon":          lon,
    }
    result["market"]    = market_data
    result["climate"]   = climate_data
    result["satellite"] = satellite_data
    if vision_data:
        result["vision"] = vision_data

    return result
