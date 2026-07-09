import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

/**
 * Checks if a client with the exact name (case-insensitive) already exists in the 'clients' table.
 */
export async function checkClientExists(companyName: string): Promise<boolean> {
    if (!companyName || companyName.trim().length < 2) return true;
    try {
        const { data, error } = await supabase
            .from('clients')
            .select('id')
            .ilike('name', companyName.trim())
            .limit(1);
        if (error) {
            console.error('Error checking client existence:', error);
            return true; // fallback to true to prevent unnecessary prompts on error
        }
        return data && data.length > 0;
    } catch (e) {
        console.error('Exception checking client existence:', e);
        return true;
    }
}

/**
 * Adds a new client to the CRM 'clients' table.
 */
export async function addClientToCRM(clientData: {
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
    status?: string;
}) {
    try {
        const payload = {
            name: clientData.name,
            address: clientData.address || '',
            area: clientData.area || '',
            district: clientData.district || '',
            state: clientData.state || 'Maharashtra',
            pincode: clientData.pincode || '',
            contact_person: clientData.contact_person || clientData.contact_name || '',
            contact_name: clientData.contact_name || clientData.contact_person || '',
            phone: clientData.phone || '',
            email: clientData.email || '',
            status: clientData.status || 'Active',
            created_at: new Date().toISOString(),
        };

        const { data, error } = await supabase.from('clients').insert(payload).select('id').single();
        if (error) {
            console.error('Error adding client to CRM:', error);
            return { success: false, error: error.message };
        }
        return { success: true, data };
    } catch (e: any) {
        console.error('Exception adding client to CRM:', e);
        return { success: false, error: e.message };
    }
}

/**
 * Automatically creates a lead from a quotation in the 'leads' table.
 */
export async function createLeadFromQuotation(quotationData: {
    projectName: string;
    companyName: string;
    location?: string;
    contactPerson?: string;
    mobile?: string;
    remarks?: string;
}) {
    try {
        const { data: leads, error: fetchError } = await supabase
            .from('leads')
            .select('sr_no, sales_form_no');

        if (fetchError) {
            console.error('Error fetching leads for auto-numbering:', fetchError);
            throw fetchError;
        }

        // Calculate next SR.NO
        const maxSrNo = (leads || []).reduce((max: number, lead: any) => {
            const num = parseInt(lead.sr_no);
            return !isNaN(num) ? Math.max(max, num) : max;
        }, 0);
        const nextSrNo = (maxSrNo + 1).toString();

        // Calculate next Sales Form No: RFP/YY-YY/0001
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth(); // 0-indexed
        let fiscalYear = '';
        if (month >= 3) { // April onwards
            fiscalYear = `${year.toString().slice(-2)}-${(year + 1).toString().slice(-2)}`;
        } else {
            fiscalYear = `${(year - 1).toString().slice(-2)}-${year.toString().slice(-2)}`;
        }

        const pattern = new RegExp(`RFP/${fiscalYear}/(\\d+)`);
        const maxFormNum = (leads || []).reduce((max: number, lead: any) => {
            const match = lead.sales_form_no?.match(pattern);
            if (match) {
                const num = parseInt(match[1]);
                return !isNaN(num) ? Math.max(max, num) : max;
            }
            return max;
        }, 0);

        const nextFormNo = `RFP/${fiscalYear}/${(maxFormNum + 1).toString().padStart(4, '0')}`;

        const payload = {
            sr_no: nextSrNo,
            sales_form_no: nextFormNo,
            sales_form_date: now.toISOString().split('T')[0],
            project_name: quotationData.projectName || quotationData.companyName,
            developer: quotationData.companyName,
            location: quotationData.location || '',
            owner_name: quotationData.contactPerson || '',
            finalizing_authority_name: quotationData.contactPerson || '',
            finalizing_authority_number: quotationData.mobile || '',
            stage: 'quoted',
            remarks: quotationData.remarks || 'Automatically created from quotation',
            source: 'Quotation',
            created_at: now.toISOString(),
        };

        const { data, error } = await supabase.from('leads').insert(payload).select('id').single();
        if (error) {
            console.error('Error creating lead from quotation:', error);
            return { success: false, error: error.message };
        }
        return { success: true, data };
    } catch (e: any) {
        console.error('Exception creating lead from quotation:', e);
        return { success: false, error: e.message };
    }
}
