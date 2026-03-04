export default function DemoVideoPage() {
    const videos = [
        {
            title: 'Fire Alarm Panel — Operation & Reset',
            description: 'Learn how to read alarm zones, acknowledge alarms, and reset the panel after a false alarm.',
            duration: '4:32',
            category: 'Fire Alarm',
            icon: '🔔',
        },
        {
            title: 'Fire Extinguisher — PASS Technique',
            description: 'Demonstration of Pull-Aim-Squeeze-Sweep method using ABC type fire extinguishers.',
            duration: '3:15',
            category: 'Extinguisher',
            icon: '🧯',
        },
        {
            title: 'Fire Hose Reel — Proper Usage',
            description: 'Step-by-step demonstration on how to deploy and operate the fire hose reel during emergencies.',
            duration: '5:10',
            category: 'Hose Reel',
            icon: '🚿',
        },
        {
            title: 'Fire Hydrant System — Overview',
            description: 'Understanding the wet riser system, hydrant outlets, and pump operations.',
            duration: '6:45',
            category: 'Hydrant',
            icon: '🚒',
        },
        {
            title: 'Evacuation Drill — Building Walkthrough',
            description: 'A recorded evacuation drill showing emergency exit routes and assembly point procedures.',
            duration: '8:20',
            category: 'Safety Drill',
            icon: '🚨',
        },
        {
            title: 'Sprinkler System — Do\'s and Don\'ts',
            description: 'Important guidelines on maintaining sprinkler clearance and what to do when a sprinkler activates.',
            duration: '3:50',
            category: 'Sprinkler',
            icon: '💦',
        },
    ]

    return (
        <div className="portal-page">
            <div className="page-header">
                <h1 className="page-title">🎬 Demonstration Videos</h1>
                <p className="page-desc">Watch training videos on how to operate and maintain your fire fighting equipment.</p>
            </div>

            <div className="video-grid">
                {videos.map((video) => (
                    <div key={video.title} className="video-card">
                        <div className="video-thumbnail">
                            <span className="video-play-icon">▶</span>
                            <span className="video-duration">{video.duration}</span>
                        </div>
                        <div className="video-info">
                            <div className="video-category">
                                <span>{video.icon}</span>
                                <span>{video.category}</span>
                            </div>
                            <h3 className="video-title">{video.title}</h3>
                            <p className="video-desc">{video.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
