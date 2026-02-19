import { useAppState } from '../../context/AppContext';

const STATES = [
    { value: 'Maharashtra', label: 'Maharashtra' },
    { value: 'Karnataka', label: 'Karnataka' },
    { value: 'Tamil Nadu', label: 'Tamil Nadu' },
    { value: 'Andhra Pradesh', label: 'Andhra Pradesh' },
    { value: 'Telangana', label: 'Telangana' },
    { value: 'Delhi', label: 'Delhi' },
    { value: 'West Bengal', label: 'West Bengal' },
    { value: 'Punjab', label: 'Punjab' },
    { value: 'Uttar Pradesh', label: 'Uttar Pradesh' },
    { value: 'Gujarat', label: 'Gujarat' },
    { value: 'Rajasthan', label: 'Rajasthan' },
    { value: 'Madhya Pradesh', label: 'Madhya Pradesh' },
];

const COMMODITIES = [
    { value: 'Tomato', label: 'Tomato' },
    { value: 'Onion', label: 'Onion' },
    { value: 'Potato', label: 'Potato' },
    { value: 'Brinjal', label: 'Brinjal' },
    { value: 'Cabbage', label: 'Cabbage' },
    { value: 'Cauliflower', label: 'Cauliflower' },
    { value: 'Chilli', label: 'Chilli' },
    { value: 'Garlic', label: 'Garlic' },
    { value: 'Wheat', label: 'Wheat' },
    { value: 'Rice', label: 'Rice' },
];

const MARKETS = [
    { value: '', label: 'All Markets' },
    { value: 'Nashik', label: 'Nashik' },
    { value: 'Pune', label: 'Pune' },
    { value: 'Mumbai', label: 'Mumbai' },
    { value: 'Nagpur', label: 'Nagpur' },
    { value: 'Bangalore', label: 'Bangalore' },
    { value: 'Chennai', label: 'Chennai' },
    { value: 'Delhi', label: 'Delhi' },
    { value: 'Kolkata', label: 'Kolkata' },
    { value: 'Hyderabad', label: 'Hyderabad' },
];

export default function GlobalFilterBar() {
    const { state, dispatch } = useAppState();

    const handleChange = (field, value) => {
        dispatch({ type: 'SET_FILTER', payload: { [field]: value } });
    };

    return (
        <div className="global-filter-bar">
            <span className="filter-bar-label">Context:</span>

            <div className="filter-group">
                <label className="filter-label">State</label>
                <select
                    className="filter-select"
                    value={state.stateId}
                    onChange={(e) => handleChange('stateId', e.target.value)}
                >
                    {STATES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                </select>
            </div>

            <div className="filter-group">
                <label className="filter-label">Commodity</label>
                <select
                    className="filter-select"
                    value={state.commodityId}
                    onChange={(e) => handleChange('commodityId', e.target.value)}
                >
                    {COMMODITIES.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                </select>
            </div>

            <div className="filter-group">
                <label className="filter-label">Market</label>
                <select
                    className="filter-select"
                    value={state.marketId}
                    onChange={(e) => handleChange('marketId', e.target.value)}
                >
                    {MARKETS.map((m) => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}
