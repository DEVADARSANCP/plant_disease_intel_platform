export const visionAgentData = {
    diseaseName: "Late Blight (Phytophthora infestans)",
    confidenceScore: 92.4,
    severityStage: "Stage 3 — Moderate Spread",
    affectedArea: "Upper canopy, 35% coverage",
    lastAnalyzed: "2026-02-16 10:42 AM",
    imageStatus: "awaiting_upload",
};

export const climateAgentData = {
    temperature: 24.5,
    humidity: 87,
    windSpeed: 12.3,
    rainfall: 45.2,
    riskLevel: "High",
    outbreakProbability: 78,
    forecastSummary: "Warm and humid conditions persist over the next 72 hours, creating favorable environment for fungal propagation.",
    lastUpdated: "2026-02-16 10:30 AM",
};

export const satelliteAgentData = {
    ndviScore: 0.42,
    vegetationStress: "Moderate",
    healthTrend: "Declining",
    coverageArea: "Block A-7, North Quadrant",
    lastCapture: "2026-02-15 06:15 AM",
    resolution: "10m (Sentinel-2)",
};

export const orchestrationData = {
    agents: [
        { name: "Vision Detection Agent", status: "Verified", confidence: 92.4, lastRun: "10:42 AM" },
        { name: "Climate Risk Agent", status: "Verified", confidence: 88.1, lastRun: "10:30 AM" },
        { name: "Satellite Health Agent", status: "Pending", confidence: 74.6, lastRun: "06:15 AM" },
    ],
    overallStatus: "Partial Consensus",
    consensusScore: 85.0,
    conflicts: ["Satellite data is 4+ hours old — re-scan recommended"],
};

export const recommendationData = {
    riskLevel: "High",
    actionSummary:
        "Immediate preventive measures recommended. Deploy biological controls within 24 hours. Monitor spread trajectory and consider targeted chemical intervention only if biological controls fail after 48 hours.",
    biologicalControls: [
        { name: "Trichoderma harzianum", application: "Soil drench + foliar spray", priority: "High" },
        { name: "Bacillus subtilis", application: "Foliar application at dusk", priority: "Medium" },
        { name: "Copper hydroxide (organic)", application: "Preventive barrier spray", priority: "Medium" },
    ],
    chemicalAdvisory: {
        recommendation: "Minimal Use — Last Resort Only",
        notes:
            "If biological controls show < 30% efficacy after 48 hours, consider targeted application of Mancozeb at reduced dosage (50% label rate). Restrict to affected zones only. Avoid broad-spectrum application.",
        restrictions: ["Do not apply within 14 days of harvest", "Maintain 50m buffer from water sources"],
    },
};
