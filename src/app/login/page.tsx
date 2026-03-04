'use client'
import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'

export default function LoginPage() {
    const supabase = createClient()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    const handleLogin = async () => {
        setLoading(true)
        setMessage('')

        // Try demo login first
        const demoRes = await fetch('/api/demo-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        })

        if (demoRes.ok) {
            const data = await demoRes.json()
            setMessage('Logged in! Redirecting...')
            window.location.href = data.redirect
            return
        }

        // Fall back to Supabase login
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
            setMessage(error.message)
            setLoading(false)
            return
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single()

        const role = profile?.role || 'client'
        setMessage('Logged in! Redirecting...')
        // If role is client, go to portal. Everyone else (admin, employee) goes to dashboard.
        window.location.href = role === 'client' ? '/portal' : '/dashboard'
        setLoading(false)
    }

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-brand">
                    <img src="/logo.png" alt="Rudra Fire Protection" className="login-logo" />
                    <h1 className="login-title">Rudra Fire Protection</h1>
                    <p className="login-subtitle">Next-Gen Fire Safety Management</p>
                </div>

                <div className="login-form">
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            className="form-input"
                            placeholder="you@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleLogin()}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            className="form-input"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleLogin()}
                        />
                    </div>

                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="btn-primary"
                        style={{ width: '100%', marginTop: '8px' }}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>

                    {message && (
                        <div className={`login-message ${message.toLowerCase().includes('error') || message.toLowerCase().includes('invalid') ? 'error' : 'success'}`}>
                            {message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
