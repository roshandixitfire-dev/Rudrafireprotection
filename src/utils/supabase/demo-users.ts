import bcrypt from 'bcryptjs'

export type UserRole = 'admin' | 'employee' | 'client'
export type ModuleKey = 'dashboard' | 'clients' | 'services' | 'payments' | 'invoices' | 'users' | 'team'
export type AccessLevel = 'view' | 'edit' | 'delete' | 'full'

export interface UserPermission {
    module: ModuleKey
    access: AccessLevel
}

export interface DemoUser {
    id: string
    email: string
    role: UserRole
    fullName: string
    company: string | null
    permissions: UserPermission[]
}

// Helper to get default full permissions for admin
const ADMIN_PERMISSIONS: UserPermission[] = [
    { module: 'dashboard', access: 'full' },
    { module: 'clients', access: 'full' },
    { module: 'services', access: 'full' },
    { module: 'payments', access: 'full' },
    { module: 'invoices', access: 'full' },
    { module: 'users', access: 'full' },
    { module: 'team', access: 'full' },
]

// Helper for default employee permissions (view only example)
const DEFAULT_EMPLOYEE_PERMISSIONS: UserPermission[] = [
    { module: 'dashboard', access: 'view' },
    { module: 'clients', access: 'view' },      // View only: No Add/Delete
    { module: 'services', access: 'edit' },     // Edit: Add enabled, No Delete
    { module: 'payments', access: 'full' },     // Full: Add & Delete enabled
    // Invoices: No access (hidden)
    { module: 'team', access: 'full' },         // Full access to team productivity
]

export const DEMO_USERS: Record<string, DemoUser> = {
    'roshandixitfire@gmail.com': {
        id: 'demo-admin-001',
        email: 'roshandixitfire@gmail.com',
        role: 'admin',
        fullName: 'Roshan Dixit',
        company: 'Rudra Fire Protection Pvt. Ltd.',
        permissions: ADMIN_PERMISSIONS,
    },
    'employee@rudraweb.com': {
        id: 'demo-employee-001',
        email: 'employee@rudraweb.com',
        role: 'employee',
        fullName: 'Staff Member',
        company: 'Rudra Fire Protection Pvt. Ltd.',
        permissions: DEFAULT_EMPLOYEE_PERMISSIONS,
    },
    'client@rudraweb.com': {
        id: 'demo-client-001',
        email: 'client@rudraweb.com',
        role: 'client',
        fullName: 'Sunrise Heights Society',
        company: 'Sunrise Heights Co-op Housing Society',
        permissions: [], // Clients use portal, this is ignored/empty
    },
}

// Passwords stored strictly as secure bcrypt hashes (never plaintext)
export const DEMO_PASSWORD_HASHES: Record<string, string> = {
    'roshandixitfire@gmail.com': bcrypt.hashSync('roshandixitfire', 10),
    'employee@rudraweb.com': bcrypt.hashSync('Employee@123', 10),
    'client@rudraweb.com': bcrypt.hashSync('Client@123', 10),
}

export const DEMO_COOKIE_NAME = 'rudra_demo_user'

export function isDemoEmail(email: string): boolean {
    return email in DEMO_USERS
}

export function validateDemoLogin(email: string, password: string): DemoUser | null {
    const hash = DEMO_PASSWORD_HASHES[email]
    if (!hash) {
        return null
    }

    try {
        const isValid = hash.startsWith('$2')
            ? bcrypt.compareSync(password, hash)
            : hash === password

        if (isValid) {
            return DEMO_USERS[email] || null
        }
    } catch {
        return null
    }

    return null
}

// Function to simulate adding/updating a user (hashes password with bcrypt)
export function saveDemoUser(user: DemoUser, password?: string) {
    DEMO_USERS[user.email] = user
    if (password && password.trim()) {
        DEMO_PASSWORD_HASHES[user.email] = bcrypt.hashSync(password.trim(), 10)
    }
}

