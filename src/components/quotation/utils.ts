import { QuotationSummary, BOQSection, BOQItem, UnitType, PaymentOption, TermsConfig, PrintPages } from './types';

export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
    }).format(amount);
};

export const numberToWords = (num: number): string => {
    const a = [
        '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ',
        'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '
    ];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const inWords = (n: number): string => {
        if (n < 20) return a[n];
        if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' : '') + a[n % 10];
        if (n < 1000) return inWords(Math.floor(n / 100)) + 'Hundred ' + (n % 100 !== 0 ? 'and ' + inWords(n % 100) : '');
        if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 !== 0 ? inWords(n % 1000) : '');
        if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + (n % 100000 !== 0 ? inWords(n % 100000) : '');
        return inWords(Math.floor(n / 10000000)) + 'Crore ' + (n % 10000000 !== 0 ? inWords(n % 10000000) : '');
    };

    const wholePart = Math.floor(num);
    const decimalPart = Math.round((num - wholePart) * 100);

    let result = 'Rupees ' + inWords(wholePart);
    if (decimalPart > 0) {
        result += 'and ' + inWords(decimalPart) + 'Paise ';
    }
    return result + 'Only';
};

export const calculateQuotationTotals = (sections: BOQSection[], gstPercentage: number): QuotationSummary => {
    const subtotal = sections.reduce((sum, section) => sum + section.total, 0);
    const gstAmount = (subtotal * gstPercentage) / 100;
    const grandTotal = subtotal + gstAmount;
    const roundedTotal = Math.round(grandTotal);

    return {
        subtotal,
        gstAmount,
        cgst: gstAmount / 2,
        sgst: gstAmount / 2,
        grandTotal,
        roundedTotal,
        amountInWords: numberToWords(roundedTotal),
    };
};



export const DEFAULT_TERMS = [
    "Electricity and water required for erection, testing, and commissioning shall be provided by you at no extra cost.",
    "Scaffolding, if required, shall be provided by you without any charge.",
    "Adequate Store Room shall be provided at the site, free of cost, for the storage of our equipment and materials.",
    "Accommodation for labour at the site shall be permitted without any additional cost.",
    "Incoming power supply up to the Fire Control Panel, Control Valve and Underground Tank shall be arranged and provided by you.",
    "All necessary civil works, including excavation, backfilling, and wall/floor openings and Core Cutting, shall be carried out by you.",
    "Any additional work beyond the agreed scope shall be subject to extra charges.",
    "Quantities are subject to variation based on actual site conditions",
    "The final invoice shall be prepared based on actual measurements and installations completed at the site."
];

export const SCOPE_OF_WORK = [
    "Engineering, submission & taking approval from Client/Architect.",
    "Supply, installation, testing and commissioning of Fire Fighting System."
];

export const APPROVED_MAKE_LIST = [
    { id: '1', item: 'M.S. Pipe 200 mm and above', make: 'Jindal/Zenith' },
    { id: '2', item: 'G.I. Pipe 25mm to 150 mm', make: 'Zenith Birla/Jindal' },
    { id: '3', item: 'Pumps', make: 'PEW/kirloskar' },
    { id: '4', item: 'Landing Valves - S. S.', make: 'Safepro/SafetyOne' },
    { id: '5', item: 'Rubber Pipe', make: 'Safepro/SAfetyOne' },
    { id: '6', item: 'Butterfly valve / N.R.V.', make: 'SIR' },
    { id: '7', item: 'Hose pipe', make: 'Safepro/fireoxine' },
    { id: '8', item: 'Air release Valve', make: 'Priyanka /Essel' },
    { id: '9', item: 'Gun Metal Branch Pipe with Instaneous type Nozzle', make: 'Safepro/SafetyOne' },
    { id: '10', item: 'Pressure gauge', make: 'H.Guru / Febig' },
    { id: '11', item: 'Anchor Fastener', make: 'Commercial' },
    { id: '12', item: 'Paints', make: 'Asian / Nerolac / Berger' },
    { id: '13', item: 'Portable Fire Extinguisher', make: 'Safepro/SafetyOne' },
    { id: '14', item: 'Fire Alarm Panel', make: 'Heaven' },
    { id: '15', item: 'Pill box & Hooter', make: 'Heaven' },
    { id: '16', item: 'Battery', make: 'Exide / Standard / Vision' },
    { id: '17', item: 'FRLS Cable', make: 'Poly Cab/CCR' },
    { id: '18', item: 'Starter', make: 'L&T / Siemens/Jainson' },
    { id: '19', item: 'Sprinkler Head', make: 'UL listed' },
    { id: '20', item: 'Hose Reel Set', make: 'Safepro/SafetyOne' },
    { id: '21', item: 'Hose Box', make: 'Safepro/SafetyOne' },
];

