/**
 * Utility for exporting Quotations and Invoices to Microsoft Word (.doc) format.
 * Generates high-fidelity Word-compatible HTML with MSO namespaces, A4 portrait margins,
 * table formatting, and base64-embedded images (Logo, Signature) so documents are fully self-contained.
 */

// Cache base64 images in memory for instant reuse
let cachedLogoBase64: string | null = null;
let cachedSignatureBase64: string | null = null;

async function getBase64Image(url: string): Promise<string> {
    try {
        const fullUrl = url.startsWith('http') || url.startsWith('data:')
            ? url
            : `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;

        const res = await fetch(fullUrl);
        const blob = await res.blob();
        return await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (e) {
        console.warn('Failed to convert image to base64:', url, e);
        return '';
    }
}

async function getLogoBase64(): Promise<string> {
    if (!cachedLogoBase64) {
        cachedLogoBase64 = await getBase64Image('/logo.png');
    }
    return cachedLogoBase64;
}

async function getSignatureBase64(): Promise<string> {
    if (!cachedSignatureBase64) {
        cachedSignatureBase64 = await getBase64Image('/signature.png');
    }
    return cachedSignatureBase64;
}

/**
 * Trigger file download in browser
 */
export function downloadDocFile(filename: string, contentHtml: string, title?: string) {
    const cleanFilename = (filename || 'document').replace(/[^a-zA-Z0-9_\-]/g, '_');
    const docTitle = title || cleanFilename;

    const fullDocument = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office'
      xmlns:w='urn:schemas-microsoft-com:office:word'
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>${docTitle}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page Section1 {
      size: 21.0cm 29.7cm; /* A4 */
      margin: 1.2cm 1.2cm 1.2cm 1.2cm;
      mso-header-margin: 0.5cm;
      mso-footer-margin: 0.5cm;
      mso-page-orientation: portrait;
    }
    div.Section1 {
      page: Section1;
    }
    body {
      font-family: Arial, 'Segoe UI', Tahoma, sans-serif;
      font-size: 10pt;
      line-height: 1.35;
      color: #111111;
      background: #ffffff;
      margin: 0;
      padding: 0;
    }
    table {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
      width: 100%;
    }
    th, td {
      vertical-align: top;
      font-family: Arial, 'Segoe UI', sans-serif;
    }
    .page-break {
      page-break-before: always;
      mso-break-type: section-break;
    }
    img {
      border: 0;
      outline: none;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="Section1">
    ${contentHtml}
  </div>
</body>
</html>`;

    const blob = new Blob(['\ufeff', fullDocument], {
        type: 'application/msword;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cleanFilename}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Format currency with 2 decimals
 */
const fmt = (n: number | null | undefined): string =>
    (n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * Generate Word DOC for Legacy Quotation
 */
export async function exportLegacyQuoteToDoc(data: any) {
    const logoBase64 = await getLogoBase64();
    const signatureBase64 = await getSignatureBase64();

    const baseAmount = (data.items || []).reduce((s: number, it: any) => s + (Number(it.amount) || 0), 0);
    const sgstAmt = baseAmount * (Number(data.sgstPct) || 0) / 100;
    const cgstAmt = baseAmount * (Number(data.cgstPct) || 0) / 100;
    const grandTotal = baseAmount + sgstAmt + cgstAmt;
    const displayDate = data.date ? new Date(data.date).toLocaleDateString('en-IN') : '';

    const html = `
    <!-- Top Header -->
    <table style="width:100%; border:none; border-collapse:collapse; background-color:#FFF1F1; margin-bottom:15px;">
      <tr>
        <td style="padding:10px 15px; border:none; width:50%;">
          ${logoBase64 ? `<img src="${logoBase64}" width="160" style="display:block; margin-bottom:6px;" alt="Logo" />` : ''}
          <div style="color:#E3242B; font-size:9.5pt; font-weight:bold; font-style:italic;">
            Fire Prevention Is Better Than Fire Fighting.
          </div>
        </td>
        <td style="padding:10px 15px; border:none; width:50%; text-align:right;">
          <div style="font-size:11pt; font-weight:bold; color:#1a1a1a;">RUDRA FIRE PROTECTION</div>
          <div style="font-size:8.5pt; color:#444; margin-top:2px;">GSTIN : 27CECPD2175P1Z9</div>
          <div style="font-size:8.5pt; color:#444;">info@rudrafireprotection.com</div>
          <div style="color:#E3242B; font-size:18pt; font-weight:bold; margin-top:12px;">
            QUOTATION ${data.quoteNo || ''}
          </div>
        </td>
      </tr>
    </table>

    <!-- Date & Client Details -->
    <table style="width:100%; border:none; border-collapse:collapse; margin-bottom:12px;">
      <tr>
        <td style="border:none; width:65%; font-size:9pt; line-height:1.5;">
          <strong>To,</strong><br/>
          ${data.toTitle ? `${data.toTitle}<br/>` : 'The Hon Chairman/ Hon Secretary,<br/>'}
          ${data.companyName ? `<strong>${data.companyName}</strong><br/>` : ''}
          ${data.street ? `${data.street},<br/>` : ''}
          ${data.location ? `${data.location},<br/>` : ''}
          ${[data.city, data.state, data.pin].filter(Boolean).join(' - ')}
          <br/><strong>Dear Sir,</strong>
        </td>
        <td style="border:none; width:35%; text-align:right; font-size:9.5pt; color:#333;">
          Date : <strong>${displayDate}</strong>
        </td>
      </tr>
    </table>

    <div style="text-align:center; font-size:9pt; font-style:italic; margin-bottom:10px; color:#444;">
      Please find below our best priced offer, terms &amp; conditions
    </div>

    <!-- Items Table -->
    <table style="width:100%; border-collapse:collapse; border:1px solid #000; margin-bottom:0;">
      <thead>
        <tr style="background-color:#E8E8E8;">
          <th style="border:1px solid #000; padding:5px; text-align:center; font-size:9pt; width:30px;">Sr.<br/>No.</th>
          <th style="border:1px solid #000; padding:5px; text-align:center; font-size:9pt;">Item Description</th>
          <th style="border:1px solid #000; padding:5px; text-align:center; font-size:9pt; width:40px;">Qty</th>
          <th style="border:1px solid #000; padding:5px; text-align:center; font-size:9pt; width:45px;">Unit</th>
          <th style="border:1px solid #000; padding:5px; text-align:right; font-size:9pt; width:65px;">Rate (₹)</th>
          ${data.showTaxColumn !== false ? '<th style="border:1px solid #000; padding:5px; text-align:center; font-size:9pt; width:45px;">Tax%</th>' : ''}
          <th style="border:1px solid #000; padding:5px; text-align:right; font-size:9pt; width:80px;">Amount (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${(data.items || []).map((item: any, idx: number) => `
          <tr>
            <td style="border:1px solid #000; padding:5px; text-align:center; font-size:9pt;">${idx + 1}</td>
            <td style="border:1px solid #000; padding:5px; font-size:9pt;">
              <strong>${item.title || ''}</strong>
              ${item.description ? `<div style="font-size:8.5pt; color:#444; margin-top:2px;">${item.description}</div>` : ''}
            </td>
            <td style="border:1px solid #000; padding:5px; text-align:center; font-size:9pt;">${item.qty || 1}</td>
            <td style="border:1px solid #000; padding:5px; text-align:center; font-size:9pt;">${item.unit || 'Nos'}</td>
            <td style="border:1px solid #000; padding:5px; text-align:right; font-size:9pt;">${(Number(item.rate) || 0).toLocaleString('en-IN')}</td>
            ${data.showTaxColumn !== false ? `<td style="border:1px solid #000; padding:5px; text-align:center; font-size:9pt;">${item.taxPct > 0 ? `${item.taxPct}%` : '-'}</td>` : ''}
            <td style="border:1px solid #000; padding:5px; text-align:right; font-size:9pt; font-family:monospace;">${fmt(item.amount)}</td>
          </tr>
        `).join('')}
        <tr>
          <td colspan="${data.showTaxColumn !== false ? 6 : 5}" style="border:1px solid #000; border-right:none; text-align:right; font-weight:bold; font-size:9pt; padding:4px 8px;">Gross Total :</td>
          <td style="border:1px solid #000; text-align:right; font-weight:bold; font-size:9pt; padding:4px 8px; font-family:monospace;">${fmt(baseAmount)}</td>
        </tr>
        <tr>
          <td colspan="${data.showTaxColumn !== false ? 6 : 5}" style="border:1px solid #000; border-right:none; text-align:right; font-size:9pt; padding:4px 8px;">Output SGST @${data.sgstPct || 0}% :</td>
          <td style="border:1px solid #000; text-align:right; font-size:9pt; padding:4px 8px; font-family:monospace;">${sgstAmt > 0 ? fmt(sgstAmt) : '-'}</td>
        </tr>
        <tr>
          <td colspan="${data.showTaxColumn !== false ? 6 : 5}" style="border:1px solid #000; border-right:none; text-align:right; font-size:9pt; padding:4px 8px;">Output CGST @${data.cgstPct || 0}% :</td>
          <td style="border:1px solid #000; text-align:right; font-size:9pt; padding:4px 8px; font-family:monospace;">${cgstAmt > 0 ? fmt(cgstAmt) : '-'}</td>
        </tr>
        <tr style="background-color:#EEEEEE;">
          <td colspan="${data.showTaxColumn !== false ? 6 : 5}" style="border:1px solid #000; border-right:none; text-align:right; font-weight:bold; font-size:10pt; padding:5px 8px;">Grand Total :</td>
          <td style="border:1px solid #000; text-align:right; font-weight:bold; font-size:10pt; padding:5px 8px; font-family:monospace;">₹ ${fmt(grandTotal)}</td>
        </tr>
      </tbody>
    </table>

    <!-- Terms & Conditions -->
    <div style="border:1px solid #000; border-top:none; padding:8px 12px; margin-bottom:0;">
      <div style="font-size:9.5pt; font-weight:bold; text-decoration:underline; margin-bottom:4px;">Terms &amp; Conditions :-</div>
      <ol style="margin:0; padding-left:18px; font-size:9pt; color:#222; line-height:1.4;">
        ${(data.termsItems || []).map((t: string) => `<li style="margin-bottom:2px;">${t}</li>`).join('')}
      </ol>
    </div>

    <!-- Bank Details -->
    <div style="border:1px solid #000; border-top:none; padding:8px 12px; margin-bottom:0;">
      <div style="font-size:9.5pt; font-weight:bold; text-decoration:underline; margin-bottom:4px;">BANK DETAILS</div>
      <div style="font-size:9pt; color:#222; line-height:1.5;">
        <span style="font-weight:bold; margin-right:20px;">Rudra Fire Protection</span>
        <span style="margin-right:20px;">Bank: State Bank Of India</span>
        <span style="margin-right:20px;">Account Number : 40698757999</span>
        <span>IFSC Code : SBIN0016719</span>
      </div>
    </div>

    <!-- Signature Block -->
    <div style="border:1px solid #000; border-top:none; padding:10px 14px;">
      <div style="font-size:9.5pt; font-weight:bold; margin-bottom:8px;">For, Rudra Fire Protection</div>
      ${data.includeSignature !== false && signatureBase64 ? `
        <div style="margin: 4px 0 4px 5px;">
          <img src="${signatureBase64}" height="42" alt="Signature" style="display:block;" />
        </div>
      ` : '<div style="height:35px;"></div>'}
      <div style="font-size:9.5pt; font-weight:bold;">Authorised Signatory</div>
    </div>

    <!-- Footer -->
    <table style="width:100%; border:none; border-collapse:collapse; margin-top:20px; border-top:1px solid #999; padding-top:6px;">
      <tr>
        <td style="border:none; font-size:8pt; color:#444;">
          17 Navjeevan Vikas Society, Motilal Nagar, Goregaon West, Mumbai 400104 ☎ 7777088817<br/>
          www.rudrafireprotection.com
        </td>
        <td style="border:none; text-align:right; font-size:8pt; color:#666;">
          Page 1
        </td>
      </tr>
    </table>
    `;

    const safeQuoteNo = data.quoteNo ? data.quoteNo.replace(/[^a-z0-9]/gi, '_') : 'quote';
    const sanitizedName = data.companyName ? data.companyName.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'project';
    downloadDocFile(`${safeQuoteNo}_${sanitizedName}`, html, `Quotation ${data.quoteNo}`);
}

/**
 * Generate Word DOC for Legacy Invoice
 */
export async function exportLegacyInvoiceToDoc(data: any) {
    const logoBase64 = await getLogoBase64();
    const signatureBase64 = await getSignatureBase64();

    const baseAmount = (data.items || []).reduce((s: number, it: any) => s + (Number(it.amount) || 0), 0);
    const sgstAmt = baseAmount * (Number(data.sgstPct) || 0) / 100;
    const cgstAmt = baseAmount * (Number(data.cgstPct) || 0) / 100;
    const grandTotal = baseAmount + sgstAmt + cgstAmt;
    const displayDate = data.date ? new Date(data.date).toLocaleDateString('en-IN') : '';

    const invoiceTitle = data.invoiceType === 'proforma' ? 'PROFORMA INVOICE'
        : data.invoiceType === 'retail' ? 'RETAIL INVOICE'
        : data.invoiceType === 'bos' ? 'BILL OF SUPPLY'
        : 'TAX INVOICE';

    const html = `
    <!-- Top Header -->
    <table style="width:100%; border:none; border-collapse:collapse; background-color:#FFF1F1; margin-bottom:15px;">
      <tr>
        <td style="padding:10px 15px; border:none; width:50%;">
          ${logoBase64 ? `<img src="${logoBase64}" width="160" style="display:block; margin-bottom:6px;" alt="Logo" />` : ''}
          <div style="color:#E3242B; font-size:9.5pt; font-weight:bold; font-style:italic;">
            Fire Prevention Is Better Than Fire Fighting.
          </div>
        </td>
        <td style="padding:10px 15px; border:none; width:50%; text-align:right;">
          <div style="font-size:11pt; font-weight:bold; color:#1a1a1a;">RUDRA FIRE PROTECTION</div>
          <div style="font-size:8.5pt; color:#444; margin-top:2px;">GSTIN : 27CECPD2175P1Z9</div>
          <div style="font-size:8.5pt; color:#444;">info@rudrafireprotection.com</div>
          <div style="color:#E3242B; font-size:17pt; font-weight:bold; margin-top:12px;">
            ${invoiceTitle}
          </div>
        </td>
      </tr>
    </table>

    <!-- Invoice Details & Client Block -->
    <table style="width:100%; border:1px solid #000; border-collapse:collapse; margin-bottom:10px;">
      <tr>
        <td style="width:55%; border:1px solid #000; padding:6px 10px; font-size:9pt; line-height:1.4;">
          <strong>Buyer (Bill to) :</strong><br/>
          ${data.companyName ? `<strong>${data.companyName}</strong><br/>` : ''}
          ${data.street ? `${data.street},<br/>` : ''}
          ${data.location ? `${data.location},<br/>` : ''}
          ${[data.city, data.state, data.pin].filter(Boolean).join(' - ')}
          ${data.gstin ? `<br/>GSTIN / UIN : <strong>${data.gstin}</strong>` : ''}
        </td>
        <td style="width:45%; border:1px solid #000; padding:6px 10px; font-size:9pt; line-height:1.4;">
          Invoice No. : <strong>${data.invoiceNo || ''}</strong><br/>
          Dated : <strong>${displayDate}</strong><br/>
          ${data.poNo ? `Buyer's Order No. : <strong>${data.poNo}</strong><br/>` : ''}
          ${data.transport ? `Dispatch through : <strong>${data.transport}</strong><br/>` : ''}
          ${data.vehicleNo ? `Vehicle No. : <strong>${data.vehicleNo}</strong>` : ''}
        </td>
      </tr>
    </table>

    <!-- Items Table -->
    <table style="width:100%; border-collapse:collapse; border:1px solid #000; margin-bottom:0;">
      <thead>
        <tr style="background-color:#E8E8E8;">
          <th style="border:1px solid #000; padding:5px; text-align:center; font-size:9pt; width:30px;">Sr.<br/>No.</th>
          <th style="border:1px solid #000; padding:5px; text-align:center; font-size:9pt;">Description of Goods / Services</th>
          <th style="border:1px solid #000; padding:5px; text-align:center; font-size:9pt; width:50px;">HSN/SAC</th>
          <th style="border:1px solid #000; padding:5px; text-align:center; font-size:9pt; width:40px;">Qty</th>
          <th style="border:1px solid #000; padding:5px; text-align:center; font-size:9pt; width:45px;">Unit</th>
          <th style="border:1px solid #000; padding:5px; text-align:right; font-size:9pt; width:65px;">Rate (₹)</th>
          <th style="border:1px solid #000; padding:5px; text-align:right; font-size:9pt; width:80px;">Amount (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${(data.items || []).map((item: any, idx: number) => `
          <tr>
            <td style="border:1px solid #000; padding:5px; text-align:center; font-size:9pt;">${idx + 1}</td>
            <td style="border:1px solid #000; padding:5px; font-size:9pt;">
              <strong>${item.title || ''}</strong>
              ${item.description ? `<div style="font-size:8.5pt; color:#444; margin-top:2px;">${item.description}</div>` : ''}
            </td>
            <td style="border:1px solid #000; padding:5px; text-align:center; font-size:9pt;">${item.hsn || '-'}</td>
            <td style="border:1px solid #000; padding:5px; text-align:center; font-size:9pt;">${item.qty || 1}</td>
            <td style="border:1px solid #000; padding:5px; text-align:center; font-size:9pt;">${item.unit || 'Nos'}</td>
            <td style="border:1px solid #000; padding:5px; text-align:right; font-size:9pt;">${(Number(item.rate) || 0).toLocaleString('en-IN')}</td>
            <td style="border:1px solid #000; padding:5px; text-align:right; font-size:9pt; font-family:monospace;">${fmt(item.amount)}</td>
          </tr>
        `).join('')}
        <tr>
          <td colspan="6" style="border:1px solid #000; border-right:none; text-align:right; font-weight:bold; font-size:9pt; padding:4px 8px;">Base Amount :</td>
          <td style="border:1px solid #000; text-align:right; font-weight:bold; font-size:9pt; padding:4px 8px; font-family:monospace;">${fmt(baseAmount)}</td>
        </tr>
        <tr>
          <td colspan="6" style="border:1px solid #000; border-right:none; text-align:right; font-size:9pt; padding:4px 8px;">Output SGST @${data.sgstPct || 0}% :</td>
          <td style="border:1px solid #000; text-align:right; font-size:9pt; padding:4px 8px; font-family:monospace;">${sgstAmt > 0 ? fmt(sgstAmt) : '-'}</td>
        </tr>
        <tr>
          <td colspan="6" style="border:1px solid #000; border-right:none; text-align:right; font-size:9pt; padding:4px 8px;">Output CGST @${data.cgstPct || 0}% :</td>
          <td style="border:1px solid #000; text-align:right; font-size:9pt; padding:4px 8px; font-family:monospace;">${cgstAmt > 0 ? fmt(cgstAmt) : '-'}</td>
        </tr>
        <tr style="background-color:#EEEEEE;">
          <td colspan="6" style="border:1px solid #000; border-right:none; text-align:right; font-weight:bold; font-size:10pt; padding:5px 8px;">Grand Total :</td>
          <td style="border:1px solid #000; text-align:right; font-weight:bold; font-size:10pt; padding:5px 8px; font-family:monospace;">₹ ${fmt(grandTotal)}</td>
        </tr>
      </tbody>
    </table>

    <!-- Bank Details -->
    <div style="border:1px solid #000; border-top:none; padding:8px 12px; margin-bottom:0;">
      <div style="font-size:9.5pt; font-weight:bold; text-decoration:underline; margin-bottom:4px;">BANK DETAILS</div>
      <div style="font-size:9pt; color:#222; line-height:1.5;">
        <span style="font-weight:bold; margin-right:20px;">Rudra Fire Protection</span>
        <span style="margin-right:20px;">Bank: State Bank Of India</span>
        <span style="margin-right:20px;">Account Number : 40698757999</span>
        <span>IFSC Code : SBIN0016719</span>
      </div>
    </div>

    <!-- Terms & Signature Block -->
    <table style="width:100%; border:1px solid #000; border-top:none; border-collapse:collapse;">
      <tr>
        <td style="width:60%; border:none; padding:8px 12px; font-size:8.5pt; color:#333;">
          <div style="font-weight:bold; text-decoration:underline; margin-bottom:3px;">Declaration :</div>
          We declare that this invoice shows the actual price of the goods/services described and that all particulars are true and correct.
        </td>
        <td style="width:40%; border:none; border-left:1px solid #000; padding:10px 14px; text-align:right;">
          <div style="font-size:9.5pt; font-weight:bold; margin-bottom:8px;">For, Rudra Fire Protection</div>
          ${data.includeSignature !== false && signatureBase64 ? `
            <div style="margin: 4px 0 4px auto; width: fit-content;">
              <img src="${signatureBase64}" height="40" alt="Signature" style="display:block;" />
            </div>
          ` : '<div style="height:35px;"></div>'}
          <div style="font-size:9.5pt; font-weight:bold;">Authorised Signatory</div>
        </td>
      </tr>
    </table>

    <!-- Footer -->
    <table style="width:100%; border:none; border-collapse:collapse; margin-top:20px; border-top:1px solid #999; padding-top:6px;">
      <tr>
        <td style="border:none; font-size:8pt; color:#444;">
          17 Navjeevan Vikas Society, Motilal Nagar, Goregaon West, Mumbai 400104 ☎ 7777088817<br/>
          www.rudrafireprotection.com
        </td>
        <td style="border:none; text-align:right; font-size:8pt; color:#666;">
          Page 1
        </td>
      </tr>
    </table>
    `;

    const safeInvoiceNo = data.invoiceNo ? data.invoiceNo.replace(/[^a-z0-9]/gi, '_') : 'invoice';
    const sanitizedName = data.companyName ? data.companyName.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'client';
    downloadDocFile(`${safeInvoiceNo}_${sanitizedName}`, html, `Invoice ${data.invoiceNo}`);
}

/**
 * Generate Word DOC for AMC Quotation
 */
export async function exportAMCQuoteToDoc(data: any) {
    const logoBase64 = await getLogoBase64();
    const signatureBase64 = await getSignatureBase64();

    const displayDate = data.date ? new Date(data.date).toLocaleDateString('en-IN') : '';

    const html = `
    <!-- Top Header -->
    <table style="width:100%; border:none; border-collapse:collapse; background-color:#FFF1F1; margin-bottom:15px;">
      <tr>
        <td style="padding:10px 15px; border:none; width:50%;">
          ${logoBase64 ? `<img src="${logoBase64}" width="160" style="display:block; margin-bottom:6px;" alt="Logo" />` : ''}
          <div style="color:#E3242B; font-size:9.5pt; font-weight:bold; font-style:italic;">
            Fire Prevention Is Better Than Fire Fighting.
          </div>
        </td>
        <td style="padding:10px 15px; border:none; width:50%; text-align:right;">
          <div style="font-size:11pt; font-weight:bold; color:#1a1a1a;">RUDRA FIRE PROTECTION</div>
          <div style="font-size:8.5pt; color:#444; margin-top:2px;">GSTIN : 27CECPD2175P1Z9</div>
          <div style="font-size:8.5pt; color:#444;">info@rudrafireprotection.com</div>
          <div style="color:#E3242B; font-size:18pt; font-weight:bold; margin-top:12px;">
            AMC QUOTATION ${data.quoteNo || ''}
          </div>
        </td>
      </tr>
    </table>

    <!-- Client Details -->
    <table style="width:100%; border:none; border-collapse:collapse; margin-bottom:12px;">
      <tr>
        <td style="border:none; width:65%; font-size:9pt; line-height:1.5;">
          <strong>To,</strong><br/>
          ${data.companyName ? `<strong>${data.companyName}</strong><br/>` : ''}
          ${data.street ? `${data.street},<br/>` : ''}
          ${data.location ? `${data.location},<br/>` : ''}
          ${[data.city, data.state, data.pin].filter(Boolean).join(' - ')}
          ${data.contactPerson ? `<br/>Kind Attn: ${data.contactPerson} (${data.contactNumber || ''})` : ''}
        </td>
        <td style="border:none; width:35%; text-align:right; font-size:9.5pt; color:#333;">
          Date : <strong>${displayDate}</strong>
        </td>
      </tr>
    </table>

    <!-- AMC Packages / Scope -->
    ${(data.packages || []).map((pkg: any) => `
      <div style="border:1px solid #000; padding:10px; margin-bottom:12px; background:#fafafa;">
        <div style="font-size:10pt; font-weight:bold; color:#E3242B; margin-bottom:4px;">${pkg.name || 'AMC Package'}</div>
        <div style="font-size:9pt; color:#444; margin-bottom:6px;">${pkg.description || ''}</div>
        <div style="font-size:9.5pt; font-weight:bold; text-align:right;">Fee: ₹ ${fmt(pkg.amount)}</div>
      </div>
    `).join('')}

    <!-- Total -->
    <table style="width:100%; border-collapse:collapse; border:1px solid #000; margin-bottom:10px;">
      <tr style="background:#eeeeee;">
        <td style="padding:6px 10px; font-size:10pt; font-weight:bold; text-align:right; width:75%;">Total AMC Value :</td>
        <td style="padding:6px 10px; font-size:10pt; font-weight:bold; text-align:right; font-family:monospace;">₹ ${fmt(data.totalAmount)}</td>
      </tr>
    </table>

    <!-- Terms -->
    <div style="border:1px solid #000; padding:8px 12px; margin-bottom:12px;">
      <div style="font-size:9.5pt; font-weight:bold; text-decoration:underline; margin-bottom:4px;">Terms &amp; Conditions :-</div>
      <ol style="margin:0; padding-left:18px; font-size:9pt; color:#222; line-height:1.4;">
        ${(data.terms || []).map((t: string) => `<li style="margin-bottom:2px;">${t}</li>`).join('')}
      </ol>
    </div>

    <!-- Signature Block -->
    <div style="padding:10px 14px; text-align:right;">
      <div style="font-size:9.5pt; font-weight:bold; margin-bottom:8px;">For, Rudra Fire Protection</div>
      ${signatureBase64 ? `
        <div style="margin: 4px 0 4px 5px;">
          <img src="${signatureBase64}" height="42" alt="Signature" style="display:block;" />
        </div>
      ` : '<div style="height:35px;"></div>'}
      <div style="font-size:9.5pt; font-weight:bold;">Authorised Signatory</div>
    </div>
    `;

    const safeQuoteNo = data.quoteNo ? data.quoteNo.replace(/[^a-z0-9]/gi, '_') : 'amc_quote';
    downloadDocFile(`${safeQuoteNo}`, html, `AMC Quotation ${data.quoteNo}`);
}

/**
 * Generate Word DOC for AMC Invoice
 */
export async function exportAMCInvoiceToDoc(data: any) {
    const logoBase64 = await getLogoBase64();
    const signatureBase64 = await getSignatureBase64();

    const displayDate = data.date ? new Date(data.date).toLocaleDateString('en-IN') : '';

    const html = `
    <!-- Top Header -->
    <table style="width:100%; border:none; border-collapse:collapse; background-color:#FFF1F1; margin-bottom:15px;">
      <tr>
        <td style="padding:10px 15px; border:none; width:50%;">
          ${logoBase64 ? `<img src="${logoBase64}" width="160" style="display:block; margin-bottom:6px;" alt="Logo" />` : ''}
          <div style="color:#E3242B; font-size:9.5pt; font-weight:bold; font-style:italic;">
            Fire Prevention Is Better Than Fire Fighting.
          </div>
        </td>
        <td style="padding:10px 15px; border:none; width:50%; text-align:right;">
          <div style="font-size:11pt; font-weight:bold; color:#1a1a1a;">RUDRA FIRE PROTECTION</div>
          <div style="font-size:8.5pt; color:#444; margin-top:2px;">GSTIN : 27CECPD2175P1Z9</div>
          <div style="font-size:8.5pt; color:#444;">info@rudrafireprotection.com</div>
          <div style="color:#E3242B; font-size:18pt; font-weight:bold; margin-top:12px;">
            AMC INVOICE
          </div>
        </td>
      </tr>
    </table>

    <!-- Client Details -->
    <table style="width:100%; border:none; border-collapse:collapse; margin-bottom:12px;">
      <tr>
        <td style="border:none; width:65%; font-size:9pt; line-height:1.5;">
          <strong>Buyer (Bill to) :</strong><br/>
          ${data.companyName ? `<strong>${data.companyName}</strong><br/>` : ''}
          ${data.street ? `${data.street},<br/>` : ''}
          ${data.location ? `${data.location},<br/>` : ''}
          ${[data.city, data.state, data.pin].filter(Boolean).join(' - ')}
          ${data.contactPerson ? `<br/>Attn: ${data.contactPerson} (${data.contactNumber || ''})` : ''}
        </td>
        <td style="border:none; width:35%; text-align:right; font-size:9.5pt; color:#333;">
          Date : <strong>${displayDate}</strong>
        </td>
      </tr>
    </table>

    <!-- Total -->
    <table style="width:100%; border-collapse:collapse; border:1px solid #000; margin-bottom:10px;">
      <tr style="background:#eeeeee;">
        <td style="padding:6px 10px; font-size:10pt; font-weight:bold; text-align:right; width:75%;">Total Amount Due :</td>
        <td style="padding:6px 10px; font-size:10pt; font-weight:bold; text-align:right; font-family:monospace;">₹ ${fmt(data.totalAmount)}</td>
      </tr>
    </table>

    <!-- Signature Block -->
    <div style="border:1px solid #000; padding:10px 14px;">
      <div style="font-size:9.5pt; font-weight:bold; margin-bottom:8px;">For, Rudra Fire Protection</div>
      ${signatureBase64 ? `
        <div style="margin: 4px 0 4px 5px;">
          <img src="${signatureBase64}" height="42" alt="Signature" style="display:block;" />
        </div>
      ` : '<div style="height:35px;"></div>'}
      <div style="font-size:9.5pt; font-weight:bold;">Authorised Signatory</div>
    </div>
    `;

    downloadDocFile(`amc_invoice_${displayDate.replace(/[^a-z0-9]/gi, '_')}`, html, 'AMC Invoice');
}

/**
 * Generate Word DOC for Professional Multi-Section Quotation (with BOQ, Summary, Terms, Makes)
 */
export async function exportProfessionalQuoteToDoc(quotation: any, summary: any) {
    const logoBase64 = await getLogoBase64();
    const signatureBase64 = await getSignatureBase64();

    const displayDate = quotation.date ? new Date(quotation.date).toLocaleDateString('en-IN') : '';

    const html = `
    <!-- ── PAGE 1: COVER LETTER ── -->
    <table style="width:100%; border:none; border-collapse:collapse; background-color:#FFF1F1; margin-bottom:20px;">
      <tr>
        <td style="padding:12px 18px; border:none; width:50%;">
          ${logoBase64 ? `<img src="${logoBase64}" width="160" style="display:block; margin-bottom:6px;" alt="Logo" />` : ''}
          <div style="color:#E3242B; font-size:9.5pt; font-weight:bold; font-style:italic;">
            Fire Prevention Is Better Than Fire Fighting.
          </div>
        </td>
        <td style="padding:12px 18px; border:none; width:50%; text-align:right;">
          <div style="font-size:12pt; font-weight:bold; color:#1a1a1a;">RUDRA FIRE PROTECTION</div>
          <div style="font-size:8.5pt; color:#444; margin-top:2px;">GSTIN : 27CECPD2175P1Z9</div>
          <div style="font-size:8.5pt; color:#444;">info@rudrafireprotection.com</div>
          <div style="color:#E3242B; font-size:18pt; font-weight:bold; margin-top:10px;">
            QUOTATION ${quotation.quotationNo || ''}
          </div>
        </td>
      </tr>
    </table>

    <table style="width:100%; border:none; border-collapse:collapse; margin-bottom:15px;">
      <tr>
        <td style="border:none; width:65%; font-size:9.5pt; line-height:1.5;">
          <strong>To,</strong><br/>
          ${quotation.toTitle ? `${quotation.toTitle}<br/>` : ''}
          ${quotation.companyName ? `<strong>${quotation.companyName}</strong><br/>` : ''}
          ${quotation.projectLocation ? `${quotation.projectLocation}<br/>` : ''}
          ${quotation.kindAttn ? `Kind Attn : <strong>${quotation.kindAttn}</strong><br/>` : ''}
          ${quotation.contactNumber ? `Contact : ${quotation.contactNumber}<br/>` : ''}
        </td>
        <td style="border:none; width:35%; text-align:right; font-size:9.5pt; color:#333;">
          Date : <strong>${displayDate}</strong>
        </td>
      </tr>
    </table>

    <div style="font-size:10pt; line-height:1.6; margin-bottom:20px;">
      <p><strong>Sub :</strong> Proposal for ${quotation.subject || 'Fire Fighting System Works'}</p>
      <p>Dear Sir / Madam,</p>
      <p>We thank you for giving us the opportunity to quote for the fire protection work at your prestigious site. We are pleased to submit our most competitive techno-commercial offer as detailed in the attached Bill of Quantities (BOQ), Summary Sheet, Approved Makes list, and Terms &amp; Conditions.</p>
      <p>We assure you of our best engineering practices, strict quality standards, and prompt after-sales service at all times.</p>
    </div>

    <!-- Signature -->
    <div style="border:1px solid #000; padding:10px 14px; width:280px; margin-top:25px;">
      <div style="font-size:9.5pt; font-weight:bold; margin-bottom:8px;">For, Rudra Fire Protection</div>
      ${signatureBase64 ? `
        <div style="margin: 4px 0 4px 5px;">
          <img src="${signatureBase64}" height="42" alt="Signature" style="display:block;" />
        </div>
      ` : '<div style="height:35px;"></div>'}
      <div style="font-size:9.5pt; font-weight:bold;">Authorised Signatory</div>
    </div>

    <!-- ── PAGE 2: SUMMARY SHEET ── -->
    <div class="page-break" style="page-break-before:always; mso-break-type:section-break; margin-top:30px;"></div>

    <div style="font-size:13pt; font-weight:bold; color:#E3242B; border-bottom:2px solid #E3242B; padding-bottom:4px; margin-bottom:12px;">
      SUMMARY OF WORK (ABSTRACT SHEET)
    </div>

    <table style="width:100%; border-collapse:collapse; border:1px solid #000; margin-bottom:20px;">
      <thead>
        <tr style="background:#E8E8E8;">
          <th style="border:1px solid #000; padding:6px; font-size:9.5pt; text-align:center; width:40px;">Sr.</th>
          <th style="border:1px solid #000; padding:6px; font-size:9.5pt; text-align:left;">Section Name</th>
          <th style="border:1px solid #000; padding:6px; font-size:9.5pt; text-align:right; width:130px;">Amount (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${(summary?.sectionTotals || []).map((sec: any, idx: number) => `
          <tr>
            <td style="border:1px solid #000; padding:6px; text-align:center; font-size:9.5pt;">${idx + 1}</td>
            <td style="border:1px solid #000; padding:6px; font-size:9.5pt; font-weight:bold;">${sec.name}</td>
            <td style="border:1px solid #000; padding:6px; text-align:right; font-size:9.5pt; font-family:monospace;">${fmt(sec.total)}</td>
          </tr>
        `).join('')}
        <tr>
          <td colspan="2" style="border:1px solid #000; text-align:right; font-weight:bold; padding:6px 10px; font-size:9.5pt;">Base Total :</td>
          <td style="border:1px solid #000; text-align:right; font-weight:bold; padding:6px 10px; font-size:9.5pt; font-family:monospace;">${fmt(summary?.subtotal || 0)}</td>
        </tr>
        ${summary?.tax > 0 ? `
          <tr>
            <td colspan="2" style="border:1px solid #000; text-align:right; padding:6px 10px; font-size:9.5pt;">GST (Tax) :</td>
            <td style="border:1px solid #000; text-align:right; padding:6px 10px; font-size:9.5pt; font-family:monospace;">${fmt(summary.tax)}</td>
          </tr>
        ` : ''}
        <tr style="background:#EEEEEE;">
          <td colspan="2" style="border:1px solid #000; text-align:right; font-weight:bold; padding:8px 10px; font-size:10.5pt;">Grand Total :</td>
          <td style="border:1px solid #000; text-align:right; font-weight:bold; padding:8px 10px; font-size:10.5pt; font-family:monospace;">₹ ${fmt(summary?.grandTotal || summary?.subtotal || 0)}</td>
        </tr>
      </tbody>
    </table>

    <!-- ── PAGE 3+: BOQ SECTIONS ── -->
    ${(quotation.sections || []).map((sec: any) => `
      <div class="page-break" style="page-break-before:always; mso-break-type:section-break; margin-top:25px;"></div>
      <div style="font-size:12pt; font-weight:bold; color:#1a1a1a; margin-bottom:8px; border-bottom:1.5px solid #ccc; padding-bottom:3px;">
        SECTION: ${sec.name}
      </div>
      <table style="width:100%; border-collapse:collapse; border:1px solid #000; margin-bottom:15px;">
        <thead>
          <tr style="background:#F3F4F6;">
            <th style="border:1px solid #000; padding:5px; font-size:9pt; width:30px; text-align:center;">Sr.</th>
            <th style="border:1px solid #000; padding:5px; font-size:9pt; text-align:left;">Item &amp; Specifications</th>
            <th style="border:1px solid #000; padding:5px; font-size:9pt; width:45px; text-align:center;">Qty</th>
            <th style="border:1px solid #000; padding:5px; font-size:9pt; width:45px; text-align:center;">Unit</th>
            <th style="border:1px solid #000; padding:5px; font-size:9pt; width:70px; text-align:right;">Rate (₹)</th>
            <th style="border:1px solid #000; padding:5px; font-size:9pt; width:85px; text-align:right;">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${(sec.items || []).map((it: any, iIdx: number) => `
            <tr>
              <td style="border:1px solid #000; padding:5px; font-size:9pt; text-align:center;">${iIdx + 1}</td>
              <td style="border:1px solid #000; padding:5px; font-size:9pt;">
                <strong>${it.title || ''}</strong>
                ${it.description ? `<div style="font-size:8.5pt; color:#444; margin-top:2px;">${it.description}</div>` : ''}
              </td>
              <td style="border:1px solid #000; padding:5px; font-size:9pt; text-align:center;">${it.qty || 1}</td>
              <td style="border:1px solid #000; padding:5px; font-size:9pt; text-align:center;">${it.unit || 'Nos'}</td>
              <td style="border:1px solid #000; padding:5px; font-size:9pt; text-align:right;">${(Number(it.rate) || 0).toLocaleString('en-IN')}</td>
              <td style="border:1px solid #000; padding:5px; font-size:9pt; text-align:right; font-family:monospace;">${fmt((Number(it.qty) || 0) * (Number(it.rate) || 0))}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `).join('')}

    <!-- ── TERMS & CONDITIONS ── -->
    ${quotation.termsConfig?.items?.length ? `
      <div class="page-break" style="page-break-before:always; mso-break-type:section-break; margin-top:25px;"></div>
      <div style="font-size:12pt; font-weight:bold; color:#1a1a1a; margin-bottom:8px; border-bottom:1.5px solid #ccc; padding-bottom:3px;">
        COMMERCIAL TERMS &amp; CONDITIONS
      </div>
      <ol style="margin:0; padding-left:20px; font-size:9.5pt; line-height:1.5; color:#222;">
        ${quotation.termsConfig.items.map((t: any) => `
          <li style="margin-bottom:6px;">
            <strong>${t.title ? `${t.title}: ` : ''}</strong>${t.content || t}
          </li>
        `).join('')}
      </ol>
    ` : ''}
    `;

    const safeQuoteNo = quotation.quotationNo ? quotation.quotationNo.replace(/[^a-z0-9]/gi, '_') : 'pro_quote';
    const sanitizedName = quotation.companyName ? quotation.companyName.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'project';
    downloadDocFile(`${safeQuoteNo}_${sanitizedName}`, html, `Quotation ${quotation.quotationNo}`);
}

/**
 * Export Work Order to Microsoft Word (.doc) format
 */
export async function exportWorkOrderToDoc(data: any) {
    const logoBase64 = await getLogoBase64();
    const signatureBase64 = await getSignatureBase64();
    const displayDate = data.wo_date ? data.wo_date.split('-').reverse().join('-') : new Date().toLocaleDateString('en-IN');
    const fmt = (n: number) => Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const html = `
    <!-- Top Header (Same as Quotation) -->
    <table style="width:100%; border:none; border-collapse:collapse; background-color:#FFF1F1; margin-bottom:15px;">
      <tr>
        <td style="padding:10px 15px; border:none; width:50%;">
          ${logoBase64 ? `<img src="${logoBase64}" width="160" style="display:block; margin-bottom:6px;" alt="Logo" />` : ''}
          <div style="color:#E3242B; font-size:9.5pt; font-weight:bold; font-style:italic;">
            Fire Prevention Is Better Than Fire Fighting.
          </div>
        </td>
        <td style="padding:10px 15px; border:none; width:50%; text-align:right;">
          <div style="font-size:11pt; font-weight:bold; color:#1a1a1a;">RUDRA FIRE PROTECTION</div>
          <div style="font-size:8.5pt; color:#444; margin-top:2px;">GSTIN : 27CECPD2175P1Z9</div>
          <div style="font-size:8.5pt; color:#444;">info@rudrafireprotection.com</div>
          <div style="color:#E3242B; font-size:18pt; font-weight:bold; margin-top:12px;">
            WORK ORDER ${data.wo_number || ''}
          </div>
        </td>
      </tr>
    </table>

    <!-- Client & Contractor Info (Issued By / Issued To) -->
    <table style="width:100%; border:1px solid #ccc; border-collapse:collapse; margin-bottom:15px;">
      <tr style="background:#f8f9fa;">
        <th style="width:50%; border:1px solid #ccc; padding:6px 10px; font-size:9pt; text-align:left; color:#E3242B; font-weight:bold;">ISSUED BY (CLIENT)</th>
        <th style="width:50%; border:1px solid #ccc; padding:6px 10px; font-size:9pt; text-align:left; color:#E3242B; font-weight:bold;">ISSUED TO (CONTRACTOR)</th>
      </tr>
      <tr>
        <td style="border:1px solid #ccc; padding:8px 10px; font-size:9pt; vertical-align:top; line-height:1.4;">
          <strong>${data.client_name || ''}</strong><br/>
          ${data.contact_person ? `Attn: ${data.contact_person}<br/>` : ''}
          ${[data.site_street, data.site_location].filter(Boolean).join(', ')}<br/>
          ${[data.site_city, data.site_state, data.site_pin].filter(Boolean).join(', ')}<br/>
          ${data.client_phone ? `Phone: ${data.client_phone}<br/>` : ''}
          ${data.client_gst ? `GSTIN: ${data.client_gst}` : ''}
        </td>
        <td style="border:1px solid #ccc; padding:8px 10px; font-size:9pt; vertical-align:top; line-height:1.4;">
          <strong>RUDRA FIRE PROTECTION SERVICES</strong><br/>
          17 Navjeevan Vikas Society, Motilal Nagar, Goregaon West<br/>
          Mumbai, Maharashtra - 400104<br/>
          Phone: 7777088817 / 9769388165<br/>
          GSTIN: 27CECPD2175P1Z9
          ${(data.site_name || data.site_location) ? `<br/><strong>Project Site:</strong> ${[data.site_name, data.site_location, data.site_city].filter(Boolean).join(', ')}` : ''}
        </td>
      </tr>
    </table>

    <!-- BOQ / Items Table -->
    <table style="width:100%; border-collapse:collapse; border:1px solid #000; margin-bottom:12px;">
      <thead>
        <tr style="background:#f3f4f6;">
          <th style="border:1px solid #000; padding:6px; font-size:8.5pt; width:30px; text-align:center;">#</th>
          <th style="border:1px solid #000; padding:6px; font-size:8.5pt; text-align:left;">Item &amp; Description of Work</th>
          <th style="border:1px solid #000; padding:6px; font-size:8.5pt; width:45px; text-align:center;">Qty</th>
          <th style="border:1px solid #000; padding:6px; font-size:8.5pt; width:45px; text-align:center;">Unit</th>
          <th style="border:1px solid #000; padding:6px; font-size:8.5pt; width:75px; text-align:right;">Rate (₹)</th>
          <th style="border:1px solid #000; padding:6px; font-size:8.5pt; width:85px; text-align:right;">Amount (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${(data.items || []).map((it: any, idx: number) => `
          <tr>
            <td style="border:1px solid #000; padding:5px; font-size:8.5pt; text-align:center;">${it.item_no || idx + 1}</td>
            <td style="border:1px solid #000; padding:5px; font-size:8.5pt;">
              ${it.title ? `<strong>${it.title}</strong><br/>` : ''}
              ${it.description || ''}
            </td>
            <td style="border:1px solid #000; padding:5px; font-size:8.5pt; text-align:center;">${it.quantity}</td>
            <td style="border:1px solid #000; padding:5px; font-size:8.5pt; text-align:center;">${it.unit || 'Nos'}</td>
            <td style="border:1px solid #000; padding:5px; font-size:8.5pt; text-align:right; font-family:monospace;">₹ ${fmt(it.unit_price)}</td>
            <td style="border:1px solid #000; padding:5px; font-size:8.5pt; text-align:right; font-family:monospace; font-weight:bold;">₹ ${fmt(it.total)}</td>
          </tr>
        `).join('')}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="5" style="border:1px solid #000; padding:5px 8px; font-size:8.5pt; text-align:right; font-weight:bold;">Subtotal:</td>
          <td style="border:1px solid #000; padding:5px 8px; font-size:8.5pt; text-align:right; font-family:monospace; font-weight:bold;">₹ ${fmt(data.subtotal)}</td>
        </tr>
        <tr>
          <td colspan="5" style="border:1px solid #000; padding:5px 8px; font-size:8.5pt; text-align:right; font-weight:bold;">GST (${data.tax_rate || 18}%):</td>
          <td style="border:1px solid #000; padding:5px 8px; font-size:8.5pt; text-align:right; font-family:monospace;">₹ ${fmt(data.tax_total)}</td>
        </tr>
        <tr style="background:#fee2e2;">
          <td colspan="5" style="border:1px solid #000; padding:6px 8px; font-size:9.5pt; text-align:right; font-weight:bold; color:#991b1b;">Grand Total:</td>
          <td style="border:1px solid #000; padding:6px 8px; font-size:9.5pt; text-align:right; font-family:monospace; font-weight:bold; color:#991b1b;">₹ ${fmt(data.grand_total)}</td>
        </tr>
      </tfoot>
    </table>

    <!-- Terms & Conditions -->
    ${(data.terms && data.terms.length > 0) ? `
      <div style="border:1px solid #ccc; padding:8px 12px; margin-bottom:15px; font-size:8.5pt;">
        <div style="font-weight:bold; color:#1a1a1a; margin-bottom:6px; text-decoration:underline;">Commercial Terms &amp; Conditions:</div>
        <div style="margin:0; padding-left:2px; line-height:1.45;">
          ${data.terms.map((t: string, i: number) => {
            const cleanText = t.replace(/^\d+[\.\)\-]\s*/, '').replace(/\n/g, '<br/>');
            return `<div style="margin-bottom:3.5px; display:flex;">
              <span style="font-weight:bold; min-width:18px;">${i + 1}.</span>
              <span>${cleanText}</span>
            </div>`;
          }).join('')}
        </div>
      </div>
    ` : ''}

    <!-- Dual Signature & Stamp Block (Borderless & Compact) -->
    <table style="width:100%; border:none; border-collapse:collapse; margin-top:8px;">
      <tr>
        <td style="width:50%; border:none; padding:0 12px 2px 0; vertical-align:bottom;">
          <div style="font-weight:bold; font-size:9pt; text-transform:uppercase; color:#0f172a;">For ${data.client_name || 'Client Name'}</div>
        </td>
        <td style="width:50%; border:none; padding:0 0 2px 12px; vertical-align:bottom;">
          <div style="font-weight:bold; font-size:9pt; text-transform:uppercase; color:#0f172a;">For Rudra Fire Protection Services</div>
        </td>
      </tr>
      <tr>
        <td style="width:50%; border:none; padding:0 12px 0 0; height:26px; vertical-align:bottom;">
          <div style="height:24px; font-size:8pt; color:#888; font-style:italic;">(Client Stamp &amp; Signature)</div>
        </td>
        <td style="width:50%; border:none; padding:0 0 0 12px; height:26px; vertical-align:bottom;">
          ${signatureBase64 ? `
            <div style="height:24px;">
              <img src="${signatureBase64}" height="24" alt="Signature" style="display:block;" />
            </div>
          ` : '<div style="height:24px;"></div>'}
        </td>
      </tr>
      <tr>
        <td style="width:50%; border:none; padding:0 12px 0 0; vertical-align:top;">
          <div style="border-top:1.5px solid #000; padding-top:3px; font-size:9pt; font-weight:bold;">
            Authorized Signatory with Official Stamp
          </div>
          <div style="font-size:8pt; color:#666; margin-top:2px;">Date: ________________________</div>
        </td>
        <td style="width:50%; border:none; padding:0 0 0 12px; vertical-align:top;">
          <div style="border-top:1.5px solid #000; padding-top:3px; font-size:9pt; font-weight:bold;">
            Authorized Signatory &amp; Stamp
          </div>
          <div style="font-size:8pt; color:#666; margin-top:2px;">Date: ${displayDate} | Place: Mumbai</div>
        </td>
      </tr>
    </table>

    <!-- Visual Footer -->
    <table style="width:100%; border:none; border-collapse:collapse; margin-top:24px; border-top:1px solid #999; padding-top:6px;">
      <tr>
        <td style="border:none; font-size:8pt; color:#444;">
          17 Navjeevan Vikas Society, Motilal Nagar, Goregaon West, Mumbai 400104 ☎ 7777088817
        </td>
        <td style="border:none; text-align:right; font-size:8pt; color:#666;">
          www.rudrafireprotection.com
        </td>
      </tr>
    </table>
    `;

    const safeWoNo = data.wo_number ? data.wo_number.replace(/[^a-z0-9]/gi, '_') : 'work_order';
    const sanitizedName = data.client_name ? data.client_name.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'client';
    downloadDocFile(`${safeWoNo}_${sanitizedName}`, html, `Work Order ${data.wo_number}`);
}
