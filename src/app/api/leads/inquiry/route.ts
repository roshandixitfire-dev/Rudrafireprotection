import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/utils/supabase/server';
import { sendLeadInquiryEmail } from '@/utils/inquiryMailer';

interface InquiryPayload {
    company?: string;
    name?: string;
    phone?: string;
    location?: string;
    service?: string;
    notes?: string;
}

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as InquiryPayload;
        const company = (body.company || '').trim();
        const name = (body.name || '').trim();
        const phone = (body.phone || '').trim();
        const location = (body.location || '').trim();
        const service = (body.service || 'General Fire Safety Inquiry').trim();
        const notes = (body.notes || '').trim();

        if (!company || !phone) {
            return NextResponse.json(
                { success: false, error: 'Company / Housing Society name and phone number are required.' },
                { status: 400 }
            );
        }

        let cleanedPhone = phone.replace(/[\s\-\(\)\.]/g, '');
        if (cleanedPhone.startsWith('+91')) cleanedPhone = cleanedPhone.slice(3);
        else if (cleanedPhone.startsWith('91') && cleanedPhone.length > 10) cleanedPhone = cleanedPhone.slice(2);
        else if (cleanedPhone.startsWith('0') && cleanedPhone.length > 10) cleanedPhone = cleanedPhone.slice(1);

        if (!/^[6-9]\d{9}$/.test(cleanedPhone)) {
            return NextResponse.json(
                { success: false, error: 'Please enter a valid 10-digit Indian phone number starting with 6, 7, 8, or 9.' },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        const { data: existingLeads, error: fetchError } = await supabase
            .from('leads')
            .select('sr_no, sales_form_no');

        if (fetchError) {
            console.error('Error reading leads for auto-numbering:', fetchError.message);
            return NextResponse.json(
                { success: false, error: fetchError.message || 'Unable to connect to CRM database.' },
                { status: 500 }
            );
        }

        const maxSrNo = (existingLeads || []).reduce((max: number, lead: { sr_no: string | null }) => {
            const num = parseInt(String(lead.sr_no || ''), 10);
            return !Number.isNaN(num) ? Math.max(max, num) : max;
        }, 0);
        const nextSrNo = (maxSrNo + 1).toString();

        const now = new Date();
        const istYear = Number(
            new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', year: 'numeric' }).format(now)
        );
        const istMonth = Number(
            new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Kolkata', month: 'numeric' }).format(now)
        ); // 1-12
        const fiscalYear =
            istMonth >= 4
                ? `${istYear.toString().slice(-2)}-${(istYear + 1).toString().slice(-2)}`
                : `${(istYear - 1).toString().slice(-2)}-${istYear.toString().slice(-2)}`;

        const pattern = new RegExp(`RFP/${fiscalYear}/(\\d+)`);
        const maxFormNum = (existingLeads || []).reduce(
            (max: number, lead: { sales_form_no: string | null }) => {
                const match = lead.sales_form_no?.match(pattern);
                if (match) {
                    const num = parseInt(match[1], 10);
                    return !Number.isNaN(num) ? Math.max(max, num) : max;
                }
                return max;
            },
            0
        );
        const nextFormNo = `RFP/${fiscalYear}/${(maxFormNum + 1).toString().padStart(4, '0')}`;
        const salesFormDate = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

        const contactDisplay = name ? `${name} (${cleanedPhone})` : cleanedPhone;
        const remarkLines = [
            `[Website Fast Quote] Requirement: ${service}`,
            `Contact: ${name || '-'} | Phone: ${cleanedPhone}`,
        ];
        if (location) remarkLines.push(`Site Area: ${location}`);
        if (notes) remarkLines.push(`Notes: ${notes}`);

        const leadPayload = {
            sr_no: nextSrNo,
            sales_form_no: nextFormNo,
            sales_form_date: salesFormDate,
            source: 'Website',
            stage: 'NEW',
            category: 'HOT',
            location: location || 'Mumbai / MMR',
            project_name: company,
            developer: contactDisplay,
            const_status: service,
            owner_name: name || company,
            finalizing_authority: contactDisplay,
            finalizing_authority_name: name || company,
            finalizing_authority_number: cleanedPhone,
            remarks: remarkLines.join('\n'),
        };

        const { data: insertedLead, error: insertError } = await supabase
            .from('leads')
            .insert(leadPayload)
            .select('id, sr_no, sales_form_no')
            .single();

        if (insertError) {
            console.error('Error saving website inquiry to CRM leads:', insertError.message);
            return NextResponse.json(
                { success: false, error: insertError.message || 'Failed to save inquiry.' },
                { status: 500 }
            );
        }

        revalidatePath('/dashboard/crm');

        const emailResult = await sendLeadInquiryEmail({
            leadId: insertedLead.id,
            srNo: insertedLead.sr_no || nextSrNo,
            salesFormNo: insertedLead.sales_form_no || nextFormNo,
            salesFormDate,
            company,
            name,
            phone,
            location: location || 'Mumbai / MMR',
            service,
            notes,
        });

        if (!emailResult.sent && emailResult.error) {
            console.warn('CRM inquiry email notification not sent:', emailResult.error);
        }

        return NextResponse.json(
            {
                success: true,
                lead: insertedLead,
                emailNotification: {
                    sent: emailResult.sent,
                    provider: emailResult.provider || null,
                },
            },
            { status: 201 }
        );
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unexpected server error.';
        console.error('Fatal error in /api/leads/inquiry:', message);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}

