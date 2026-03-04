export default function HowToOperatePage() {
    const systems = [
        {
            name: 'Fire Alarm Panel',
            icon: '🔔',
            color: '#ef4444',
            steps: [
                'Locate the fire alarm control panel (usually in the security room on ground floor)',
                'Green LED = Normal operation. No action needed.',
                'Red LED + Beeping = Fire detected in the indicated zone.',
                'Press "ACKNOWLEDGE" to silence the buzzer and read the zone display.',
                'If it\'s a real fire, press "EVACUATE" to trigger building-wide alarm.',
                'If false alarm, press "RESET" after verifying the zone is safe.',
                'Never press "DISABLE" unless instructed by a fire safety officer.',
            ],
        },
        {
            name: 'Fire Extinguisher (ABC Type)',
            icon: '🧯',
            color: '#f59e0b',
            steps: [
                'Remember PASS: Pull, Aim, Squeeze, Sweep',
                'PULL the safety pin from the handle.',
                'AIM the nozzle at the BASE of the fire (not the flames).',
                'SQUEEZE the handle to release the extinguishing agent.',
                'SWEEP side to side across the base of the fire.',
                'Maintain a distance of 6-8 feet from the fire.',
                'If fire is not controlled in 30 seconds, evacuate immediately.',
            ],
        },
        {
            name: 'Fire Hose Reel',
            icon: '🚿',
            color: '#06b6d4',
            steps: [
                'Break the glass to access the hose reel cabinet.',
                'Open the valve by turning the wheel counter-clockwise.',
                'Pull the hose and unwind it completely towards the fire.',
                'Hold the nozzle firmly and direct the water jet at the base of fire.',
                'Operate in pairs if possible — one person holds the hose, other controls the valve.',
                'After use, close the valve and recoil the hose neatly.',
            ],
        },
        {
            name: 'Fire Hydrant System',
            icon: '🚒',
            color: '#10b981',
            steps: [
                'Locate the nearest fire hydrant outlet (marked with red valve).',
                'Connect the hose coupling to the hydrant outlet.',
                'Open the hydrant valve slowly (anti-clockwise).',
                'Ensure someone has started the fire pump from the pump room.',
                'Direct the water stream using the branch pipe nozzle.',
                'After use, close the valve, disconnect and drain the hose.',
                'Only trained personnel should operate the hydrant system.',
            ],
        },
        {
            name: 'Sprinkler System',
            icon: '💦',
            color: '#8b5cf6',
            steps: [
                'Sprinklers activate AUTOMATICALLY when temperature exceeds 68°C.',
                'Do NOT hang anything from sprinkler heads or pipes.',
                'Do NOT paint, cover, or obstruct sprinkler heads.',
                'If a sprinkler activates, evacuate the area immediately.',
                'The main valve is in the pump room — only fire personnel should operate it.',
                'Report any damaged or leaking sprinkler heads to the facility manager.',
            ],
        },
    ]

    return (
        <div className="portal-page">
            <div className="page-header">
                <h1 className="page-title">🔧 How to Operate Your Fire Fighting Systems</h1>
                <p className="page-desc">Step-by-step operating instructions for each fire protection system installed in your premises.</p>
            </div>

            <div className="operate-grid">
                {systems.map((sys) => (
                    <div key={sys.name} className="operate-card" style={{ '--card-accent': sys.color } as React.CSSProperties}>
                        <div className="operate-card-header">
                            <span className="operate-card-icon">{sys.icon}</span>
                            <h3>{sys.name}</h3>
                        </div>
                        <ol className="operate-steps">
                            {sys.steps.map((step, i) => (
                                <li key={i}>
                                    <span className="step-number" style={{ background: sys.color }}>{i + 1}</span>
                                    <span className="step-text">{step}</span>
                                </li>
                            ))}
                        </ol>
                    </div>
                ))}
            </div>
        </div>
    )
}