// ─── Payment Options ──────────────────────────────────────────────────────────
export const PAYMENT_OPTIONS: PaymentOption[] = [
    {
        label: "25% - 50% - 25%",
        tranches: [
            "25% Advance against work order",
            "50% Against material delivery at site on pro-rata basis within 10 days",
            "20% Against Virtual completion",
            "5% Against NOC from Local Fire Authorities & Handover",
        ]
    },
    {
        label: "25% - 25% - 25% - 25%",
        tranches: [
            "25% Advance against work order",
            "25% Against material delivery at site on pro-rata basis",
            "25% Against 75% completion of work",
            "25% Against Virtual completion & NOC from Fire Authorities",
        ]
    },
    {
        label: "30% - 40% - 30%",
        tranches: [
            "30% Advance against work order",
            "40% Against material delivery and ongoing work on pro-rata basis",
            "30% Against completion, testing & commissioning",
        ]
    },
    {
        label: "50% - 25% - 25%",
        tranches: [
            "50% Advance against work order",
            "25% Against material delivery at site on pro-rata basis within 10 days",
            "25% Against Virtual completion & handover",
        ]
    },
    {
        label: "25% - 25% - 25% - 25% (Quarterly)",
        tranches: [
            "25% Advance at project start",
            "25% After 30 days of start",
            "25% After 60 days of start",
            "25% Against completion, testing, commissioning & handover",
        ]
    },
];

export const DEFAULT_TERMS_CONFIG: TermsConfig = {
    includeCommercialTC: true,
    includeScopeOfWork: true,
    includePrice: true,
    includePriceEscalation: true,
    includePayment: true,
    paymentOptionIndex: 0,
    includeCompletion: true,
    includeGuarantee: true,
    includeForceМajeure: true,
    includeValidity: true,
    commercialTerms: [
        "Electricity and water required for erection, testing, and commissioning shall be provided by you at no extra cost.",
        "Scaffolding, if required, shall be provided by you without any charge.",
        "Adequate Store Room shall be provided at the site, free of cost, for the storage of our equipment and materials.",
        "Accommodation for labour at the site shall be permitted without any additional cost.",
        "Incoming power supply up to the Fire Control Panel, Control Valve and Underground Tank shall be arranged and provided by you.",
        "All necessary civil works, including excavation, backfilling, and wall/floor openings and Core Cutting, shall be carried out by you.",
        "Any additional work beyond the agreed scope shall be subject to extra charges.",
        "Quantities are subject to variation based on actual site conditions.",
        "The final invoice shall be prepared based on actual measurements and installations completed at the site.",
    ],
    scopeText: "Engineering, submission & taking approval from Client/Architect.\nSupply, installation, testing and commissioning of Fire Fighting System.",
    priceText: "Our Price are for destination (Site) inclusive of supplying, erection, testing commissioning of the system.",
    priceEscalationText: "Price quoted in this are based on existing price like rate of raw material, rate of labor, transportation etc. However rates are subject to escalation.",
    completionText: "The Site mobilisation will start immediately within 10 days on receipt of your technically and commercial clear work order and advance.",
    guaranteeText: "The system as a whole or in parts there of is guaranteed for satisfactory performance and against any defective work man ship for period of 12 months from date of testing & commissioning.",
    forceMajeureText: "Company shall not be liable for loss, damage, or delay by force majeure condition such as Fire, Strike, Riot, Shortage, Flood & natural calamities and other causes like increase of basic steel products which are beyond our control.",
    validityText: "This offer stands good for 30 days and there after subject to our conformation.",
    cfoRefNo: "",
    cfoDate: "",
};

