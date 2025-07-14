# LFI Sanction Letter Template Placeholders

This document explains how to prepare the DOCX template (`LoanForIndia_InPrinciple_Sanction_Letter[2].docx`) for dynamic data replacement.

## How It Works

The system uses:
1. **Docxtemplater** - Replaces placeholders in the DOCX template with actual user data
2. **LibreOffice Convert** - Converts the filled DOCX to PDF (maintains exact formatting)

## Template Placeholders

Replace the static text in your DOCX template with these placeholders (including curly braces):

### Basic Information
- `{date}` - Current date (e.g., "15 Jan 2024")
- `{refNo}` - Reference number (e.g., "LFI/2024/000123")

### Applicant Details
- `{applicantName}` - Full applicant name (for address section)
- `{address}` - Complete address with line breaks
- `{salutation}` - Mr./Ms. based on gender
- `{applicantLastName}` - Last name (for greeting)
- `{applicantFullName}` - Full name (for loan details table)

### Loan Details
- `{coApplicantName}` - Co-applicant name or "N/A"
- `{loanAmount}` - Loan amount with Indian formatting (e.g., "50,00,000")
- `{loanAmountWords}` - Amount in words (e.g., "Fifty Lakh Only")
- `{propertyAddress}` - Property address or "To be finalized"
- `{tenure}` - Loan tenure in years (e.g., 20)
- `{interestRate}` - Interest rate (e.g., "8.50% p.a. (floating)")
- `{emi}` - EMI amount with formatting (e.g., "45,000")

## Example Usage in Template

```
Date: {date}
Sanction Reference No.: {refNo}

To,
{applicantName}
{address}

Subject: In-Principle Sanction for Home Loan

Dear {salutation} {applicantLastName},

...

1. Loan Details
Applicant Name: {applicantFullName}
Co-Applicant(s): {coApplicantName}
Loan Amount Sanctioned: ₹ {loanAmount} (Rupees {loanAmountWords})
Property Address (Proposed): {propertyAddress}
Tenure: {tenure} years
Rate of Interest: {interestRate}
EMI: ₹ {emi} (subject to change)
```

## Setup Instructions

1. **Open the DOCX template** in Microsoft Word
2. **Use Find & Replace** (Ctrl+H) to replace each placeholder:
   - Find: `[Insert Date]` → Replace: `{date}`
   - Find: `[Ref No]` → Replace: `{refNo}`
   - Find: `[Applicant Name]` → Replace: `{applicantName}`
   - And so on for all placeholders...
3. **Save the template** after making all replacements

## Data Types & Examples

| Placeholder | Type | Example Value |
|-------------|------|---------------|
| `{date}` | String | "15 Jan 2024" |
| `{refNo}` | String | "LFI/2024/000123" |
| `{applicantName}` | String | "John Doe Smith" |
| `{address}` | String | "123 Main Street\nMumbai, Maharashtra - 400001" |
| `{salutation}` | String | "Mr." or "Ms." |
| `{applicantLastName}` | String | "Smith" |
| `{applicantFullName}` | String | "John Doe Smith" |
| `{coApplicantName}` | String | "Jane Smith" or "N/A" |
| `{loanAmount}` | String | "50,00,000" |
| `{loanAmountWords}` | String | "Fifty Lakh Only" |
| `{propertyAddress}` | String | "Plot 456, Sector 7, Pune" |
| `{tenure}` | Number | 20 |
| `{interestRate}` | String | "8.50% p.a. (floating)" |
| `{emi}` | String | "45,000" |

## Benefits of LibreOffice Conversion

- **Exact formatting** preserved from Word template
- **Professional appearance** identical to Word-generated PDFs
- **Font rendering** matches original document
- **Table layouts** and spacing maintained perfectly
- **No HTML conversion artifacts** that can occur with other methods

## Troubleshooting

If PDF generation fails:
1. Ensure LibreOffice is installed on the server
2. Check that all placeholders in template match exactly (including curly braces)
3. Verify template file path is correct
4. Check server logs for specific error messages 