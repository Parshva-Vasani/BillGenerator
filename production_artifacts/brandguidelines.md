# Horticultural Invoicing Web App - Brand Guidelines

## 1. Visual Aesthetics
- **Theme**: Clean, professional, and trustworthy, suitable for B2B agricultural transactions.
- **Color Palette**:
  - **Primary**: Light Blue / Ice Blue (#DBEAFE to #BFDBFE) - Used for header backgrounds, section dividers, and table headers. Matches the provided visual invoice layout.
  - **Secondary**: Crisp White (#FFFFFF) - Document background.
  - **Text Colors**: Pure Black (#000000) for all text and data to ensure maximum contrast and print legibility. 
  - **Accents**: Solid Black (#000000) for thick section divider borders and table grid lines.
- **Typography**: 
  - Modern, highly legible sans-serif font (e.g., *Inter*, *Roboto*, or *Helvetica Neue*).
  - High-resolution rendering is prioritized, especially for multilingual scripts (Devanagari, Gujarati).
  - Farm Name must always be Bold Uppercase.

## 2. Layout & Typography Rules (Invoice Document)
- **Header**: Centered alignment.
  - Farm Name: 16pt - 18pt, Bold, Uppercase.
  - Address: 11pt - 12pt, Regular.
  - Phone: 11pt - 12pt, Regular, must include a standard phone icon (📞).
  - Top edge notice: Italicized, small font (e.g. "A Thank-you for doing business with us").
- **Title Banner**: "TAX INVOICE" centered in a light blue background banner. Right-aligned "Original For Recipient".
- **Sections**: Strong, thick horizontal black lines separate the Header, Invoice Metadata, Receiver Details, and the Line Items Table.
- **Table Structure**:
  - Headers: Bold, centered, light blue background.
  - Rows: Crisp white background. Clear, solid black vertical and horizontal borders for all cells.
  - Typography in table: 10pt - 11pt, Regular, center-aligned for numbers, left-aligned for product names.
- **Footer Blocks**:
  - Totals: Bolded values in the bottom right.
  - Amount in words: Left aligned in a dedicated block.
  - Terms & Conditions: Left aligned box in the bottom left.
  - Signature Box: Right aligned box in the bottom right, with "Certified that the particular given above are true and correct" and "For, [FARM NAME]" in Bold.

## 3. Application UI/UX (Web App)
- **Forms**: Clean inputs matching the structured grid layout of the invoice itself.
- **Animations**: Use Framer Motion for subtle micro-animations (e.g., row addition transitions, hover states on action buttons) to make data entry feel modern and responsive.
- **Responsiveness**: The data-entry UI must be fully responsive (mobile/tablet friendly) with a "Preview" section that renders the exact A4 layout. The final generated PDF maintains a rigid A4 structure (794px width).
- **Accessibility**: High contrast ratios, clear error states (especially for the Single-Fruit validation rule when entering multiple lines).
