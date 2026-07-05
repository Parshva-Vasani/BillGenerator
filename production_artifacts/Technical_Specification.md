# Horticultural Invoicing Web App - Technical Specification

## 1. System Architecture
- **Frontend**: React Single Page Application (SPA) using Vite.
- **Styling**: Tailwind CSS for responsive and fast styling, Framer Motion for micro-animations.
- **PDF Generation**: `react-to-pdf` configured with a high-resolution scale of 3.0 on a fixed off-screen virtual container (width locked to A4 standard: 794px at 96 DPI) to avoid canvas cutting and broken glyph scaling for Devanagari and Gujarati.
- **Backend**: Python (FastAPI) for API endpoints, using Pandas and NumPy for validation/computation.
- **Database**: PostgreSQL hosted on a free-tier service (Neon or Supabase).

## 2. Core Workflows
### 2.1 Onboarding & Authentication
- **Onboarding UI**: Upon first launch, force capture of user profile parameters:
  - Farm Name
  - Place/Area
  - Mobile No.
  (Cannot access invoice entry without these).
- **Session Validation**: 
  - Passwordless authentication.
  - Local token storage with a sliding Time-To-Live (TTL) of 30 days.
  - Transparent re-authentication on relaunch unless idle for > 30 days.

### 2.2 Invoice Generation
- **Header Structure**:
  - Line 1: Farm Name (Bold Uppercase)
  - Line 2: Place/Area
  - Line 3: Mobile Phone Number (with phone icon)
- **Invoice Metadata**:
  - Invoice Number (Auto-incremented)
  - Invoice Date (Current date, modifiable)
  - State
  - Reverse Charge (Yes/No)
- **Receiver Details**:
  - Name (e.g., UMARBHAI)
  - GSTIN
- **Invoice Table Data Entry**:
  - Columns: Sr. No., Name of Product, CERET, VAGAN, QTY, Rate, Total
  - **Single-Fruit Validation Constraint**: Row 1 specifies the product name (e.g., "Dragon A"). Subsequent rows automatically copy and lock the name, allowing changes only to Grade, Crates, Weight, Rate. Multiple distinct fruits are blocked per invoice.
  - **Computational Math**: 
    - Quantity = Ceret * Vagan
    - Total = Quantity * Rate
    - Rounding: Quantities to 3 decimal places, amounts (₹) to 2 decimal places.
- **Invoice Footer**:
  - Total Quantity and Final Amount sum.
  - Final Invoice Amount and Balance Due.
  - Total Invoice Amount in words (Indian Number System - Thousand, Lakh, Crore).
  - Multilingual Translation Support: English ("Rupees Only"), Hindi ("रुपये केवल"), Gujarati ("રૂપિયા માત્ર").
- **Terms & Conditions**: Standard footer terms (Electronically generated, seller city jurisdiction).
- **Signature Box**: "Certified that the particular given above are true and correct. For, [FARM NAME], Authorised Signatory."

## 3. Database Schema (PostgreSQL)
- **Users (Farm Profiles)**: 
  - ID, FarmName, Place, MobileNo, CreatedAt, LastActive
- **Invoices**: 
  - ID, UserID, InvoiceNumber, InvoiceDate, State, ReverseCharge, ReceiverName, ReceiverGSTIN, TotalAmount, BalanceDue, CreatedAt
- **InvoiceItems**: 
  - ID, InvoiceID, SrNo, ProductName, Ceret, Vagan, Qty, Rate, TotalPrice

## 4. Deployment Strategy
- **Frontend**: Deployed to Vercel (Free Tier).
- **Backend**: Deployed to Render (Free Tier).
- **Database**: Neon Serverless PostgreSQL.
