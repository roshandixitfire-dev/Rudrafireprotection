'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    Flame,
    ShieldCheck,
    Gauge,
    FileCheck2,
    Phone,
    Mail,
    MapPin,
    ArrowRight,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Building2,
    Factory,
    Hospital,
    Landmark,
    Menu,
    X,
    Clock,
    Award,
    Wrench,
    Send,
    Headphones,
    Loader2,
    AlertCircle,
    FileText,
    Download,
    ChevronRight as BreadcrumbArrow,
} from 'lucide-react';

interface RudraLandingPageProps {
    portalHref?: string;
    portalLabel?: string;
}

type CategoryKey = 'all' | 'alarm' | 'hydrant' | 'suppression' | 'equipment' | 'pfp';

interface SystemProduct {
    id: string;
    category: Exclude<CategoryKey, 'all'>;
    categoryLabel: string;
    title: string;
    subtitle: string;
    image: string;
    badge: string;
    specs: string[];
}

const HERO_SLIDES = [
    {
        eyebrow: 'TURNKEY FIRE PROTECTION & LIFE SAFETY PARTNER',
        title: 'Intelligent Fire Alarm & Turnkey Fire Suppression Systems',
        subtitle:
            'End-to-end engineering, supply, installation, commissioning & Maharashtra Fire Brigade Form-B certification for commercial towers, housing societies & industrial facilities.',
        primaryCta: 'Explore Systems',
        primaryHref: '#systems',
        secondaryCta: 'Request Free BOQ / Quote',
        secondaryHref: '#quote-request',
        image: '/images/hero-fire-safety.jpg',
        highlights: ['Addressable & Conventional FACP', 'Hydrant & Sprinkler Networks', 'MFB Form-B Certified'],
    },
    {
        eyebrow: 'BI-ANNUAL STATUTORY COMPLIANCE & AMC',
        title: 'Preventive Annual Maintenance & 24/7 Breakdown Response',
        subtitle:
            'Structured quarterly inspection schedules, pump room health checks, extinguisher hydro-testing, and hassle-free January & July Form-B compliance.',
        primaryCta: 'View AMC Plans',
        primaryHref: '#amc-compliance',
        secondaryCta: 'Schedule Site Survey',
        secondaryHref: '#quote-request',
        image: '/images/system-hydrant-pump.jpg',
        highlights: ['Quarterly On-Site Visits', '2, 3 & 5-Year AMC Packages', 'Client Compliance Portal'],
    },
    {
        eyebrow: 'CLEAN AGENT & MISSION-CRITICAL PROTECTION',
        title: 'Zero-Residue FM-200 & CO₂ Suppression for Server & Electrical Rooms',
        subtitle:
            'Rapid gas discharge systems, aspirated detection, and UL/ISI-listed piping networks engineered to protect high-value IT infrastructure without water damage.',
        primaryCta: 'Gas Suppression Specs',
        primaryHref: '#systems',
        secondaryCta: 'Consult Our Engineers',
        secondaryHref: '#quote-request',
        image: '/images/system-suppression.jpg',
        highlights: ['FM-200 / Clean Agent', 'Panel Flooding Systems', 'NBC Part IV Compliant'],
    },
];

const SYSTEM_PRODUCTS: SystemProduct[] = [
    {
        id: 'addressable-alarm',
        category: 'alarm',
        categoryLabel: 'Fire Detection & Alarm',
        title: 'Addressable & Conventional Fire Alarm Systems',
        subtitle: 'Microprocessor FACPs, loop-powered smoke & heat detectors, manual call points & electronic hooters.',
        image: '/images/system-fire-alarm.jpg',
        badge: 'NBC / EN54 / UL Standards',
        specs: [
            '1 to 8 Loop Addressable Control Panels',
            'Optical Smoke, Rate-of-Rise Heat & Multi-Sensors',
            'FRLS Armored Cabling & Fault Isolation Modules',
        ],
    },
    {
        id: 'hydrant-sprinkler',
        category: 'hydrant',
        categoryLabel: 'Hydrant & Sprinklers',
        title: 'Fire Hydrant, Riser & Sprinkler Networks',
        subtitle: 'Heavy-duty MS/GI pressurized risers, stainless steel landing valves, hose boxes & UL sprinkler heads.',
        image: '/images/system-hydrant-riser.jpg',
        badge: 'IS 3844 / TAC Approved',
        specs: [
            'Jindal / Zenith C-Class MS & GI Piping Networks',
            'Single & Double SS Hydrant Landing Valves + Hose Reels',
            'UL-Listed Upright, Pendent & Sidewall Sprinklers',
        ],
    },
    {
        id: 'fire-pump-sets',
        category: 'hydrant',
        categoryLabel: 'Fire Pumping Systems',
        title: 'Packaged Main, Diesel & Jockey Fire Pump Sets',
        subtitle: 'Automated pressure-maintaining pump house packages engineered for zero-lag water delivery.',
        image: '/images/system-hydrant-pump.jpg',
        badge: 'Kirloskar / PEW / Auto Panel',
        specs: [
            'Main Electric, Standby Diesel & Submersible Jockey Pumps',
            'Auto-Start Control Panels with Battery Chargers',
            'Pressure Switches, NRVs & Butterfly Valve Manifolds',
        ],
    },
    {
        id: 'clean-agent-suppression',
        category: 'suppression',
        categoryLabel: 'Fire Suppression Systems',
        title: 'FM-200 Clean Agent & CO₂ Gas Suppression',
        subtitle: 'Automatic total-flooding & localized panel suppression designed for data centers & substations.',
        image: '/images/system-suppression.jpg',
        badge: 'NFPA 2001 / Zero Residue',
        specs: [
            'Manifold Pipe-Network & Cabinet-Type Gas Cylinders',
            'Cross-Zoned Smoke Detection with Abort & Manual Release',
            'Non-Conductive Protection for Live Server & LT Panels',
        ],
    },
    {
        id: 'pa-voice-evacuation',
        category: 'alarm',
        categoryLabel: 'Emergency Communication',
        title: 'Public Address, Voice Evacuation & Fire Telephone',
        subtitle: 'Zone-wise emergency voice guidance, two-way firefighter talkback jacks & exit illumination.',
        image: '/images/system-voice-evac.jpg',
        badge: 'High-Rise Life Safety',
        specs: [
            'Digital Voice Evacuation Panels & Floor Speakers',
            'Two-Way Fireman Telephone Jacks per Staircase Core',
            'Centralized Emergency Exit & Escape Route Luminaires',
        ],
    },
    {
        id: 'extinguishers-refilling',
        category: 'equipment',
        categoryLabel: 'Fire Fighting Equipment',
        title: 'ISI Fire Extinguishers, Hydro-Testing & Refilling',
        subtitle: 'Complete supply, refilling, pressure testing & tagging for ABC Powder, CO₂, Foam & Clean Agent units.',
        image: '/images/system-extinguishers.jpg',
        badge: 'IS 15683 Certified Units',
        specs: [
            'ABC Stored-Pressure (2kg–9kg), CO₂ (4.5kg–22.5kg) & K-Class',
            'Certified Nitrogen Charging & Hydrostatic Barrel Testing',
            'QR Asset Tagging with Live Digital Expiry Tracking',
        ],
    },
    {
        id: 'pfp-seals-barriers',
        category: 'pfp',
        categoryLabel: 'Passive Fire (PFP)',
        title: 'Seals & Barriers: Firestop Sealants, Mortar & Pipe Collars',
        subtitle: 'Fire-rated penetration sealing systems preventing flame, smoke & toxic gas spread across wall and slab openings.',
        image: '/images/system-pfp-seals.jpg',
        badge: 'UL 1479 / EN 1366',
        specs: [
            'Intumescent Acrylic & Silicone Firestop Sealants',
            'High-Density Firestop Mortar & Coated Mineral Panel Seals',
            'Tested Intumescent Plastic Pipe Collars & Wraps',
        ],
    },
    {
        id: 'pfp-auto-glow-signages',
        category: 'pfp',
        categoryLabel: 'Passive Fire (PFP)',
        title: 'Auto Glow Safety Signages & Photoluminescent Wayfinding',
        subtitle: 'Zero-power glowing emergency escape, exit route, floor-level & fire equipment identification signages for blackout visibility.',
        image: '/images/system-pfp-autoglow.jpg',
        badge: 'ISO 7010 / NBC Compliant',
        specs: [
            'Photoluminescent Fire Exit, Direction & Floor Identification Signs',
            'Fire Extinguisher, Hose Reel & Assembly Point Glow Signage',
            'High-Luminance PVC / Acrylic Boards & Staircase Nosing Strips',
        ],
    },
    {
        id: 'pfp-openings',
        category: 'pfp',
        categoryLabel: 'Passive Fire (PFP)',
        title: 'Openings: 120-Min Metal Fire-Rated Doors & Curtains',
        subtitle: 'Certified compartmentalization assemblies for escape staircases, lift lobbies, basements & wide industrial spans.',
        image: '/images/system-pfp-openings.jpg',
        badge: '120-Min Fire Rated',
        specs: [
            'IS 3614 / BS 476 120-Min Galvanized Metal Fire Doors',
            'Fire-Rated Glazed Partitions & Vision Panels',
            'Automatic Gravity Fail-Safe Roll-Down Fire Curtains',
        ],
    },
    {
        id: 'pfp-electric-duct-sealing',
        category: 'pfp',
        categoryLabel: 'Passive Fire (PFP)',
        title: 'Electric Duct Sealing with Vermiculite Cement',
        subtitle: 'High-integrity shaft and floor-slab fire barriers encapsulating electrical risers, busducts & cable trays.',
        image: '/images/system-pfp-duct-sealing.jpg',
        badge: '2-Hr Shaft Integrity',
        specs: [
            'Vermiculite-Cement Compound Sealing for Electrical Ducts',
            'Non-Combustible Floor & Shaft Fire Compartmentalization',
            'Clean Cable Tray Penetration Barriers for LT/HT Risers',
        ],
    },
];

