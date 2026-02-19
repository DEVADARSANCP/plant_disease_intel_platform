"""
Orchestration Agent
Uses Groq (Llama 3.3 70B) to synthesize outputs from all three agents
into a unified risk assessment and actionable recommendations.
"""

import json
from datetime import datetime
from groq import Groq
from config import GROQ_API_KEY, GROQ_MODEL


SYSTEM_PROMPT = """You are an expert agricultural disease intelligence orchestrator. 
You analyze outputs from three specialized AI agents:
1. Vision Detection Agent — classifies plant diseases from leaf images
2. Climate Risk Agent — assesses weather-based outbreak risk
3. Satellite Health Agent — monitors vegetation health via remote sensing

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
    }
  ],
  "overall_status": "Confirmed Threat|Probable Threat|Under Review|Low Risk",
  "consensus_score": <0-100>,
  "risk_level": "High|Moderate|Low",
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
- Chemical advisory should follow minimal usage principle
- Be specific about biological control organisms and application methods
- If vision data is missing, note it but still analyze climate + satellite data
"""


async def run_orchestration(agent_data: dict) -> dict:
    """
    Send all agent outputs to Groq LLM for multi-agent reasoning
    and return structured recommendations.
    """
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY is not set. Please add it to your .env file.")

    # Build the user message with all agent data
    user_message = "Analyze the following agent outputs and provide your orchestrated assessment:\n\n"

    if agent_data.get("vision"):
        user_message += f"## Vision Detection Agent Output\n```json\n{json.dumps(agent_data['vision'], indent=2)}\n```\n\n"
    else:
        user_message += "## Vision Detection Agent Output\nNo image has been analyzed yet. Skip vision assessment.\n\n"

    if agent_data.get("climate"):
        user_message += f"## Climate Risk Agent Output\n```json\n{json.dumps(agent_data['climate'], indent=2)}\n```\n\n"
    else:
        user_message += "## Climate Risk Agent Output\nNo climate data available.\n\n"

    if agent_data.get("satellite"):
        user_message += f"## Satellite Health Agent Output\n```json\n{json.dumps(agent_data['satellite'], indent=2)}\n```\n\n"
    else:
        user_message += "## Satellite Health Agent Output\nNo satellite data available.\n\n"

    user_message += f"Current timestamp: {datetime.now().strftime('%Y-%m-%d %I:%M %p')}"

    # Call Groq
    client = Groq(api_key=GROQ_API_KEY)

    chat_completion = client.chat.completions.create(
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message},
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
        # Fallback if Groq doesn't return valid JSON
        result = {
            "agents": [],
            "overall_status": "Under Review",
            "consensus_score": 0,
            "risk_level": "Moderate",
            "action_summary": "Orchestration produced non-standard output. Manual review recommended.",
            "biological_controls": [],
            "chemical_advisory": {
                "recommendation": "Pending Review",
                "notes": response_text[:500],
                "restrictions": [],
            },
            "conflicts": ["LLM output format error — manual review needed"],
        }

    result["raw_llm_reasoning"] = response_text
    return result