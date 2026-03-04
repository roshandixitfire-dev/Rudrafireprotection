'use client'
import { useState, Fragment } from 'react'
import { AccessLevel } from '@/utils/supabase/demo-users'

export interface Column {
    key: string
    label: string
    width?: string
}

interface DataDisplayProps {
    title: string
    columns: Column[]
    data: Record<string, string | number>[]
    accentColor?: string
    accessLevel?: AccessLevel
    onAdd?: () => void
    onEdit?: (row: any) => void
    onDelete?: (id: string | number) => void
}

export default function DataDisplay({
    title,
    columns,
    data,
    accentColor = '#e11d48',
    accessLevel = 'view',
    onAdd,
    onEdit,
    onDelete
}: DataDisplayProps) {
    const [viewMode, setViewMode] = useState<'grid' | 'card'>('grid')
    const [search, setSearch] = useState('')
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

    const filtered = data.filter((row) =>
        columns.some((col) =>
            String(row[col.key]).toLowerCase().includes(search.toLowerCase())
        )
    )

    const canCreate = accessLevel === 'edit' || accessLevel === 'delete' || accessLevel === 'full'
    const canDelete = accessLevel === 'delete' || accessLevel === 'full'

    const toggleExpand = (id: string) => {
        const newSet = new Set(expandedIds)
        if (newSet.has(id)) {
            newSet.delete(id)
        } else {
            newSet.add(id)
        }
        setExpandedIds(newSet)
    }

    // Helper to get fields NOT in the main columns
    const getDetailFields = (row: any) => {
        const mainKeys = columns.map(c => c.key)
        // Also exclude system keys or redundant ones if needed
        return Object.keys(row).filter(key =>
            !mainKeys.includes(key) &&
            key !== 'id' &&
            key !== 'created_at' &&
            key !== 'status' // Status is merged
        )
    }

    return (
        <div className="data-display">
            {/* Header Bar */}
            <div className="display-header">
                <div className="display-title-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                    <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Dashboard / {title.replace(/All /gi, '').replace(/ Records/gi, '')}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="display-title-accent" style={{ background: accentColor, width: '8px', height: '32px', borderRadius: '4px' }} />
                        <h2 className="display-title" style={{ margin: 0 }}>{title}</h2>
                        <span className="display-count">{filtered.length} records</span>
                    </div>
                </div>
                <div className="display-controls">
                    {/* Add Button */}
                    {canCreate && onAdd && (
                        <button onClick={onAdd} className="btn-primary" style={{ padding: '6px 12px', fontSize: '13px' }}>
                            + Add New
                        </button>
                    )}

                    <div className="search-box">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search records..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <div className="view-toggle">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            title="Grid View"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="7" height="7" rx="1" />
                                <rect x="14" y="3" width="7" height="7" rx="1" />
                                <rect x="3" y="14" width="7" height="7" rx="1" />
                                <rect x="14" y="14" width="7" height="7" rx="1" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setViewMode('card')}
                            className={`toggle-btn ${viewMode === 'card' ? 'active' : ''}`}
                            title="Card View"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 5h18M3 12h18M3 19h18" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Grid (Table) View */}
            {viewMode === 'grid' && (
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ width: '40px' }}></th>
                                {columns.map((col) => (
                                    <th key={col.key} style={col.width ? { width: col.width } : {}}>{col.label}</th>
                                ))}
                                {canDelete && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={columns.length + 2} className="empty-state">No records found</td></tr>
                            ) : (
                                filtered.map((row, i) => {
                                    const rowId = String(row['id'] || i)
                                    const isExpanded = expandedIds.has(rowId)
                                    const detailFields = getDetailFields(row)

                                    return (
                                        <Fragment key={rowId}>
                                            <tr className={isExpanded ? 'expanded-row-parent' : ''} onClick={() => toggleExpand(rowId)} style={{ cursor: 'pointer' }}>
                                                <td style={{ textAlign: 'center', color: 'var(--text-secondary)', verticalAlign: 'top', paddingTop: '16px' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                                        <span onClick={() => toggleExpand(rowId)} style={{ cursor: 'pointer', padding: '4px' }}>
                                                            {isExpanded ? '▼' : '▶'}
                                                        </span>
                                                        {row['status'] && (
                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                                                <div
                                                                    style={{
                                                                        width: '8px',
                                                                        height: '8px',
                                                                        borderRadius: '50%',
                                                                        backgroundColor: String(row['status']) === 'Active' ? '#22c55e' : String(row['status']) === 'Inactive' ? '#ef4444' : '#eab308'
                                                                    }}
                                                                />
                                                                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                                                                    {String(row['status'])}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                {columns.map((col, colIndex) => (
                                                    <td key={col.key} style={{ verticalAlign: 'top', paddingTop: '16px', width: col.width || 'auto' }}>
                                                        {col.key === 'name' ? (
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                                <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>{row[col.key]}</span>
                                                                {/* District below name as requested */}
                                                                {row['area'] && (
                                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.2' }}>
                                                                        {row['area']}
                                                                    </span>
                                                                )}

                                                                {/* Category below name */}
                                                                {row['category'] && (
                                                                    <span style={{
                                                                        fontSize: '0.7rem',
                                                                        color: '#e11d48',
                                                                        background: 'rgba(225, 29, 72, 0.1)',
                                                                        padding: '2px 6px',
                                                                        borderRadius: '4px',
                                                                        alignSelf: 'flex-start',
                                                                        marginTop: '2px'
                                                                    }}>
                                                                        {row['category']}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ) : col.key === 'recent_work' || col.key === 'recentWork' ? (
                                                            row[col.key] && String(row[col.key]).includes(':') ? (
                                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 500 }}>
                                                                        {String(row[col.key]).split(':')[0]}
                                                                    </span>
                                                                    <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 600 }}>
                                                                        {String(row[col.key]).split(':').slice(1).join(':').trim()}
                                                                    </span>
                                                                </div>
                                                            ) : row[col.key]
                                                        ) : col.key === 'service_dates' ? (
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 500, width: '35px' }}>Last:</span>
                                                                    <span style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>{String(row['last_service'] || 'N/A')}</span>
                                                                </div>
                                                                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                                                    <span style={{ color: '#e11d48', fontSize: '0.7rem', fontWeight: 600, width: '35px' }}>Next:</span>
                                                                    <span style={{ color: '#e11d48', fontSize: '0.85rem', fontWeight: 600 }}>{String(row['next_service'] || 'N/A')}</span>
                                                                </div>
                                                            </div>
                                                        ) : col.key === 'refilling_dates' ? (
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                                                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 500, width: '35px' }}>Last:</span>
                                                                    <span style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>{String(row['last_refilling'] || 'N/A')}</span>
                                                                </div>
                                                                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                                                    <span style={{ color: '#e11d48', fontSize: '0.7rem', fontWeight: 600, width: '35px' }}>Next:</span>
                                                                    <span style={{ color: '#e11d48', fontSize: '0.85rem', fontWeight: 600 }}>{String(row['next_refilling'] || 'N/A')}</span>
                                                                </div>
                                                            </div>
                                                        ) : ['address', 'location'].includes(col.key) ? (
                                                            <span title={String(row[col.key])} style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                                                {String(row[col.key]).substring(0, 25)}{String(row[col.key]).length > 25 ? '...' : ''}
                                                            </span>
                                                        ) : ['priority', 'category'].includes(col.key) ? (
                                                            // Keep category here if it exists as a separate column, but simplified
                                                            // Or hide it if we want to de-dup. For now, keep as badge.
                                                            <span className={`status-badge status-${String(row[col.key]).toLowerCase().replace(/\s+/g, '-')}`}>
                                                                {row[col.key]}
                                                            </span>
                                                        ) : (
                                                            row[col.key]
                                                        )}
                                                    </td>
                                                ))}
                                                {canDelete && (
                                                    <td style={{ display: 'flex', gap: '8px' }}>
                                                        {onEdit && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    onEdit(row)
                                                                }}
                                                                className="edit-btn"
                                                                title="Edit"
                                                                style={{ color: '#e11d48', background: 'none', border: 'none', cursor: 'pointer' }}
                                                            >
                                                                ✏️
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                onDelete && onDelete(rowId)
                                                            }}
                                                            className="delete-btn"
                                                            title="Delete"
                                                            style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                                                        >
                                                            🗑️
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                            {isExpanded && (
                                                <tr className="detail-row">
                                                    <td colSpan={columns.length + 2}>
                                                        <div className="detail-grid">
                                                            {detailFields
                                                                .filter(key => row[key] !== null && row[key] !== undefined && row[key] !== '')
                                                                .map(key => (
                                                                    <div key={key} className="detail-item">
                                                                        <span className="detail-label">{key.replace(/_/g, ' ')}</span>
                                                                        <span className="detail-value">{row[key]}</span>
                                                                    </div>
                                                                ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Card View (Existing Logic) */}
            {viewMode === 'card' && (
                <div className="card-grid">
                    {filtered.length === 0 ? (
                        <div className="empty-state-card">No records found</div>
                    ) : (
                        filtered.map((row, i) => (
                            <div key={i} className="record-card" style={{ borderTopColor: accentColor }}>
                                <div className="card-header-row">
                                    <h3 className="card-primary">{row[columns[0].key]}</h3>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {['status', 'priority', 'category'].map(key => (
                                            row[key] && (
                                                <span key={key} className={`status-badge status-${String(row[key]).toLowerCase().replace(/\s+/g, '-')}`}>
                                                    {row[key]}
                                                </span>
                                            )
                                        ))}
                                    </div>
                                </div>
                                {/* Show all other fields in card view */}
                                {Object.keys(row).filter(k =>
                                    k !== 'id' &&
                                    k !== columns[0].key &&
                                    !['status', 'priority', 'category'].includes(k)
                                ).map((key) => (
                                    <div key={key} className="card-field">
                                        <span className="card-label">{key.replace(/_/g, ' ')}</span>
                                        <span className="card-value">{row[key]}</span>
                                    </div>
                                ))}
                            </div>
                        ))
                    )}
                </div>
            )}

            <style jsx>{`
                .detail-row td {
                    background: #f8fafc;
                    padding: 16px 24px !important;
                    border-bottom: 1px solid var(--border-color);
                }
                .detail-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 16px;
                }
                .detail-item {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .detail-label {
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    color: var(--text-secondary);
                    letter-spacing: 0.5px;
                }
                .detail-value {
                    font-size: 0.9rem;
                    color: var(--text-primary);
                }
                .expanded-row-parent td {
                    border-bottom: none !important;
                    background: #f8fafc;
                }
            `}</style>
        </div>
    )
}