export const DEFAULT_PRINT_PAGES: PrintPages = {
    coverLetter: true,
    summarySheet: true,
    boqPages: true,
    approvedMakes: true,
    termsConditions: true,
};

export const SAMPLE_PROJECT_DATA = {
    clientName: "Rahul Sharma",
    companyName: "Grand Hyatt Hotels",
    projectName: "MITALLI BUSINESS CENTRE",
    projectLocation: "Mumbai, Maharashtra",
    subject: "Design, Supply, Installation, Testing & Commissioning of Fire Fighting System",
    refNo: "RFP/FFS/25-26/037",
    sections: [
        {
            id: 's1',
            name: "Pump Room",
            items: [
                { id: 'b1', srNo: 1, description: "Hydrant Pump: Providing, fixing & commissioning of 2400 LPM at 105 Mtrs head Main pump Ci impeller coupled with 100HP/2900 rpm motor...", unit: 'Nos' as UnitType, qty: 2, rate: 349755, amount: 699510 },
                { id: 'b2', srNo: 2, description: "Sprinkler Pump: Providing, fixing & commissioning of 2400 LPM at 105 Mtrs head Main pump Ci impeller coupled with 100HP/2900 rpm motor...", unit: 'Nos' as UnitType, qty: 2, rate: 349755, amount: 699510 },
                { id: 'b3', srNo: 3, description: "Jockey Pump: Providing, fixing & commissioning of Kirloskar make pump model no DB 32-26...", unit: 'Nos' as UnitType, qty: 3, rate: 100585, amount: 301755 },
                { id: 'b4', srNo: 4, description: "Control Panel: Fabricating, supplying & testing sheet cubical pattern front hinged door floor mounted type...", unit: 'Nos' as UnitType, qty: 1, rate: 869505, amount: 869505 },
                { id: 'b5', srNo: 5, description: "Non Return Valve (N.R.V.): Providing, fixing & commissioning of N.R.V. With flanges, nuts, bolts...", unit: 'Nos' as UnitType, qty: 8, rate: 6236, amount: 49888 },
            ],
            total: 2619168
        },
        {
            id: 's2',
            name: "Hydrant System Inside",
            items: [
                { id: 'b6', srNo: 1, description: "G.I. Pipe (Internal): Providing, fixing & commissioning of G. I. 'C' class heavy pipes... 150mm, 100mm, 80mm", unit: 'Mtr' as UnitType, qty: 479, rate: 1250, amount: 598750 },
                { id: 'b7', srNo: 2, description: "Hose Reel: Providing, fixing & commissioning of approved make drum type wall mounted hose reel...", unit: 'Nos' as UnitType, qty: 40, rate: 4500, amount: 180000 },
            ],
            total: 778750
        }
    ]
};

// ─── Two-Level Hierarchical Selection Library ────────────────────────────────
// STEP 1: pick main sections | STEP 2: tick sub-items (with optional children)

export interface LibraryItem {
    key: string;
    label: string;
    children?: LibraryItem[];
}

export interface LibrarySection {
    name: string;
    items: LibraryItem[];
}

