export default function ProgressBar({ label, value, max = 100, colorClass = 'blue' }) {
    const percentage = Math.round((value / max) * 100);
    return (
        <div className="progress-bar-container">
            <div className="progress-bar-header">
                <span className="progress-bar-label">{label}</span>
                <span className="progress-bar-value">{percentage}%</span>
            </div>
            <div className="progress-bar-track">
                <div
                    className={`progress-bar-fill progress-bar-fill--${colorClass}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