const SECTORS = [
    {
        icon: Building2,
        title: 'Co-Op Housing Societies & High-Rises',
        desc: 'Complete AMC maintenance, pump servicing, riser pressure testing & bi-annual Form-B MFB certifications across Mumbai & MMR.',
        metrics: 'Hydrant • Form-B • Quarterly AMC',
    },
    {
        icon: Landmark,
        title: 'Commercial Towers & IT Parks',
        desc: 'Addressable FACPs, floor-zoned voice evacuation, PA talkback, sprinkler retrofits & server room clean-agent suppression.',
        metrics: 'Addressable Panels • PA • Clean Agent',
    },
    {
        icon: Hospital,
        title: 'Hospitals, Clinics & Hospitality',
        desc: 'Silent non-disruptive inspection cycles, aspirating smoke detection, emergency exit lighting & strict statutory audit readiness.',
        metrics: '24/7 Support • NBC Audits • Zero Downtime',
    },
    {
        icon: Factory,
        title: 'Industrial Plants & Warehouses',
        desc: 'Heavy pump rooms, foam & high-velocity deluge monitors, linear heat detection & comprehensive safety equipment supply.',
        metrics: 'Pump Houses • Deluge • Foam Systems',
    },
];

const APPROVED_MAKES = [
    'Kirloskar / PEW Pumps',
    'Jindal / Zenith Pipes',
    'Polycab FRLS Cabling',
    'L&T / Siemens Starters',
    'UL-Listed Sprinklers',
    'Safepro / SafetyOne',
    'Exide Industrial Batteries',
    'IS 15683 Extinguishers',
];

function validateIndianPhone(input: string): { isValid: boolean; normalized: string; error?: string } {
    const raw = (input || '').trim();
    if (!raw) {
        return { isValid: false, normalized: '', error: 'Mobile / Phone number is required.' };
    }
    let cleaned = raw.replace(/[\s\-\(\)\.]/g, '');
    if (cleaned.startsWith('+91')) cleaned = cleaned.slice(3);
    else if (cleaned.startsWith('91') && cleaned.length > 10) cleaned = cleaned.slice(2);
    else if (cleaned.startsWith('0') && cleaned.length > 10) cleaned = cleaned.slice(1);

    if (!/^[6-9]\d{9}$/.test(cleaned)) {
        return {
            isValid: false,
            normalized: cleaned,
            error: 'Please enter a valid 10-digit Indian phone number starting with 6, 7, 8, or 9.',
        };
    }
    return { isValid: true, normalized: cleaned };
}

