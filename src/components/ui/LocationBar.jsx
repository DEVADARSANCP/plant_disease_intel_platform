import { useState, useRef, useCallback, useEffect } from 'react';
import { useAppState } from '../../context/AppContext';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
let debounceTimer = null;

export default function LocationBar() {
    const { state, dispatch } = useAppState();
    const [query, setQuery] = useState(state.locationName || '');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [gpsLoading, setGpsLoading] = useState(false);
    const [gpsError, setGpsError] = useState('');
    const wrapperRef = useRef(null);

    // Close suggestions on outside click
    useEffect(() => {
        function handleClickOutside(e) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced search via Nominatim
    const searchLocation = useCallback((text) => {
        if (debounceTimer) clearTimeout(debounceTimer);
        if (text.length < 3) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        debounceTimer = setTimeout(async () => {
            try {
                const params = new URLSearchParams({
                    q: text,
                    format: 'json',
                    addressdetails: '1',
                    limit: '6',
                });
                const res = await fetch(`${NOMINATIM_URL}?${params}`, {
                    headers: { 'Accept-Language': 'en' },
                });
                const data = await res.json();
                setSuggestions(data);
                setShowSuggestions(data.length > 0);
            } catch {
                setSuggestions([]);
            }
        }, 350);
    }, []);

    const handleInputChange = (e) => {
        const val = e.target.value;
        setQuery(val);
        searchLocation(val);
    };

    const handleSelectSuggestion = (suggestion) => {
        const lat = parseFloat(suggestion.lat);
        const lon = parseFloat(suggestion.lon);
        const name = suggestion.display_name.split(',').slice(0, 3).join(', ');

        setQuery(name);
        setSuggestions([]);
        setShowSuggestions(false);

        dispatch({
            type: 'SET_LOCATION',
            payload: { coords: { lat, lon }, name },
        });
    };

    const handleUseGPS = () => {
        if (!navigator.geolocation) {
            setGpsError('Geolocation not supported by your browser');
            return;
        }

        setGpsLoading(true);
        setGpsError('');

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = parseFloat(position.coords.latitude.toFixed(4));
                const lon = parseFloat(position.coords.longitude.toFixed(4));

                // Reverse geocode to get the place name
                let name = `${lat}, ${lon}`;
                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
                        { headers: { 'Accept-Language': 'en' } }
                    );
                    const data = await res.json();
                    if (data.display_name) {
                        name = data.display_name.split(',').slice(0, 3).join(', ');
                    }
                } catch {
                    // keep lat/lon as name
                }

                setQuery(name);
                setGpsLoading(false);
                dispatch({
                    type: 'SET_LOCATION',
                    payload: { coords: { lat, lon }, name },
                });
            },
            (error) => {
                setGpsLoading(false);
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        setGpsError('Location permission denied');
                        break;
                    case error.POSITION_UNAVAILABLE:
                        setGpsError('Location unavailable');
                        break;
                    case error.TIMEOUT:
                        setGpsError('Location request timed out');
                        break;
                    default:
                        setGpsError('Could not get location');
                }
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    // Format suggestion display
    const formatSuggestion = (s) => {
        const parts = s.display_name.split(',');
        const primary = parts.slice(0, 2).join(',').trim();
        const secondary = parts.slice(2, 4).join(',').trim();
        return { primary, secondary };
    };

    const getTypeIcon = (type) => {
        if (type === 'city' || type === 'town' || type === 'village') return '🏙️';
        if (type === 'administrative') return '🗺️';
        if (type === 'hamlet' || type === 'suburb') return '🏘️';
        if (type === 'country') return '🌍';
        return '📍';
    };

    return (
        <div className="location-bar" ref={wrapperRef}>
            <span className="location-bar-icon">📍</span>

            <div className="location-search-wrapper">
                <input
                    type="text"
                    className="location-input"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    placeholder="Search for a city, region, or address…"
                    autoComplete="off"
                />

                {showSuggestions && (
                    <div className="location-suggestions">
                        {suggestions.map((s, i) => {
                            const formatted = formatSuggestion(s);
                            return (
                                <div
                                    key={i}
                                    className="location-suggestion-item"
                                    onClick={() => handleSelectSuggestion(s)}
                                >
                                    <span className="suggestion-icon">{getTypeIcon(s.type)}</span>
                                    <div className="suggestion-text">
                                        <span className="suggestion-primary">{formatted.primary}</span>
                                        <span className="suggestion-secondary">{formatted.secondary}</span>
                                    </div>
                                    <span className="suggestion-coords">
                                        {parseFloat(s.lat).toFixed(2)}°, {parseFloat(s.lon).toFixed(2)}°
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="location-current-coords">
                {state.location.lat.toFixed(4)}°N, {state.location.lon.toFixed(4)}°E
            </div>

            <button
                type="button"
                className="btn btn-outline btn-sm location-gps-btn"
                onClick={handleUseGPS}
                disabled={gpsLoading}
                title="Use your device location"
            >
                {gpsLoading ? (
                    <span className="spinner spinner-sm"></span>
                ) : (
                    '🎯'
                )}
                <span className="gps-label">My Location</span>
            </button>

            {gpsError && (
                <span className="location-gps-error">{gpsError}</span>
            )}
        </div>
    );
}
