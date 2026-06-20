import { createClient } from './supabase/client';

const supabase = createClient();

/**
 * Calculates the Indian Financial Year label (e.g., "25-26").
 * Financial year starts on April 1st.
 */
export const getFYLabel = (): string => {
    const d = new Date();
    const month = d.getMonth(); // 0-11
    const year = d.getFullYear();
    // FY starts in April (month 3)
    const startYear = month >= 3 ? year : year - 1;
    const endYear = startYear + 1;
    return `${String(startYear).slice(2)}-${String(endYear).slice(2)}`;
};

/**
 * Fetches the next sequential number for a given document type.
 * @param type 'professional' | 'legacy' | 'amc'
 * @returns The formatted quotation number
 */
export const fetchNextQuotationNumber = async (type: 'professional' | 'legacy' | 'amc'): Promise<string> => {
    const fyLabel = getFYLabel();
    let prefix = '';
    let padding = 4;
    let dbKey = '';
    let format = '';

    switch (type) {
        case 'professional':
            dbKey = `qtn-prof-${fyLabel}`;
            prefix = `Rudra/QTN/${fyLabel}/`;
            padding = 4;
            format = 'XXXX';
            break;
        case 'legacy':
            dbKey = `quote-${fyLabel}`;
            prefix = `RFP/${fyLabel}/`;
            padding = 5;
            format = 'XXXXX';
            break;
        case 'amc':
            dbKey = `qtn-amc-${fyLabel}`;
            prefix = `AMC/${fyLabel}/`;
            padding = 4;
            format = 'XXXX';
            break;
    }

    try {
        const { data, error } = await supabase.rpc('next_doc_sequence', { p_key: dbKey });
        if (!error && data) {
            return `${prefix}${String(data).padStart(padding, '0')}`;
        }
        console.error(`Error fetching sequence for ${type}:`, error);
    } catch (err) {
        console.error(`Exception fetching sequence for ${type}:`, err);
    }

    // Fallback: This should ideally not happen if the RPC is set up
    // But to prevent complete failure, we use a temporary random fallback with a WARNING
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${random} (ERR)`;
};
