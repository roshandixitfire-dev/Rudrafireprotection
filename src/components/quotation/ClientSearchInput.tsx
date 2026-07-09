import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export interface ClientRec {
    id: string | number;
    name: string;
    address?: string;
    area?: string;
    district?: string;
    state?: string;
    pincode?: string;
    contact_person?: string;
    contact_name?: string;
    phone?: string;
    email?: string;
}

interface ClientSearchInputProps {
    value: string;
    onChange: (name: string) => void;
    onSelect: (c: ClientRec) => void;
    placeholder?: string;
}

export const ClientSearchInput: React.FC<ClientSearchInputProps> = ({
    value,
    onChange,
    onSelect,
    placeholder = 'Type to search clients...'
}) => {
    const [results, setResults] = useState<ClientRec[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (value.length < 2) {
            setResults([]);
            setOpen(false);
            return;
        }
        setLoading(true);
        const t = setTimeout(async () => {
            try {
                const { data } = await supabase
                    .from('clients')
                    .select('id, name, address, area, district, state, pincode, contact_person, contact_name, phone, email')
                    .ilike('name', `%${value}%`)
                    .limit(8);
                setResults(data || []);
                setOpen(true);
            } catch (e) {
                console.error('Error fetching clients in search:', e);
            } finally {
                setLoading(false);
            }
        }, 200);
        return () => clearTimeout(t);
    }, [value]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const inputS: React.CSSProperties = {
        border: '1px solid #ccc',
        borderRadius: 4,
        padding: '6px 10px',
        fontSize: 12,
        width: '100%',
        boxSizing: 'border-box'
    };

    return (
        <div ref={ref} style={{ position: 'relative' }} className="w-full">
            <div style={{ position: 'relative' }}>
                <input
                    value={value}
                    onChange={e => {
                        onChange(e.target.value);
                        setOpen(true);
                    }}
                    placeholder={placeholder}
                    style={inputS}
                    autoComplete="off"
                />
                {loading && (
                    <span style={{
                        position: 'absolute',
                        right: 10,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: 12,
                        color: '#94a3b8'
                    }} className="animate-pulse">
                        ⟳
                    </span>
                )}
            </div>
            {open && results.length > 0 && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: '#fff',
                    border: '1px solid #ccc',
                    borderRadius: 4,
                    zIndex: 999,
                    maxHeight: 220,
                    overflowY: 'auto',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
                }}>
                    {results.map(c => (
                        <div
                            key={c.id}
                            onClick={() => {
                                onSelect(c);
                                setOpen(false);
                            }}
                            style={{
                                padding: '7px 10px',
                                cursor: 'pointer',
                                fontSize: 12,
                                borderBottom: '1px solid #f0f0f0'
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = '#f0f4ff')}
                            onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                        >
                            <div style={{ fontWeight: 700, color: '#1e293b' }}>{c.name}</div>
                            {(c.area || c.district) && (
                                <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
                                    {[c.area, c.district, c.state].filter(Boolean).join(', ')}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
