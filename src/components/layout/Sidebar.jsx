const topNavItems = [
    { id: 'home', label: 'Home Dashboard', icon: '⊕' },
];

const featureNavItems = [
    { id: 'market', label: 'Market Intelligence', icon: '↗' },
    { id: 'community', label: 'Community', icon: '👥' },
    { id: 'dev-planner', label: 'Dev Planner', icon: '📖' },
    { id: 'ai-assistant', label: 'AI Assistant', icon: '🤖' },
    { id: 'dashboard', label: 'Outbreak Analysis', icon: '🧬' },
    { id: 'crop-planning', label: 'Crop Planning', icon: '🌱' },
    { id: 'roi-calculator', label: 'ROI Calculator', icon: '🧮' },
    { id: 'econ-dashboard', label: 'Econ Dashboard', icon: '⊕' },
];

export default function Sidebar({ activeNav, onNavChange }) {
    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="sidebar-brand-icon">🧬</div>
                <h1>AgriIntel</h1>
                <p>Multi-Agent Platform</p>
            </div>

            <nav className="sidebar-nav">
                {topNavItems.map((item) => (
                    <div
                        key={item.id}
                        className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
                        onClick={() => onNavChange(item.id)}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span>{item.label}</span>
                    </div>
                ))}

                <div className="sidebar-section-label">Features</div>

                {featureNavItems.map((item) => (
                    <div
                        key={item.id}
                        className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
                        onClick={() => onNavChange(item.id)}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span>{item.label}</span>
                    </div>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-status">
                    <span className="status-dot"></span>
                    <span>All Systems Operational</span>
                </div>
            </div>
        </aside>
    );
}
