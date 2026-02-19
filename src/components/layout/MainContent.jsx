

export default function MainContent({ title, subtitle, children }) {
    return (
        <div className="main-content">
            <header className="main-header">
                <div className="main-header-left">
                    <h2>{title}</h2>
                    <p>{subtitle}</p>
                </div>
                <div className="main-header-right">

                    <div className="header-badge">
                        <span className="dot"></span>
                        Live Monitoring
                    </div>
                </div>
            </header>
            <div className="main-scroll">
                {children}
            </div>
        </div>
    );
}
