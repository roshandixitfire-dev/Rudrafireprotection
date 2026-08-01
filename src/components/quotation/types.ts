export type UserRole = 'admin' | 'employee' | 'client';
export type UnitType = 'Nos' | 'Mtr' | 'Lot' | 'Set' | 'Sq.Mtr' | 'Kg' | 'LS';

export interface BOQItem {
    id: string;
    srNo: number;
    description: string;
    unit: UnitType;
    qty: number;
    rate: number;
    amount: number;
}

export interface BOQSection {
    id: string;
    name: string;
    items: BOQItem[];
    total: number;
}

export interface ApprovedMake {
    id: string;
    item: string;
    make: string;
}

// Payment term option
export interface PaymentOption {
    label: string;        // e.g. "25% Advance, 50% delivery, 25% handover"
    tranches: string[];   // e.g. ["25% Advance", "50% Against material delivery", "25% Against handover"]
}

// Per-section T&C toggle
export interface TermsConfig {
    includeCommercialTC: boolean;
    includeScopeOfWork: boolean;
    includePrice: boolean;
    includePriceEscalation: boolean;
    includePayment: boolean;
    paymentOptionIndex: number;   // index into PAYMENT_OPTIONS
    includeCompletion: boolean;
    includeGuarantee: boolean;
    includeForceМajeure: boolean;
    includeValidity: boolean;
    commercialTerms: string[];    // editable list
    scopeText: string;
    priceText: string;
    priceEscalationText: string;
    completionText: string;
    guaranteeText: string;
    forceMajeureText: string;
    validityText: string;
    cfoRefNo: string;
    cfoDate: string;
}

// Page selection for print
export interface PrintPages {
    coverLetter: boolean;
    summarySheet: boolean;
    boqPages: boolean;
    approvedMakes: boolean;
    termsConditions: boolean;
    includeSignature?: boolean;
}

export interface Quotation {
    // Master Details
    quotationNo: string;
    date: string;
    clientName: string;
    companyName: string;
    address: string;
    mobile: string;
    email: string;
    designation: string;
    contactPerson: string;
    faxNo: string;
    phoneNo: string;
    projectName: string;
    projectLocation: string;
    subject: string;
    refNo: string;
    preparedBy: string;
    validityDays: number;
    gstPercentage: number;
    configuration: string;    // project config description (Page 2 header)

    // Cover letter body
    coverLetterBody: string;

    // Dynamic Content
    sections: BOQSection[];
    approvedMakes: ApprovedMake[];

    // Terms
    termsConfig: TermsConfig;

    // Print page selection
    printPages: PrintPages;

    terms: string[];
    paymentTerms: string;
    completionTime: string;
}

export interface AMCItem {
    id: string;
    srNo: string;
    title: string;
    description: string;
    qty: string;
    unit: string;
    rate: number;
    amount: number;
    rowSpan?: number;
    isMergedChild?: boolean;
}

export interface AMCPackage {
    years: number;
    amount: number;
    label: string;
}

export interface AMCQuotation {
    id?: string;
    quoteNo: string;
    date: string;
    toTitle: string;
    companyName: string;
    street: string;
    location: string;
    city: string;
    state: string;
    pin: string;
    contactPerson: string;
    contactNumber: string;
    items: AMCItem[];
    packages: AMCPackage[];
    terms: string[];
    totalAmount: number;
    includeSignature?: boolean;
}

export interface QuotationSummary {
    subtotal: number;
    gstAmount: number;
    cgst: number;
    sgst: number;
    grandTotal: number;
    roundedTotal: number;
    amountInWords: string;
}
