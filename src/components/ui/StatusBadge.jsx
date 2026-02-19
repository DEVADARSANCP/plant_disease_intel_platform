export default function StatusBadge({ status }) {
    const statusClass = status.toLowerCase().replace(/\s+/g, '-');
    return (
        <span className={`status-badge status-badge--${statusClass}`}>
            <span className="badge-dot"></span>
            {status}
        </span>
    );
}