export const HIERARCHICAL_LIBRARY: LibrarySection[] = [
    {
        name: "Pump Room & Accessories",
        items: [
            { key: "hydrant_pump", label: "Hydrant Pump" },
            { key: "sprinkler_pump", label: "Sprinkler Pump" },
            { key: "hydrant_jockey", label: "Hydrant Jockey Pump" },
            { key: "sprinkler_jockey", label: "Sprinkler Jockey Pump" },
            { key: "standby_pump", label: "Standby Pump (Diesel)" },
            { key: "main_panel", label: "Main Control Panel" },
            { key: "nrv_valves", label: "NRV & Valve Set" },
            { key: "flexible_hose", label: "Flexible Hose Connectors" },
            { key: "pressure_gauge", label: "Pressure Gauge Set" },
        ]
    },
    {
        name: "Hydrant System Inside Building",
        items: [
            {
                key: "gi_pipe_internal", label: "GI Pipe (Internal)", children: [
                    { key: "gi_150", label: "GI Pipe 150mm NB" },
                    { key: "gi_100", label: "GI Pipe 100mm NB" },
                    { key: "gi_80", label: "GI Pipe 80mm NB" },
                    { key: "gi_65", label: "GI Pipe 65mm NB" },
                ]
            },
            { key: "air_release_valve", label: "Air Release Valve" },
            { key: "hose_reel", label: "Hose Reel" },
            { key: "single_hydrant", label: "Single Hydrant Valve" },
            { key: "double_hydrant", label: "Double Hydrant Valve" },
            { key: "hydrant_landing_valve", label: "Hydrant Landing Valve" },
            { key: "fire_hose_cabinet", label: "Fire Hose Cabinet" },
        ]
    },
    {
        name: "External Hydrant System",
        items: [
            {
                key: "ms_pipe_external", label: "MS Pipe (External/UG)", children: [
                    { key: "ms_200", label: "MS Pipe 200mm NB" },
                    { key: "ms_150", label: "MS Pipe 150mm NB" },
                    { key: "ms_100", label: "MS Pipe 100mm NB" },
                ]
            },
            { key: "yard_hydrant", label: "Yard Hydrant Post" },
            { key: "monitor_nozzle", label: "Monitor Nozzle" },
            { key: "isolation_valve", label: "Isolation Butterfly Valve" },
            { key: "siamese_connection", label: "Siamese Connection" },
        ]
    },
    {
        name: "Sprinkler System",
        items: [
            {
                key: "sprinkler_heads", label: "Sprinkler Heads", children: [
                    { key: "pendent_sprinkler", label: "Pendent Type" },
                    { key: "upright_sprinkler", label: "Upright Type" },
                    { key: "sidewall_sprinkler", label: "Side Wall Type" },
                ]
            },
            { key: "icv", label: "Installation Control Valve (ICV)" },
            { key: "flow_switch", label: "Flow Switch" },
            {
                key: "gi_sprinkler_pipe", label: "GI Pipe (Sprinkler)", children: [
                    { key: "gi_sp_100", label: "GI Pipe 100mm NB" },
                    { key: "gi_sp_65", label: "GI Pipe 65mm NB" },
                    { key: "gi_sp_50", label: "GI Pipe 50mm NB" },
                ]
            },
            { key: "pressure_switch", label: "Pressure Switch" },
        ]
    },
    {
        name: "Terrace Level",
        items: [
            { key: "terrace_outlet", label: "Terrace Hydrant Outlet" },
            { key: "terrace_piping", label: "Terrace Piping" },
            { key: "terrace_valves", label: "Isolation Valves (Terrace)" },
        ]
    },
    {
        name: "Fire Alarm System",
        items: [
            { key: "facp", label: "Fire Alarm Control Panel" },
            { key: "smoke_detector", label: "Smoke Detector (Optical)" },
            { key: "heat_detector", label: "Heat Detector" },
            { key: "mcp", label: "Manual Call Point" },
            { key: "hooter_strobe", label: "Hooter / Strobe Light" },
            { key: "fire_alarm_cable", label: "2 Core Shielded Cable" },
        ]
    },
    {
        name: "Hand & Portable Appliances",
        items: [
            { key: "abc_6kg", label: "ABC Powder Extinguisher 6 Kg" },
            { key: "co2_4kg", label: "CO₂ Extinguisher 4.5 Kg" },
            { key: "water_9ltr", label: "Water Type Extinguisher 9 Ltr" },
            { key: "fire_bucket", label: "Fire Bucket with Stand" },
            { key: "sand_bucket", label: "Sand Bucket" },
        ]
    }
];