export default function RudraLandingPage({
    portalHref = '/login',
    portalLabel = 'Client / Staff Login',
}: RudraLandingPageProps) {
    const [activeSlide, setActiveSlide] = useState(0);
    const [activeCategory, setActiveCategory] = useState<CategoryKey>('all');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Quick quote / CRM lead state
    const [inquiryName, setInquiryName] = useState('');
    const [inquiryCompany, setInquiryCompany] = useState('');
    const [inquiryPhone, setInquiryPhone] = useState('');
    const [inquiryLocation, setInquiryLocation] = useState('');
    const [inquiryService, setInquiryService] = useState('Annual Maintenance Contract (AMC) + Form B');
    const [inquiryNotes, setInquiryNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [inquiryError, setInquiryError] = useState<string | null>(null);
    const [phoneError, setPhoneError] = useState<string | null>(null);
    const [submittedLead, setSubmittedLead] = useState<{
        name: string;
        company: string;
        phone: string;
        service: string;
        salesFormNo?: string;
    } | null>(null);

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
        }, 6500);
        return () => clearInterval(timer);
    }, []);

    const activeSystems =
        activeCategory === 'all'
            ? SYSTEM_PRODUCTS.filter((item) => item.category !== 'pfp')
            : activeCategory === 'pfp'
              ? []
              : SYSTEM_PRODUCTS.filter((item) => item.category === activeCategory);

    const passiveSystems =
        activeCategory === 'all' || activeCategory === 'pfp'
            ? SYSTEM_PRODUCTS.filter((item) => item.category === 'pfp')
            : [];

    const handleRequestQuoteForSystem = (systemTitle: string) => {
        setInquiryService(systemTitle);
        setSubmittedLead(null);
        setInquiryError(null);
        const el = document.getElementById('quote-request');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleInquirySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inquiryCompany.trim() || isSubmitting) return;

        const phoneValidation = validateIndianPhone(inquiryPhone);
        if (!phoneValidation.isValid) {
            setPhoneError(phoneValidation.error || 'Please enter a valid 10-digit Indian phone number.');
            return;
        }
        setPhoneError(null);

        setIsSubmitting(true);
        setInquiryError(null);

        try {
            const res = await fetch('/api/leads/inquiry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    company: inquiryCompany.trim(),
                    name: inquiryName.trim(),
                    phone: phoneValidation.normalized,
                    location: inquiryLocation.trim(),
                    service: inquiryService,
                    notes: inquiryNotes.trim(),
                }),
            });

            const json = await res.json();
            if (!res.ok || !json.success) {
                throw new Error(json.error || 'Could not submit inquiry. Please call us directly.');
            }

            setSubmittedLead({
                name: inquiryName.trim(),
                company: inquiryCompany.trim(),
                phone: phoneValidation.normalized,
                service: inquiryService,
                salesFormNo: json.lead?.sales_form_no,
            });

            setInquiryName('');
            setInquiryCompany('');
            setInquiryPhone('');
            setInquiryLocation('');
            setInquiryNotes('');
            setPhoneError(null);
        } catch (err: unknown) {
            setInquiryError(
                err instanceof Error ? err.message : 'Unable to submit right now. Please try again or call +91 77770 88817.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const slide = HERO_SLIDES[activeSlide];

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#E3242B] selection:text-white">
            {/* ── 1. TOP UTILITY BAR (Asenware-Style Corporate Info Strip) ── */}
            <div className="bg-slate-950 text-slate-300 text-xs border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-5 overflow-hidden">
                        <span className="hidden md:inline-flex items-center gap-1.5 text-slate-400 whitespace-nowrap">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#E3242B]" />
                            Turnkey Fire Safety &amp; MFB Form-B Specialists — Mumbai &amp; MMR
                        </span>
                        <a
                            href="tel:+917777088817"
                            className="inline-flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap"
                        >
                            <Phone className="w-3.5 h-3.5 text-[#E3242B]" />
                            <span className="font-semibold text-white">+91 77770 88817</span>
                        </a>
                        <a
                            href="mailto:info@rudrafireprotection.com"
                            className="hidden sm:inline-flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap"
                        >
                            <Mail className="w-3.5 h-3.5 text-[#E3242B]" />
                            info@rudrafireprotection.com
                        </a>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                        <span className="hidden lg:inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            24/7 Breakdown Desk
                        </span>
                        <Link
                            href={portalHref}
                            className="text-white/90 hover:text-[#E3242B] font-semibold transition-colors whitespace-nowrap"
                        >
                            {portalLabel} →
                        </Link>
                    </div>
                </div>
            </div>

            {/* ── 2. STICKY MAIN HEADER / NAVIGATION ── */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3 sm:gap-4">
                    {/* Brand */}
                    <a href="#top" className="flex items-center gap-2.5 sm:gap-3 shrink-0 group">
                        <Image
                            src="/logo.png"
                            alt="Rudra Fire Protection"
                            width={140}
                            height={56}
                            priority
                            className="h-10 sm:h-14 w-auto object-contain shrink-0"
                        />
                        <div className="leading-tight shrink-0">
                            <div className="text-sm sm:text-base xl:text-lg font-extrabold tracking-tight text-slate-900 group-hover:text-[#E3242B] transition-colors whitespace-nowrap">
                                RUDRA FIRE PROTECTION
                            </div>
                            <div className="text-[10px] sm:text-[11px] font-semibold italic text-[#E3242B] tracking-wide whitespace-nowrap hidden sm:block">
                                Fire Prevention Is Better Than Fire Fighting.
                            </div>
                        </div>
                    </a>

                    {/* Desktop Nav */}
                    <nav className="hidden lg:flex items-center gap-4 xl:gap-6 text-[13px] xl:text-sm font-semibold text-slate-700">
                        <a href="#top" className="hover:text-[#E3242B] transition-colors whitespace-nowrap">
                            Home
                        </a>
                        <a href="#systems" className="hover:text-[#E3242B] transition-colors whitespace-nowrap">
                            Systems &amp; Products
                        </a>
                        <a href="#amc-compliance" className="hover:text-[#E3242B] transition-colors whitespace-nowrap">
                            AMC &amp; Form-B
                        </a>
                        <a href="#sectors" className="hover:text-[#E3242B] transition-colors whitespace-nowrap">
                            Projects &amp; Sectors
                        </a>
                        <a href="#standards" className="hover:text-[#E3242B] transition-colors whitespace-nowrap">
                            Quality &amp; Makes
                        </a>
                        <a href="#quote-request" className="hover:text-[#E3242B] transition-colors whitespace-nowrap">
                            Contact
                        </a>
                    </nav>

                    {/* Action Buttons */}
                    <div className="hidden md:flex items-center gap-2.5 xl:gap-3 shrink-0">
                        <Link
                            href={portalHref}
                            className="px-3 xl:px-4 py-2 xl:py-2.5 text-xs xl:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-200 transition-colors whitespace-nowrap"
                        >
                            {portalLabel}
                        </Link>
                        <a
                            href="#quote-request"
                            className="px-3.5 xl:px-5 py-2 xl:py-2.5 text-xs xl:text-sm font-bold text-white bg-[#E3242B] hover:bg-[#c51c22] rounded-md shadow-sm shadow-red-600/25 transition-all inline-flex items-center gap-1.5 whitespace-nowrap"
                        >
                            Get A Quote
                            <ArrowRight className="w-4 h-4" />
                        </a>
                    </div>

                    {/* Mobile Hamburger */}
                    <button
                        type="button"
                        suppressHydrationWarning
                        onClick={() => setMobileMenuOpen((v) => !v)}
                        className="lg:hidden p-2 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-100"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                {/* Mobile Nav Drawer */}
                {mobileMenuOpen && (
                    <div className="lg:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-3 shadow-lg">
                        <a href="#top" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm font-semibold text-slate-800">
                            Home
                        </a>
                        <a href="#systems" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm font-semibold text-slate-800">
                            Systems &amp; Products
                        </a>
                        <a href="#amc-compliance" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm font-semibold text-slate-800">
                            AMC &amp; Form-B
                        </a>
                        <a href="#sectors" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm font-semibold text-slate-800">
                            Projects &amp; Sectors
                        </a>
                        <a href="#standards" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm font-semibold text-slate-800">
                            Quality &amp; Makes
                        </a>
                        <a href="#quote-request" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-sm font-semibold text-slate-800">
                            Contact Us
                        </a>
                        <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                            <Link
                                href={portalHref}
                                className="w-full text-center py-2.5 text-sm font-bold text-slate-800 bg-slate-100 rounded-md"
                            >
                                {portalLabel}
                            </Link>
                            <a
                                href="#quote-request"
                                onClick={() => setMobileMenuOpen(false)}
                                className="w-full text-center py-2.5 text-sm font-bold text-white bg-[#E3242B] rounded-md"
                            >
                                Request Free Quote
                            </a>
                        </div>
                    </div>
                )}
            </header>

            {/* ── 3. FULL-WIDTH INDUSTRIAL HERO SLIDER ── */}
            <section id="top" className="relative bg-slate-950 text-white overflow-hidden">
                {/* Background image stack with smooth cross-fade & dark engineering scrim */}
                <div className="absolute inset-0">
                    {HERO_SLIDES.map((s, idx) => (
                        <Image
                            key={s.image}
                            src={s.image}
                            alt={s.title}
                            fill
                            priority={idx === 0}
                            sizes="100vw"
                            className={`object-cover transition-opacity duration-700 ${
                                idx === activeSlide ? 'opacity-45' : 'opacity-0 pointer-events-none'
                            }`}
                        />
                    ))}
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/35" />
                    <div
                        className="absolute inset-0 opacity-15"
                        style={{
                            backgroundImage:
                                'linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)',
                            backgroundSize: '48px 48px',
                        }}
                    />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
                    <div className="max-w-3xl">
                        {/* Eyebrow badge */}
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm bg-[#E3242B]/15 border border-[#E3242B]/40 text-red-300 text-xs font-bold tracking-widest uppercase mb-5">
                            <Flame className="w-3.5 h-3.5 text-[#E3242B]" />
                            {slide.eyebrow}
                        </div>

                        <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-black tracking-tight leading-[1.1] text-white mb-6">
                            {slide.title}
                        </h1>

                        <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-8 max-w-2xl">
                            {slide.subtitle}
                        </p>

                        {/* Highlights */}
                        <div className="flex flex-wrap gap-3 mb-9">
                            {slide.highlights.map((h) => (
                                <span
                                    key={h}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-xs border border-white/15 rounded text-xs font-semibold text-slate-100"
                                >
                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#E3242B]" />
                                    {h}
                                </span>
                            ))}
                        </div>

                        {/* Hero CTAs */}
                        <div className="flex flex-wrap items-center gap-4">
                            <a
                                href={slide.primaryHref}
                                className="px-7 py-3.5 bg-[#E3242B] hover:bg-[#c51c22] text-white font-bold text-sm rounded-md shadow-lg shadow-red-600/30 transition-all inline-flex items-center gap-2"
                            >
                                {slide.primaryCta}
                                <ArrowRight className="w-4 h-4" />
                            </a>
                            <a
                                href={slide.secondaryHref}
                                className="px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-md border border-white/25 backdrop-blur-xs transition-all"
                            >
                                {slide.secondaryCta}
                            </a>
                        </div>
                    </div>

                    {/* Slide controls */}
                    <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2.5">
                            {HERO_SLIDES.map((s, idx) => (
                                <button
                                    key={s.eyebrow}
                                    type="button"
                                    suppressHydrationWarning
                                    onClick={() => setActiveSlide(idx)}
                                    className={`h-2 rounded-full transition-all ${
                                        idx === activeSlide
                                            ? 'w-10 bg-[#E3242B]'
                                            : 'w-4 bg-white/30 hover:bg-white/50'
                                    }`}
                                    aria-label={`Slide ${idx + 1}`}
                                />
                            ))}
                            <span className="ml-2 text-xs font-mono text-slate-400">
                                0{activeSlide + 1} / 0{HERO_SLIDES.length}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                suppressHydrationWarning
                                onClick={() =>
                                    setActiveSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
                                }
                                className="p-2 rounded border border-white/20 hover:bg-white/10 text-white transition-colors"
                                aria-label="Previous slide"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                suppressHydrationWarning
                                onClick={() => setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
                                className="p-2 rounded border border-white/20 hover:bg-white/10 text-white transition-colors"
                                aria-label="Next slide"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 4. AUTHORITY METRICS & ENGINEERING BAR ── */}
            <section className="bg-[#E3242B] text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:divide-x divide-white/20">
                        <div className="py-1 lg:py-0 lg:pr-6">
                            <div className="text-2xl sm:text-3xl font-black tracking-tight">360°</div>
                            <div className="text-xs sm:text-sm font-semibold text-red-100 mt-0.5">
                                Turnkey Design, Supply &amp; Commissioning
                            </div>
                        </div>
                        <div className="py-1 lg:py-0 lg:px-6">
                            <div className="text-2xl sm:text-3xl font-black tracking-tight">Jan &amp; Jul</div>
                            <div className="text-xs sm:text-sm font-semibold text-red-100 mt-0.5">
                                Bi-Annual Form-B MFB Certification
                            </div>
                        </div>
                        <div className="py-1 lg:py-0 lg:px-6">
                            <div className="text-2xl sm:text-3xl font-black tracking-tight">4 Visits / Yr</div>
                            <div className="text-xs sm:text-sm font-semibold text-red-100 mt-0.5">
                                Scheduled Preventive AMC + Breakdowns
                            </div>
                        </div>
                        <div className="py-1 lg:py-0 lg:pl-6">
                            <div className="text-2xl sm:text-3xl font-black tracking-tight">NBC • NFPA • IS</div>
                            <div className="text-xs sm:text-sm font-semibold text-red-100 mt-0.5">
                                UL / LPCB / ISI Approved Components
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 5. CORE SYSTEMS & PRODUCT CATALOG (Filterable B2B Grid) ── */}
            <section id="systems" className="py-20 bg-slate-50 border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                        <div>
                            <div className="text-xs font-bold uppercase tracking-widest text-[#E3242B] mb-2">
                                Complete Fire Safety Portfolio
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                                Fire Protection Systems &amp; Equipment
                            </h2>
                            <p className="text-slate-600 mt-2 max-w-2xl text-sm sm:text-base">
                                Engineered turnkey fire alarm, hydrant, sprinkler, gas suppression &amp; pumping systems designed for commercial, residential and industrial compliance.
                            </p>
                        </div>

                        {/* Interactive Filter Tabs */}
                        <div className="flex flex-wrap gap-2">
                            {(
                                [
                                    { key: 'all', label: 'All Systems' },
                                    { key: 'alarm', label: 'Fire Alarm & PA' },
                                    { key: 'hydrant', label: 'Hydrant & Pumps' },
                                    { key: 'suppression', label: 'Gas Suppression' },
                                    { key: 'equipment', label: 'Extinguishers' },
                                    { key: 'pfp', label: 'Passive Fire (PFP)' },
                                ] as { key: CategoryKey; label: string }[]
                            ).map((tab) => (
                                <button
                                    key={tab.key}
                                    type="button"
                                    suppressHydrationWarning
                                    onClick={() => setActiveCategory(tab.key)}
                                    className={`px-4 py-2 text-xs font-bold rounded border transition-all cursor-pointer ${
                                        activeCategory === tab.key
                                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                                            : 'bg-white text-slate-700 border-slate-200 hover:border-[#E3242B] hover:text-[#E3242B]'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Active Fire Product / System Cards */}
                    {activeSystems.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
                            {activeSystems.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-red-200 transition-all duration-300 flex flex-col group"
                                >
                                    <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                                        <Image
                                            src={item.image}
                                            alt={item.title}
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <span className="absolute top-3 left-3 px-2.5 py-1 bg-slate-950/85 backdrop-blur-xs text-white text-[11px] font-bold uppercase tracking-wider rounded-sm">
                                            {item.categoryLabel}
                                        </span>
                                        <span className="absolute bottom-3 right-3 px-2.5 py-1 bg-[#E3242B] text-white text-[11px] font-bold rounded-sm shadow-xs">
                                            {item.badge}
                                        </span>
                                    </div>

                                    <div className="p-6 flex-1 flex flex-col">
                                        <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-[#E3242B] transition-colors">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                                            {item.subtitle}
                                        </p>

                                        <ul className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-700 flex-1">
                                            {item.specs.map((spec) => (
                                                <li key={spec} className="flex items-start gap-2">
                                                    <CheckCircle2 className="w-4 h-4 text-[#E3242B] shrink-0 mt-0.5" />
                                                    <span>{spec}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                                            <button
                                                type="button"
                                                suppressHydrationWarning
                                                onClick={() => handleRequestQuoteForSystem(item.title)}
                                                className="inline-flex items-center gap-1.5 text-sm font-bold text-[#E3242B] hover:text-slate-900 transition-colors cursor-pointer"
                                            >
                                                Request BOQ / Quote
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                            <span className="text-[11px] font-mono text-slate-400 uppercase">
                                                Supply &amp; Install
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Passive Fire Protection (PFP) Sub-Section */}
                    {passiveSystems.length > 0 && (
                        <div className={activeSystems.length > 0 ? 'mt-16 pt-14 border-t border-slate-200' : ''}>
                            <div className="mb-8">
                                <div className="text-xs font-bold uppercase tracking-widest text-[#E3242B] mb-2">
                                    Compartmentalization &amp; Structural Containment
                                </div>
                                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                    Passive Fire Protection (PFP)
                                </h3>
                                <p className="text-slate-600 mt-2 max-w-2xl text-sm sm:text-base">
                                    Certified firestop penetration seals, auto glow safety signages, 120-minute rated fire openings &amp; vermiculite electrical shaft sealing to contain fire and guide safe evacuation.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {passiveSystems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-red-200 transition-all duration-300 flex flex-col group"
                                    >
                                        <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                                            <Image
                                                src={item.image}
                                                alt={item.title}
                                                fill
                                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <span className="absolute top-3 left-3 px-2.5 py-1 bg-slate-950/85 backdrop-blur-xs text-white text-[11px] font-bold uppercase tracking-wider rounded-sm">
                                                {item.categoryLabel}
                                            </span>
                                            <span className="absolute bottom-3 right-3 px-2.5 py-1 bg-[#E3242B] text-white text-[11px] font-bold rounded-sm shadow-xs">
                                                {item.badge}
                                            </span>
                                        </div>

                                        <div className="p-5 flex-1 flex flex-col">
                                            <h4 className="text-base font-extrabold text-slate-900 group-hover:text-[#E3242B] transition-colors">
                                                {item.title}
                                            </h4>
                                            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                                                {item.subtitle}
                                            </p>

                                            <ul className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-700 flex-1">
                                                {item.specs.map((spec) => (
                                                    <li key={spec} className="flex items-start gap-2">
                                                        <CheckCircle2 className="w-4 h-4 text-[#E3242B] shrink-0 mt-0.5" />
                                                        <span>{spec}</span>
                                                    </li>
                                                ))}
                                            </ul>

                                            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                                                <button
                                                    type="button"
                                                    suppressHydrationWarning
                                                    onClick={() => handleRequestQuoteForSystem(item.title)}
                                                    className="inline-flex items-center gap-1.5 text-sm font-bold text-[#E3242B] hover:text-slate-900 transition-colors cursor-pointer"
                                                >
                                                    Request BOQ / Quote
                                                    <ArrowRight className="w-4 h-4" />
                                                </button>
                                                <span className="text-[11px] font-mono text-slate-400 uppercase">
                                                    Supply &amp; Install
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* ── 6. TURNKEY AMC, FORM-B COMPLIANCE & DIGITAL PORTAL SPOTLIGHT ── */}
            <section id="amc-compliance" className="py-20 bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        <div className="lg:col-span-6">
                            <div className="text-xs font-bold uppercase tracking-widest text-[#E3242B] mb-2">
                                Statutory Compliance &amp; Preventive Maintenance
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                                Comprehensive AMC &amp; Maharashtra Form-B Certification
                            </h2>
                            <p className="text-slate-600 mt-4 leading-relaxed text-sm sm:text-base">
                                Keeping life-safety equipment operational is both a legal mandate and a critical responsibility. Rudra Fire Protection executes systematic preventive maintenance across Mumbai, Thane &amp; Navi Mumbai—backed by live digital asset &amp; certificate tracking in our Client Portal.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                                    <div className="w-9 h-9 rounded bg-red-100 text-[#E3242B] flex items-center justify-center mb-3">
                                        <FileCheck2 className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-slate-900 text-sm">Bi-Annual Form-B Filing</h3>
                                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                        Licensed inspection &amp; Form-B certification every 6 months (Jan &amp; Jul cycles) per Maharashtra Fire Prevention Act.
                                    </p>
                                </div>

                                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                                    <div className="w-9 h-9 rounded bg-red-100 text-[#E3242B] flex items-center justify-center mb-3">
                                        <Wrench className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-slate-900 text-sm">Quarterly System Servicing</h3>
                                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                        4 scheduled engineering visits/year for hydrant valves, pumps, alarm loops &amp; unlimited breakdown call-outs.
                                    </p>
                                </div>

                                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                                    <div className="w-9 h-9 rounded bg-red-100 text-[#E3242B] flex items-center justify-center mb-3">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-slate-900 text-sm">Multi-Year AMC Discounts</h3>
                                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                        Flexible 1-Year, 2-Year (5% savings), 3-Year (10% savings) &amp; 5-Year (15% savings) maintenance contracts.
                                    </p>
                                </div>

                                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                                    <div className="w-9 h-9 rounded bg-red-100 text-[#E3242B] flex items-center justify-center mb-3">
                                        <Gauge className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-slate-900 text-sm">Live Client Portal Access</h3>
                                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                        Societies &amp; facility managers view equipment QR health logs, service history &amp; Form-B PDFs online.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 flex flex-wrap gap-3">
                                <a
                                    href="#quote-request"
                                    onClick={() => setInquiryService('Annual Maintenance Contract (AMC) + Form B')}
                                    className="px-6 py-3 bg-[#E3242B] hover:bg-[#c51c22] text-white font-bold text-sm rounded-md transition-colors inline-flex items-center gap-2"
                                >
                                    Get AMC Renewal Proposal
                                    <ArrowRight className="w-4 h-4" />
                                </a>
                                <Link
                                    href={portalHref}
                                    className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-md transition-colors"
                                >
                                    Access Client Portal
                                </Link>
                            </div>
                        </div>

                        {/* Right: Structured Engineering Process Panel */}
                        <div className="lg:col-span-6">
                            <div className="bg-slate-950 text-white rounded-xl p-8 sm:p-10 border border-slate-800 shadow-2xl relative overflow-hidden">
                                <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-[#E3242B]/15 blur-2xl pointer-events-none" />
                                <div className="text-xs font-bold uppercase tracking-widest text-[#E3242B] mb-2">
                                    Our Execution Methodology
                                </div>
                                <h3 className="text-2xl font-extrabold mb-6">
                                    From Site Audit to Fire NOC &amp; Ongoing Protection
                                </h3>

                                <div className="space-y-6">
                                    {[
                                        {
                                            step: '01',
                                            title: 'Site Risk Audit & System Design',
                                            text: 'Detailed NBC Part-IV & MFB compliance inspection, hydraulic pressure calculations & transparent itemized BOQ.',
                                        },
                                        {
                                            step: '02',
                                            title: 'Turnkey Supply & Installation',
                                            text: 'Certified installation of MS/GI hydrant risers, fire pumps, addressable panels, sprinklers & clean-agent suppression.',
                                        },
                                        {
                                            step: '03',
                                            title: 'Hydro-Testing & Commissioning',
                                            text: 'Line pressure integrity checks, alarm loop calibration, staff mock drills & handover documentation.',
                                        },
                                        {
                                            step: '04',
                                            title: 'Quarterly AMC & Form-B Compliance',
                                            text: 'Dedicated maintenance engineers ensuring zero-downtime readiness and timely bi-annual MFB certifications.',
                                        },
                                    ].map((item) => (
                                        <div key={item.step} className="flex gap-4 items-start">
                                            <div className="w-10 h-10 rounded bg-[#E3242B] text-white font-mono font-black text-sm flex items-center justify-center shrink-0">
                                                {item.step}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white text-base">{item.title}</h4>
                                                <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                                                    {item.text}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 7. SECTORS & APPLICATIONS ── */}
            <section id="sectors" className="py-20 bg-slate-50 border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <div className="text-xs font-bold uppercase tracking-widest text-[#E3242B] mb-2">
                            Industry Applications
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                            Tailored Safety Across Every Sector
                        </h2>
                        <p className="text-slate-600 mt-3 text-sm sm:text-base">
                            Whether retrofitting a residential society or engineering turnkey suppression for a commercial complex, every solution meets statutory inspection standards.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {SECTORS.map((sec) => {
                            const Icon = sec.icon;
                            return (
                                <div
                                    key={sec.title}
                                    className="bg-white rounded-lg p-6 border border-slate-200 hover:border-[#E3242B] hover:shadow-md transition-all flex flex-col"
                                >
                                    <div className="w-12 h-12 rounded-md bg-slate-900 text-white flex items-center justify-center mb-5">
                                        <Icon className="w-6 h-6 text-[#E3242B]" />
                                    </div>
                                    <h3 className="text-base font-extrabold text-slate-900 mb-2">{sec.title}</h3>
                                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed flex-1">
                                        {sec.desc}
                                    </p>
                                    <div className="mt-5 pt-3 border-t border-slate-100 text-[11px] font-bold text-[#E3242B] tracking-wide uppercase">
                                        {sec.metrics}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── 8. QUALITY STANDARDS & APPROVED MAKES STRIP ── */}
            <section id="standards" className="py-16 bg-slate-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-10 border-b border-slate-800">
                        <div>
                            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#E3242B] mb-2">
                                <Award className="w-4 h-4" />
                                Quality Assurance &amp; Engineering Standards
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                                Built Exclusively With Certified Components &amp; Approved Makes
                            </h2>
                        </div>
                        <div className="flex flex-wrap gap-3 shrink-0">
                            {['NBC PART IV', 'UL LISTED', 'ISI CERTIFIED', 'MFB FORM-B', 'NFPA STANDARDS'].map(
                                (badge) => (
                                    <span
                                        key={badge}
                                        className="px-4 py-2 bg-slate-800 border border-slate-700 rounded text-xs font-extrabold tracking-wider text-slate-100"
                                    >
                                        {badge}
                                    </span>
                                )
                            )}
                        </div>
                    </div>

                    <div className="pt-8">
                        <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                            Trusted OEM &amp; Approved Equipment Makes We Deploy
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                            {APPROVED_MAKES.map((make) => (
                                <div
                                    key={make}
                                    className="px-3 py-3 rounded bg-slate-950/60 border border-slate-800 text-center text-xs font-semibold text-slate-200 flex items-center justify-center"
                                >
                                    {make}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 9. QUOTE REQUEST / CONTACT SECTION ── */}
            <section id="quote-request" className="scroll-mt-16 sm:scroll-mt-20 py-16 sm:py-20 lg:py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                        {/* Left Info */}
                        <div className="lg:col-span-5 space-y-6">
                            <div>
                                <div className="text-xs font-bold uppercase tracking-widest text-[#E3242B] mb-2">
                                    Request Technical Proposal
                                </div>
                                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                                    Schedule a Site Survey or Request a Custom BOQ
                                </h2>
                                <p className="text-slate-600 mt-3 text-sm sm:text-base leading-relaxed">
                                    Share your building type, society name, or equipment requirements. Our engineering team provides fast, transparent quotations for new installations, retrofits, refilling, and Annual Maintenance Contracts.
                                </p>
                            </div>

                            <div className="space-y-4 pt-2">
                                <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
                                    <Phone className="w-5 h-5 text-[#E3242B] mt-0.5 shrink-0" />
                                    <div>
                                        <div className="text-xs font-bold uppercase text-slate-500">
                                            Direct Engineering &amp; Emergency Line
                                        </div>
                                        <a
                                            href="tel:+917777088817"
                                            className="text-base font-extrabold text-slate-900 hover:text-[#E3242B]"
                                        >
                                            +91 77770 88817
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
                                    <Mail className="w-5 h-5 text-[#E3242B] mt-0.5 shrink-0" />
                                    <div>
                                        <div className="text-xs font-bold uppercase text-slate-500">
                                            Email Quotations &amp; Tenders
                                        </div>
                                        <a
                                            href="mailto:info@rudrafireprotection.com"
                                            className="text-base font-extrabold text-slate-900 hover:text-[#E3242B]"
                                        >
                                            info@rudrafireprotection.com
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
                                    <MapPin className="w-5 h-5 text-[#E3242B] mt-0.5 shrink-0" />
                                    <div>
                                        <div className="text-xs font-bold uppercase text-slate-500">
                                            Head Office — Mumbai
                                        </div>
                                        <div className="text-sm font-semibold text-slate-800 mt-0.5 leading-relaxed">
                                            17 Navjeevan Vikas Society, Motilal Nagar, Goregaon West, Mumbai 400104
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Form */}
                        <div className="lg:col-span-7">
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
                                {submittedLead ? (
                                    <div className="py-10 text-center space-y-4">
                                        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                                            <CheckCircle2 className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-900">
                                            Inquiry Saved to Our CRM
                                        </h3>
                                        {submittedLead.salesFormNo && (
                                            <div className="inline-block px-3 py-1 rounded bg-slate-200/80 text-slate-800 font-mono text-xs font-bold">
                                                Reference: {submittedLead.salesFormNo}
                                            </div>
                                        )}
                                        <p className="text-sm text-slate-600 max-w-md mx-auto">
                                            Thank you, <span className="font-bold text-slate-900">{submittedLead.name || 'Partner'}</span>. Your request for{' '}
                                            <span className="font-bold text-[#E3242B]">{submittedLead.service}</span> at{' '}
                                            <span className="font-bold text-slate-900">{submittedLead.company}</span> has been logged. Our Mumbai engineering desk will call{' '}
                                            <span className="font-bold">{submittedLead.phone}</span> shortly.
                                        </p>
                                        <button
                                            type="button"
                                            suppressHydrationWarning
                                            onClick={() => setSubmittedLead(null)}
                                            className="px-5 py-2.5 text-xs font-bold bg-slate-900 text-white rounded hover:bg-slate-800 cursor-pointer"
                                        >
                                            Send Another Inquiry
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleInquirySubmit} className="space-y-5">
                                        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                                            <div>
                                                <h3 className="text-lg font-extrabold text-slate-900">
                                                    Fast Quotation Request
                                                </h3>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    Response within 2 business hours across Mumbai &amp; MMR
                                                </p>
                                            </div>
                                            <Headphones className="w-6 h-6 text-[#E3242B]" />
                                        </div>

                                        {inquiryError && (
                                            <div className="flex items-start gap-2.5 p-3.5 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                                <span>{inquiryError}</span>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                                    Company / Housing Society Name *
                                                </label>
                                                <input
                                                    required
                                                    suppressHydrationWarning
                                                    type="text"
                                                    value={inquiryCompany}
                                                    onChange={(e) => setInquiryCompany(e.target.value)}
                                                    placeholder="e.g. Valentine Apartment D Wing"
                                                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:border-[#E3242B]"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                                    Contact Person
                                                </label>
                                                <input
                                                    suppressHydrationWarning
                                                    type="text"
                                                    value={inquiryName}
                                                    onChange={(e) => setInquiryName(e.target.value)}
                                                    placeholder="Your name / designation"
                                                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:border-[#E3242B]"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                                    Mobile / Phone Number *
                                                </label>
                                                <input
                                                    required
                                                    suppressHydrationWarning
                                                    type="tel"
                                                    value={inquiryPhone}
                                                    onChange={(e) => {
                                                        setInquiryPhone(e.target.value);
                                                        if (phoneError) {
                                                            const check = validateIndianPhone(e.target.value);
                                                            if (check.isValid) setPhoneError(null);
                                                        }
                                                    }}
                                                    onBlur={() => {
                                                        if (inquiryPhone.trim()) {
                                                            const check = validateIndianPhone(inquiryPhone);
                                                            if (!check.isValid) {
                                                                setPhoneError(check.error || 'Please enter a valid 10-digit Indian phone number.');
                                                            } else {
                                                                setPhoneError(null);
                                                            }
                                                        }
                                                    }}
                                                    placeholder="+91 98XXXXXXXX"
                                                    className={`w-full px-3.5 py-2.5 text-base sm:text-sm bg-white border rounded-md focus:outline-none transition-colors ${
                                                        phoneError
                                                            ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500'
                                                            : 'border-slate-300 focus:border-[#E3242B]'
                                                    }`}
                                                />
                                                {phoneError && (
                                                    <p className="mt-1 text-xs font-semibold text-red-600 flex items-center gap-1">
                                                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                        <span>{phoneError}</span>
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                                    Site Location / Area
                                                </label>
                                                <input
                                                    suppressHydrationWarning
                                                    type="text"
                                                    value={inquiryLocation}
                                                    onChange={(e) => setInquiryLocation(e.target.value)}
                                                    placeholder="e.g. Malad West, Goregaon, Andheri"
                                                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:border-[#E3242B]"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                                Required System / Service
                                            </label>
                                            <select
                                                suppressHydrationWarning
                                                value={inquiryService}
                                                onChange={(e) => setInquiryService(e.target.value)}
                                                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:border-[#E3242B]"
                                            >
                                                <option>Annual Maintenance Contract (AMC) + Form B</option>
                                                <option>Addressable &amp; Conventional Fire Alarm Systems</option>
                                                <option>Fire Hydrant, Riser &amp; Sprinkler Networks</option>
                                                <option>Packaged Main, Diesel &amp; Jockey Fire Pump Sets</option>
                                                <option>FM-200 Clean Agent &amp; CO₂ Gas Suppression</option>
                                                <option>Public Address, Voice Evacuation &amp; Fire Telephone</option>
                                                <option>ISI Fire Extinguishers, Hydro-Testing &amp; Refilling</option>
                                                <option>Seals &amp; Barriers: Firestop Sealants, Mortar &amp; Pipe Collars</option>
                                                <option>Auto Glow Safety Signages &amp; Photoluminescent Wayfinding</option>
                                                <option>Openings: 120-Min Metal Fire-Rated Doors &amp; Curtains</option>
                                                <option>Electric Duct Sealing with Vermiculite Cement</option>
                                                <option>New Building Fire Safety Turnkey BOQ / Fire NOC</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                                Project / Requirement Details
                                            </label>
                                            <textarea
                                                suppressHydrationWarning
                                                rows={3}
                                                value={inquiryNotes}
                                                onChange={(e) => setInquiryNotes(e.target.value)}
                                                placeholder="Number of wings/floors, existing panel/pump condition, or audit timeline..."
                                                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:border-[#E3242B]"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            suppressHydrationWarning
                                            className="w-full py-3.5 px-6 bg-[#E3242B] hover:bg-[#c51c22] disabled:opacity-65 disabled:cursor-not-allowed text-white font-bold text-sm rounded-md shadow-md shadow-red-600/20 transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Submitting to CRM...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4" />
                                                    Request Free Quote &amp; Site Inspection
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── 10. INDUSTRIAL DARK CORPORATE FOOTER (Asenware-Style) ── */}
            <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-28 sm:pt-14 sm:pb-32">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
                        {/* Col 1 */}
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-white rounded p-1.5">
                                    <Image
                                        src="/logo.png"
                                        alt="Rudra Fire Protection"
                                        width={96}
                                        height={36}
                                        className="h-9 w-auto object-contain"
                                    />
                                </div>
                                <div>
                                    <div className="text-sm font-extrabold text-white tracking-wide">
                                        RUDRA FIRE PROTECTION
                                    </div>
                                    <div className="text-[11px] text-[#E3242B] italic font-semibold">
                                        Safety Engineering Partner
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed mb-4">
                                End-to-end fire detection, hydrant, sprinkler, gas suppression, and statutory AMC maintenance specialist protecting residential, commercial and industrial properties.
                            </p>
                            <div className="text-xs font-mono text-slate-500">
                                GSTIN: 27CECPD2175P1Z9
                            </div>
                        </div>

                        {/* Col 2 */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
                                Fire Systems
                            </h4>
                            <ul className="space-y-2.5 text-xs">
                                {[
                                    'Addressable Fire Alarm Panels',
                                    'Conventional Detection Systems',
                                    'Fire Hydrant & Sprinkler Piping',
                                    'Packaged Fire Pump Houses',
                                    'FM-200 & CO₂ Gas Suppression',
                                    'ISI Fire Extinguishers & Refilling',
                                ].map((item) => (
                                    <li key={item}>
                                        <a
                                            href="#systems"
                                            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
                                        >
                                            <BreadcrumbArrow className="w-3 h-3 text-[#E3242B]" />
                                            {item}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Col 3 */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
                                Compliance &amp; Portals
                            </h4>
                            <ul className="space-y-2.5 text-xs">
                                <li>
                                    <a href="#amc-compliance" className="text-slate-400 hover:text-white transition-colors">
                                        Comprehensive &amp; Non-Comp AMC
                                    </a>
                                </li>
                                <li>
                                    <a href="#amc-compliance" className="text-slate-400 hover:text-white transition-colors">
                                        Bi-Annual MFB Form-B Certificates
                                    </a>
                                </li>
                                <li>
                                    <a href="#sectors" className="text-slate-400 hover:text-white transition-colors">
                                        Housing Society &amp; Commercial Audits
                                    </a>
                                </li>
                                <li>
                                    <Link href={portalHref} className="text-red-400 hover:text-red-300 font-semibold transition-colors">
                                        {portalLabel} →
                                    </Link>
                                </li>
                                <li className="pt-1.5">
                                    <a
                                        href="/rudra-fire-company-profile.pdf"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        download="Rudra_Fire_Company_Profile_2025.pdf"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#E3242B]/15 hover:bg-[#E3242B]/25 text-red-400 hover:text-white border border-[#E3242B]/35 hover:border-[#E3242B] font-semibold transition-all text-xs group shadow-xs cursor-pointer"
                                        title="Download Company Profile (PDF)"
                                    >
                                        <FileText className="w-3.5 h-3.5 text-[#E3242B] group-hover:scale-110 transition-transform shrink-0" />
                                        <span>Company Profile</span>
                                        <Download className="w-3 h-3 text-slate-400 group-hover:text-white transition-colors shrink-0" />
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Col 4 */}
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
                                Contact Office
                            </h4>
                            <div className="space-y-3 text-xs text-slate-400">
                                <p className="leading-relaxed">
                                    17 Navjeevan Vikas Society, Motilal Nagar, Goregaon West, Mumbai 400104
                                </p>
                                <p>
                                    Phone:{' '}
                                    <a href="tel:+917777088817" className="text-white font-semibold hover:text-[#E3242B]">
                                        +91 77770 88817
                                    </a>
                                </p>
                                <p>
                                    Email:{' '}
                                    <a href="mailto:info@rudrafireprotection.com" className="text-white font-semibold hover:text-[#E3242B]">
                                        info@rudrafireprotection.com
                                    </a>
                                </p>
                                <p>Web: www.rudrafireprotection.com</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                        <div suppressHydrationWarning>
                            © {new Date().getFullYear()} Rudra Fire Protection. All rights reserved.
                        </div>
                        <div>Fire Prevention Is Better Than Fire Fighting.</div>
                    </div>
                </div>
            </footer>

            {/* ── 11. FLOATING WHATSAPP QUICK-CHAT BUTTON ── */}
            <a
                href="https://wa.me/917777088817?text=Hi%20Rudra%20Fire%20Protection%2C%20I%20would%20like%20to%20inquire%20about%20Fire%20Safety%20%2F%20Form-B%20AMC."
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat on WhatsApp with Rudra Fire Protection"
                className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 group flex items-center gap-2.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold text-xs sm:text-sm p-3.5 sm:pl-3.5 sm:pr-4 sm:py-3 rounded-full shadow-2xl shadow-emerald-950/30 ring-4 ring-[#25D366]/20 transition-all hover:scale-105 active:scale-95"
            >
                <svg
                    viewBox="0 0 32 32"
                    className="w-6 h-6 fill-current shrink-0"
                    aria-hidden="true"
                >
                    <path d="M16.004 2.667C8.64 2.667 2.667 8.64 2.667 16c0 2.353.615 4.651 1.784 6.678L2.56 29.333l6.829-1.79A13.277 13.277 0 0 0 16.004 29.333c7.363 0 13.33-5.973 13.33-13.333 0-7.36-5.967-13.333-13.33-13.333Zm7.788 18.886c-.329.927-1.622 1.694-2.664 1.918-.711.15-1.639.27-4.763-1.023-3.997-1.656-6.571-5.716-6.771-5.979-.192-.262-1.615-2.15-1.615-4.101 0-1.951 1.015-2.909 1.383-3.307.367-.397.801-.496 1.068-.496.267 0 .535.002.768.014.246.013.576-.094.901.688.329.794 1.124 2.742 1.224 2.942.1.2.167.433.033.696-.134.262-.2.426-.4.658-.2.231-.42.517-.6.694-.2.199-.408.414-.175.812.233.398 1.036 1.709 2.225 2.769 1.529 1.364 2.818 1.787 3.218 1.986.4.2.634.167.868-.1.233-.268.999-1.166 1.266-1.566.266-.4.533-.334.9-.2.367.133 2.333 1.1 2.733 1.3.4.2.667.3.767.466.1.167.1.964-.229 1.891Z" />
                </svg>
                <span className="hidden sm:inline whitespace-nowrap tracking-wide">
                    WhatsApp Us
                </span>
            </a>
        </div>
    );
}