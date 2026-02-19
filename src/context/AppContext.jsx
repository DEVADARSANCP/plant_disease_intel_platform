import { createContext, useContext, useReducer } from 'react';

const AppContext = createContext();

const initialState = {
    // Onboarding
    onboardingComplete: !!localStorage.getItem('jomee_onboarding'),
    onboardingData: JSON.parse(localStorage.getItem('jomee_onboarding') || 'null'),
    farmerId: localStorage.getItem('jomee_farmer_id') || null,
    cropPlanSeen: !!localStorage.getItem('jomee_crop_plan_seen'),

    // Location
    location: { lat: 20.0, lon: 73.8 }, // Default: Nashik
    locationName: 'Nashik, Maharashtra',

    // Global market filter context (CSV-based)
    regionId: JSON.parse(localStorage.getItem('jomee_onboarding') || '{}').primary_region || 'Kerala_Kottayam',
    commodityId: JSON.parse(localStorage.getItem('jomee_onboarding') || '{}').primary_commodity || 'Banana',

    // Agent results
    visionResult: null,
    climateResult: null,
    satelliteResult: null,
    orchestrationResult: null,

    // Loading states
    visionLoading: false,
    climateLoading: false,
    satelliteLoading: false,
    orchestrationLoading: false,

    // Errors
    visionError: null,
    climateError: null,
    satelliteError: null,
    orchestrationError: null,
};

function appReducer(state, action) {
    switch (action.type) {
        case 'COMPLETE_ONBOARDING': {
            localStorage.setItem('jomee_onboarding', JSON.stringify(action.payload));
            if (action.payload.farmerId) {
                localStorage.setItem('jomee_farmer_id', action.payload.farmerId);
            }
            return {
                ...state,
                onboardingComplete: true,
                onboardingData: action.payload,
                farmerId: action.payload.farmerId || state.farmerId,
                regionId: action.payload.primary_region || state.regionId,
                commodityId: action.payload.primary_commodity || state.commodityId,
            };
        }

        case 'DISMISS_CROP_PLAN': {
            localStorage.setItem('jomee_crop_plan_seen', '1');
            return { ...state, cropPlanSeen: true };
        }

        case 'SET_LOCATION':
            return {
                ...state,
                location: action.payload.coords,
                locationName: action.payload.name || '',
                // Clear location-dependent agent data so panels re-fetch
                climateResult: null,
                climateError: null,
                satelliteResult: null,
                satelliteError: null,
                orchestrationResult: null,
                orchestrationError: null,
            };

        case 'SET_FILTER':
            return {
                ...state,
                regionId: action.payload.regionId ?? state.regionId,
                commodityId: action.payload.commodityId ?? state.commodityId,
                // Clear orchestration so Home Dashboard re-fetches
                orchestrationResult: null,
                orchestrationError: null,
            };

        case 'VISION_LOADING': return { ...state, visionLoading: true, visionError: null };
        case 'VISION_SUCCESS': return { ...state, visionLoading: false, visionResult: action.payload };
        case 'VISION_ERROR': return { ...state, visionLoading: false, visionError: action.payload };

        case 'CLIMATE_LOADING': return { ...state, climateLoading: true, climateError: null };
        case 'CLIMATE_SUCCESS': return { ...state, climateLoading: false, climateResult: action.payload };
        case 'CLIMATE_ERROR': return { ...state, climateLoading: false, climateError: action.payload };

        case 'SATELLITE_LOADING': return { ...state, satelliteLoading: true, satelliteError: null };
        case 'SATELLITE_SUCCESS': return { ...state, satelliteLoading: false, satelliteResult: action.payload };
        case 'SATELLITE_ERROR': return { ...state, satelliteLoading: false, satelliteError: action.payload };

        case 'ORCHESTRATION_LOADING': return { ...state, orchestrationLoading: true, orchestrationError: null };
        case 'ORCHESTRATION_SUCCESS': return { ...state, orchestrationLoading: false, orchestrationResult: action.payload };
        case 'ORCHESTRATION_ERROR': return { ...state, orchestrationLoading: false, orchestrationError: action.payload };

        default: return state;
    }
}

export function AppProvider({ children }) {
    const [state, dispatch] = useReducer(appReducer, initialState);
    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {children}
        </AppContext.Provider>
    );
}

export function useAppState() {
    const context = useContext(AppContext);
    if (!context) throw new Error('useAppState must be used within AppProvider');
    return context;
}
