import type { Metadata } from 'next';
import RudraLandingPage from '@/components/landing/RudraLandingPage';
import { getUserWithRole } from '@/utils/supabase/auth';

export const metadata: Metadata = {
    title: 'Rudra Fire Protection | Turnkey Fire Alarm, Hydrant, Suppression & AMC Solutions',
    description:
        'Mumbai’s trusted turnkey fire safety engineering partner: Addressable Fire Alarm Systems, Hydrant & Sprinkler Networks, Clean Agent Suppression, Fire Pumps, Annual Maintenance Contracts (AMC) & MFB Form-B Certification.',
};

export default async function LandingPreviewPage() {
    const userWithRole = await getUserWithRole();
    const portalHref = userWithRole
        ? userWithRole.role === 'client'
            ? '/portal'
            : '/dashboard'
        : '/login';
    const portalLabel = userWithRole
        ? userWithRole.role === 'client'
            ? 'Client Portal'
            : 'Open Dashboard'
        : 'Client / Staff Login';

    return <RudraLandingPage portalHref={portalHref} portalLabel={portalLabel} />;
}

