const API_BASE = 'http://localhost:8000';

/**
 * Vision Agent — Upload image for disease classification
 */
export async function analyzeImage(file) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/api/vision/analyze`, {
        method: 'POST',
        body: formData,
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Vision analysis failed' }));
        throw new Error(err.detail || 'Vision analysis failed');
    }

    return res.json();
}

/**
 * Climate Agent — Fetch weather risk for coordinates
 */
export async function getClimateRisk(lat, lon) {
    const res = await fetch(`${API_BASE}/api/climate/risk?lat=${lat}&lon=${lon}`);

    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Climate fetch failed' }));
        throw new Error(err.detail || 'Climate fetch failed');
    }

    return res.json();
}

/**
 * Satellite Agent — Fetch vegetation health for coordinates
 */
export async function getSatelliteHealth(lat, lon) {
    const res = await fetch(`${API_BASE}/api/satellite/health?lat=${lat}&lon=${lon}`);

    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Satellite fetch failed' }));
        throw new Error(err.detail || 'Satellite fetch failed');
    }

    return res.json();
}

/**
 * Orchestration — Send all agent data to Groq for synthesis
 */
export async function runOrchestration(agentData) {
    const res = await fetch(`${API_BASE}/api/orchestrate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentData),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Orchestration failed' }));
        throw new Error(err.detail || 'Orchestration failed');
    }

    return res.json();
}

/**
 * Health check
 */
export async function checkHealth() {
    const res = await fetch(`${API_BASE}/api/health`);
    return res.json();
}

/**
 * Farmer Profile — Save onboarding data
 */
export async function saveFarmerProfile(data) {
    const res = await fetch(`${API_BASE}/api/farmer/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Profile save failed' }));
        throw new Error(err.detail || 'Profile save failed');
    }

    return res.json();
}

/**
 * Farmer Profile — Get profile by ID
 */
export async function getFarmerProfile(farmerId) {
    const res = await fetch(`${API_BASE}/api/farmer/profile/${farmerId}`);

    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Profile fetch failed' }));
        throw new Error(err.detail || 'Profile fetch failed');
    }

    return res.json();
}

/**
 * Farmer Dashboard — Get dashboard data using farmer's saved prefs
 */
export async function getFarmerDashboard(farmerId) {
    const res = await fetch(`${API_BASE}/api/farmer/dashboard/${farmerId}`);

    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Dashboard data failed' }));
        throw new Error(err.detail || 'Dashboard data failed');
    }

    return res.json();
}
