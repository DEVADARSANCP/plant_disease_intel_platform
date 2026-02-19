export default function AgentCard({ title, subtitle, icon, accentColor, statusBadge, children }) {
    return (
        <div className="agent-card" style={{ '--card-accent': accentColor }}>
            <div className="agent-card-header">
                <div className="agent-card-title-group">
                    <div
                        className="agent-card-icon"
                        style={{ background: accentColor ? `${accentColor}20` : 'var(--accent-blue-glow)' }}
                    >
                        {icon}
                    </div>
                    <div>
                        <div className="agent-card-title">{title}</div>
                        {subtitle && <div className="agent-card-subtitle">{subtitle}</div>}
                    </div>
                </div>
                {statusBadge}
            </div>
            <div className="agent-card-body">
                {children}
            </div>
        </div>
    );
}