export const BOQ_ITEM_DATA: Record<string, Partial<BOQItem>> = {
    "hydrant_pump": { description: "Hydrant Pump: Providing, fixing & commissioning of 2280 LPM at 70 Mtrs head, CI impeller centrifugal pump coupled with 60HP/2900 rpm TEFC motor on common base frame.", unit: 'Nos', rate: 349755 },
    "sprinkler_pump": { description: "Sprinkler Pump: Providing, fixing & commissioning of 2280 LPM at 70 Mtrs head, CI impeller centrifugal pump coupled with 60HP/2900 rpm TEFC motor on common base frame.", unit: 'Nos', rate: 349755 },
    "hydrant_jockey": { description: "Hydrant Jockey Pump: Providing, fixing & commissioning of Kirloskar make multi-stage jockey pump 36 LPM at 105 Mtrs head, coupled with 2HP/2900 RPM TEFC motor.", unit: 'Nos', rate: 100585 },
    "sprinkler_jockey": { description: "Sprinkler Jockey Pump: Providing, fixing & commissioning of Kirloskar make multi-stage jockey pump 36 LPM at 105 Mtrs head, coupled with 2HP/2900 RPM TEFC motor.", unit: 'Nos', rate: 100585 },
    "standby_pump": { description: "Standby Pump (Diesel Engine Driven): Diesel engine driven centrifugal fire pump as per NFPA 20, self-priming with manual & auto starting facility.", unit: 'Nos', rate: 650000 },
    "main_panel": { description: "Main Control Panel: Fully automatic sheet steel cubical type panel with DOL/Star-Delta starters for each pump, auto/manual selectors, indicating lamps and all accessories.", unit: 'Nos', rate: 185000 },
    "nrv_valves": { description: "NRV & Valve Set: Supply & fixing set including Non-return valves, Butterfly isolation valves, suction strainers, pressure gauges, and drain valves complete.", unit: 'Lot', rate: 125000 },
    "flexible_hose": { description: "Flexible Hose Connectors: SS braided annular corrugated flexible hose connectors for pump suction & delivery connections.", unit: 'Nos', rate: 8500 },
    "pressure_gauge": { description: "Pressure Gauge Set: Dial type 0-16 kg/cm² gauges with gauge cocks and siphon on pump headers.", unit: 'Set', rate: 4500 },
    "gi_150": { description: "G.I. Pipe 150mm NB: Providing, fixing & commissioning of GI 'C' class heavy ERW pipes 150mm NB with all fittings, hangers, clamps, and red oxide painting.", unit: 'Mtr', rate: 2150 },
    "gi_100": { description: "G.I. Pipe 100mm NB: Providing, fixing & commissioning of GI 'C' class heavy ERW pipes 100mm NB with all fittings, hangers, clamps, and red oxide painting.", unit: 'Mtr', rate: 1650 },
    "gi_80": { description: "G.I. Pipe 80mm NB: Providing, fixing & commissioning of GI 'C' class heavy ERW pipes 80mm NB with all fittings, hangers, clamps, and red oxide painting.", unit: 'Mtr', rate: 1250 },
    "gi_65": { description: "G.I. Pipe 65mm NB: Providing, fixing & commissioning of GI 'C' class heavy ERW pipes 65mm NB with all fittings, hangers, clamps, and red oxide painting.", unit: 'Mtr', rate: 980 },
    "air_release_valve": { description: "Air Release Valve: Providing & fixing of automatic air release valve 25mm NB with isolation ball valve on riser mains.", unit: 'Nos', rate: 3500 },
    "hose_reel": { description: "Hose Reel: Providing, fixing & commissioning of approved make drum type wall mounted hose reel with 30 Mtr x 19mm dia. rubber hose and shut-off nozzle.", unit: 'Nos', rate: 4500 },
    "single_hydrant": { description: "Single Hydrant Valve: Providing, fixing & commissioning of S.S. single outlet landing valve 63mm with instantaneous coupling, blank cap and chain.", unit: 'Nos', rate: 3500 },
    "double_hydrant": { description: "Double Hydrant Valve: Providing, fixing & commissioning of S.S. double outlet landing valve 2×63mm with instantaneous couplings, blank caps and chains.", unit: 'Nos', rate: 6500 },
    "hydrant_landing_valve": { description: "Hydrant Landing Valve: Providing, fixing & commissioning of gunmetal/SS hydrant landing valve 63mm NB with all accessories.", unit: 'Nos', rate: 3800 },
    "fire_hose_cabinet": { description: "Fire Hose Cabinet: Fabricating & fixing of M.S. powder coated fire hose cabinet housing 2 sets of 63mm×15 Mtr hoses and branch pipe with nozzle.", unit: 'Nos', rate: 5500 },
    "ms_200": { description: "MS Pipe 200mm NB (External/UG): Providing, laying & jointing of MS 'B' class ERW pipe 200mm NB in external fire main/underground with anti-corrosion wrapping.", unit: 'Mtr', rate: 3850 },
    "ms_150": { description: "MS Pipe 150mm NB (External/UG): Providing, laying & jointing of MS 'B' class ERW pipe 150mm NB in external fire main/underground with anti-corrosion wrapping.", unit: 'Mtr', rate: 2650 },
    "ms_100": { description: "MS Pipe 100mm NB (External/UG): Providing, laying & jointing of MS 'B' class ERW pipe 100mm NB in external fire main/underground.", unit: 'Mtr', rate: 1950 },
    "yard_hydrant": { description: "Yard Hydrant Post: Providing & fixing of above-ground stand post type yard hydrant with single 63mm outlet, guard post and base flange.", unit: 'Nos', rate: 18500 },
    "monitor_nozzle": { description: "Monitor Nozzle: Providing & fixing of aluminium alloy monitor nozzle on pedestal stand with 360° rotation and adjustable jet/spray pattern.", unit: 'Nos', rate: 38500 },
    "isolation_valve": { description: "Isolation Butterfly Valve: Providing & fixing of PN16 rated butterfly valve with gear operator for external main isolation.", unit: 'Nos', rate: 12500 },
    "siamese_connection": { description: "Siamese Connection: Providing & fixing of gunmetal twin inlet breeching inlet 2×63mm instantaneous female inlets with NRVs and cap.", unit: 'Nos', rate: 9500 },
    "pendent_sprinkler": { description: "Sprinkler Head (Pendent): Providing & fixing of 68°C rated glass bulb pendent type sprinkler head with escutcheon plate.", unit: 'Nos', rate: 650 },
    "upright_sprinkler": { description: "Sprinkler Head (Upright): Providing & fixing of 68°C rated glass bulb upright type sprinkler head.", unit: 'Nos', rate: 650 },
    "sidewall_sprinkler": { description: "Sprinkler Head (Side Wall): Providing & fixing of 68°C rated glass bulb sidewall sprinkler head with escutcheon plate.", unit: 'Nos', rate: 780 },
    "icv": { description: "Installation Control Valve (ICV): Providing & fixing of 100mm NB wet pipe ICV with alarm valve, retard chamber, pressure gauge set, and all trim.", unit: 'Nos', rate: 65000 },
    "flow_switch": { description: "Flow Switch: Providing & fixing of vane-type flow switch on sprinkler branch mains for zone alarm indication.", unit: 'Nos', rate: 8500 },
    "gi_sp_100": { description: "GI Pipe 100mm NB (Sprinkler): Providing, fixing of GI heavy class pipe 100mm NB for sprinkler main distribution.", unit: 'Mtr', rate: 1650 },
    "gi_sp_65": { description: "GI Pipe 65mm NB (Sprinkler): Providing, fixing of GI heavy class pipe 65mm NB for sprinkler branch distribution.", unit: 'Mtr', rate: 980 },
    "gi_sp_50": { description: "GI Pipe 50mm NB (Sprinkler): Providing, fixing of GI heavy class pipe 50mm NB for sprinkler branch mains.", unit: 'Mtr', rate: 780 },
    "pressure_switch": { description: "Pressure Switch: Providing & fixing of adjustable pressure switch for pump auto-start signal.", unit: 'Nos', rate: 4500 },
    "terrace_outlet": { description: "Terrace Hydrant Outlet: Providing & fixing of 65mm NB gunmetal outlet valve on terrace hydrant point.", unit: 'Nos', rate: 3500 },
    "terrace_piping": { description: "Terrace Piping: Providing, fixing of GI 'C' class pipe 65mm NB on terrace including hangers and clamps.", unit: 'Mtr', rate: 980 },
    "terrace_valves": { description: "Isolation Valves (Terrace): Providing & fixing of 65mm NB butterfly isolation valves on terrace hydrant main.", unit: 'Nos', rate: 3500 },
    "facp": { description: "Fire Alarm Control Panel: Providing, fixing & commissioning of conventional/addressable FACP as per IS 2189 with zone indicators, battery backup, and all accessories.", unit: 'Nos', rate: 35000 },
    "smoke_detector": { description: "Smoke Detector (Optical): Providing, fixing & commissioning of approved make optical type smoke detector with base.", unit: 'Nos', rate: 950 },
    "heat_detector": { description: "Heat Detector: Providing, fixing & commissioning of approved make fixed temperature heat detector with base.", unit: 'Nos', rate: 850 },
    "mcp": { description: "Manual Call Point: Providing, fixing & commissioning of approved make manual call point with hammer and break glass arrangement.", unit: 'Nos', rate: 650 },
    "hooter_strobe": { description: "Hooter / Strobe Light: Providing, fixing & commissioning of combined audio-visual alarm unit hooter with strobe.", unit: 'Nos', rate: 1250 },
    "fire_alarm_cable": { description: "2 Core Shielded Cable: Supplying & laying of 2 core 1.5 sq.mm FRLS shielded cable for detector loop wiring.", unit: 'Mtr', rate: 45 },
    "abc_6kg": { description: "ABC Dry Powder Fire Extinguisher 6 Kg: Supplying, mounting & commissioning of stored pressure type ABC powder extinguisher 6 kg capacity with wall bracket.", unit: 'Nos', rate: 2200 },
    "co2_4kg": { description: "CO₂ Fire Extinguisher 4.5 Kg: Supplying, mounting & commissioning of CO₂ type extinguisher 4.5 kg capacity with wall bracket and discharge horn.", unit: 'Nos', rate: 4500 },
    "water_9ltr": { description: "Water Type Fire Extinguisher 9 Ltr: Supplying, mounting & commissioning of stored pressure water type extinguisher 9 ltr capacity.", unit: 'Nos', rate: 1800 },
    "fire_bucket": { description: "Fire Bucket with Stand: Supplying & fixing of 9 litre red painted metal fire bucket on M.S. stand.", unit: 'Nos', rate: 850 },
    "sand_bucket": { description: "Sand Bucket: Supplying & fixing of 9 litre red painted metal sand bucket filled with dry sand.", unit: 'Nos', rate: 750 },
};

// Backward compat aliases (empty stubs)
export const SECTION_TEMPLATES: Record<string, string[]> = {};
export const MASTER_ITEM_LIBRARY: Record<string, Partial<BOQItem>> = BOQ_ITEM_DATA;
export const ITEM_LIBRARY: Record<string, Partial<BOQItem>[]> = {};

