import { useState, useRef, useEffect } from 'react';
import { Phone, Trash2, ArrowLeft, Send, Download, Save } from 'lucide-react';
import { UserProfile, getInvoiceById } from '../lib/db';
import { translateNumberToIndianWords } from '../utils/numberToWords';
import { saveInvoice, InvoiceRecord } from '../lib/db';
import { useNavigate, useParams } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { motion } from 'framer-motion';

interface InvoiceFormProps {
  profile: UserProfile;
}

interface LineItem {
  id: string;
  srNo: number;
  productName: string;
  ceret: number;
  vagan: number;
  qty: number;
  rate: number;
  total: number;
}

const translations = {
  en: {
    thanks: 'A Thank-you for doing business with us',
    taxInvoice: 'TAX INVOICE',
    originalForRec: 'Original For Recipient',
    invNum: 'Invoice Number',
    invDate: 'Invoice Date',
    state: 'State',
    revCharge: 'Reverse Charge',
    detailsRec: 'Details of Receiver | Billed to',
    name: 'Name:',
    gstin: 'GSTIN:',
    srNo: 'Sr. No.',
    prodName: 'Name of Product',
    ceret: 'CERET',
    vagan: 'VAGAN',
    qty: 'QTY',
    rate: 'Rate',
    total: 'Total',
    totInvWords: 'Total Invoice Amount in words',
    finalInvAmt: 'Final Invoice Amount',
    balanceDue: 'Balance Due',
    terms: 'Terms And Conditions',
    t1: '1. This is an electronically generated document.',
    t2: '2. All disputes are subject to seller city jurisdiction.',
    cert: 'Certified that the particular given above are true and correct',
    for: 'For,',
    authSig: 'Authorised Signatory'
  },
  hi: {
    thanks: 'हमारे साथ व्यापार करने के लिए धन्यवाद',
    taxInvoice: 'टैक्स इनवॉइस',
    originalForRec: 'प्राप्तकर्ता के लिए मूल',
    invNum: 'इनवॉइस नंबर',
    invDate: 'इनवॉइस दिनांक',
    state: 'राज्य',
    revCharge: 'रिवर्स चार्ज',
    detailsRec: 'प्राप्तकर्ता का विवरण | बिल भेजा गया',
    name: 'नाम:',
    gstin: 'जीएसटीिन:',
    srNo: 'क्र. सं.',
    prodName: 'उत्पाद का नाम',
    ceret: 'कैरेट',
    vagan: 'वजन',
    qty: 'मात्रा',
    rate: 'दर',
    total: 'कुल',
    totInvWords: 'कुल इनवॉइस राशि शब्दों में',
    finalInvAmt: 'अंतिम इनवॉइस राशि',
    balanceDue: 'बकाया राशि',
    terms: 'नियम और शर्तें',
    t1: '1. यह इलेक्ट्रॉनिक रूप से जनरेट किया गया दस्तावेज़ है।',
    t2: '2. सभी विवाद विक्रेता शहर के अधिकार क्षेत्र के अधीन हैं।',
    cert: 'प्रमाणित किया जाता है कि ऊपर दिए गए विवरण सत्य और सही हैं',
    for: 'के लिए,',
    authSig: 'अधिकृत हस्ताक्षरकर्ता'
  },
  gu: {
    thanks: 'અમારી સાથે વ્યાપાર કરવા બદલ આભાર',
    taxInvoice: 'ટેક્સ ઇન્વોઇસ',
    originalForRec: 'પ્રાપ્તકર્તા માટે અસલ',
    invNum: 'ઇન્વોઇસ નંબર',
    invDate: 'ઇન્વોઇસ તારીખ',
    state: 'રાજ્ય',
    revCharge: 'રિવર્સ ચાર્જ',
    detailsRec: 'પ્રાપ્તકર્તાની વિગતો | બિલ મેળવનાર',
    name: 'નામ:',
    gstin: 'જીએસટીન:',
    srNo: 'ક્ર. નં.',
    prodName: 'ઉત્પાદનનું નામ',
    ceret: 'કેરેટ',
    vagan: 'વજન',
    qty: 'જથ્થો',
    rate: 'દર',
    total: 'કુલ',
    totInvWords: 'કુલ ઇન્વોઇસ રકમ શબ્દોમાં',
    finalInvAmt: 'અંતિમ ઇન્વોઇસ રકમ',
    balanceDue: 'બાકી રકમ',
    terms: 'નિયમો અને શરતો',
    t1: '1. આ ઇલેક્ટ્રોનિકલી જનરેટ થયેલો દસ્તાવેજ છે.',
    t2: '2. તમામ વિવાદો વિક્રેતાના શહેરના અધિકારક્ષેત્રને આધીન છે.',
    cert: 'પ્રમાણિત કરવામાં આવે છે કે ઉપર આપેલી વિગતો સાચી છે',
    for: 'માટે,',
    authSig: 'અધિકૃત સહી કરનાર'
  }
};

export default function InvoiceForm({ profile }: InvoiceFormProps) {
  const { id } = useParams<{id?: string}>();
  const targetRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [invoiceId, setInvoiceId] = useState<string>(Math.random().toString(36).substr(2, 9));
  const [invoiceMetadata, setInvoiceMetadata] = useState({
    invoiceNumber: Math.floor(Math.random() * 1000).toString(),
    invoiceDate: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
    state: 'Gujarat',
    reverseCharge: 'NO',
    receiverName: '',
    gstin: 'URP'
  });

  const [items, setItems] = useState<LineItem[]>([
    { id: '1', srNo: 1, productName: 'Dragon Fruit', ceret: 0, vagan: 0, qty: 0, rate: 0, total: 0 }
  ]);
  
  const [locale, setLocale] = useState<'en'|'hi'|'gu'>('en');
  const [isSaving, setIsSaving] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf'|'jpg'>('pdf');
  const t = translations[locale];

  useEffect(() => {
    if (id) {
      loadExistingInvoice(id);
    }
  }, [id]);

  const loadExistingInvoice = async (existingId: string) => {
    const data = await getInvoiceById(existingId);
    if (data) {
      setInvoiceId(data.id);
      setInvoiceMetadata({
        invoiceNumber: data.invoiceNumber,
        invoiceDate: data.date,
        state: 'Gujarat',
        reverseCharge: 'NO',
        receiverName: data.receiverName,
        gstin: 'URP'
      });
      setItems(data.items);
    }
  };

  const updateItem = (index: number, field: keyof LineItem, value: any) => {
    const newItems = [...items];
    const item = newItems[index];
    (item as any)[field] = value;

    if (['ceret', 'vagan', 'rate'].includes(field)) {
      item.qty = Number((item.ceret * item.vagan).toFixed(3));
      item.total = Number((item.qty * item.rate).toFixed(2));
    }
    setItems(newItems);
  };

  const addRow = () => {
    setItems([
      ...items,
      {
        id: Math.random().toString(36).substr(2, 9),
        srNo: items.length + 1,
        productName: items.length > 0 ? items[items.length - 1].productName : '',
        ceret: 0, vagan: 0, qty: 0, rate: 0, total: 0
      }
    ]);
  };

  const removeRow = (rowId: string) => {
    const newItems = items.filter(i => i.id !== rowId);
    newItems.forEach((item, idx) => item.srNo = idx + 1);
    setItems(newItems);
  };

  const totalQty = items.reduce((sum, item) => sum + item.qty, 0);
  const finalAmount = items.reduce((sum, item) => sum + item.total, 0);

  const generateImage = async (): Promise<string | null> => {
    if (!targetRef.current) return null;
    const canvas = await html2canvas(targetRef.current, { scale: 2 });
    return canvas.toDataURL('image/jpeg', 0.9);
  };

  const generatePDFBlob = async (): Promise<Blob | null> => {
    if (!targetRef.current) return null;
    const canvas = await html2canvas(targetRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/jpeg', 0.9);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    return pdf.output('blob');
  };

  const handleDownload = async () => {
    if (exportFormat === 'jpg') {
      const imgData = await generateImage();
      if (imgData) {
        const link = document.createElement('a');
        link.href = imgData;
        link.download = `Invoice_${invoiceMetadata.invoiceNumber}.jpg`;
        link.click();
      }
    } else {
      const blob = await generatePDFBlob();
      if (blob) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Invoice_${invoiceMetadata.invoiceNumber}.pdf`;
        link.click();
      }
    }
  };

  const handleWhatsAppShare = async () => {
    const textMsg = `Hello ${invoiceMetadata.receiverName}, here is your Invoice #${invoiceMetadata.invoiceNumber} for ₹${finalAmount.toFixed(2)}. Thank you!`;
    
    try {
      let file: File | null = null;
      if (exportFormat === 'pdf') {
        const blob = await generatePDFBlob();
        if (blob) file = new File([blob], `Invoice_${invoiceMetadata.invoiceNumber}.pdf`, { type: 'application/pdf' });
      } else {
        const imgUrl = await generateImage();
        if (imgUrl) {
          const res = await fetch(imgUrl);
          const blob = await res.blob();
          file = new File([blob], `Invoice_${invoiceMetadata.invoiceNumber}.jpg`, { type: 'image/jpeg' });
        }
      }

      // Check if Web Share API supports file sharing (Mobile mostly)
      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Invoice',
          text: textMsg,
          files: [file]
        });
      } else {
        // Fallback for Desktop (wa.me without specific number)
        alert('File attachment is not automatically supported on desktop WhatsApp Web. The file will download now, please attach it manually in the chat after selecting the contact!');
        await handleDownload(); // download it for them to attach manually
        window.open(`https://wa.me/?text=${encodeURIComponent(textMsg)}`, '_blank');
      }
    } catch (e) {
      console.error(e);
      window.open(`https://wa.me/?text=${encodeURIComponent(textMsg)}`, '_blank');
    }
  };

  const handleSaveInvoice = async () => {
    setIsSaving(true);
    try {
      const record: InvoiceRecord = {
        id: invoiceId,
        invoiceNumber: invoiceMetadata.invoiceNumber,
        date: invoiceMetadata.invoiceDate,
        timestamp: Date.now(),
        receiverName: invoiceMetadata.receiverName || 'Unknown',
        totalAmount: finalAmount,
        items: items,
        uid: '' // Will be populated in db.ts
      };
      await saveInvoice(record);
      alert('Invoice Saved Successfully!');
      navigate('/dashboard');
    } catch (e) {
      console.error(e);
      alert('Failed to save invoice');
    }
    setIsSaving(false);
  };

  if (step === 1) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{id ? 'Edit Invoice' : 'New Invoice Data'}</h2>
          <p className="text-gray-500">Enter billing details. You can preview the A4 format in the next step.</p>
        </div>

        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Receiver Name</label>
              <input 
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                value={invoiceMetadata.receiverName}
                placeholder="Customer Name"
                onChange={e => setInvoiceMetadata({...invoiceMetadata, receiverName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
              <input 
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                value={invoiceMetadata.gstin}
                onChange={e => setInvoiceMetadata({...invoiceMetadata, gstin: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
              <input 
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                value={invoiceMetadata.invoiceNumber}
                onChange={e => setInvoiceMetadata({...invoiceMetadata, invoiceNumber: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
              <input 
                type="date"
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                value={invoiceMetadata.invoiceDate.split('-').reverse().join('-')}
                onChange={e => {
                  const d = new Date(e.target.value);
                  if(!isNaN(d.getTime())) setInvoiceMetadata({...invoiceMetadata, invoiceDate: d.toLocaleDateString('en-GB').replace(/\//g, '-')});
                }}
              />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Line Items</h3>
              <button onClick={addRow} className="text-blue-600 bg-blue-50 px-4 py-2 rounded-lg font-medium hover:bg-blue-100">
                + Add Item
              </button>
            </div>
            
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-[1fr_100px_100px_100px_100px_50px] gap-4 items-end bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Product</label>
                    <input className="w-full border border-gray-300 rounded-lg p-2 outline-none" value={item.productName} onChange={e => updateItem(index, 'productName', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">CERET</label>
                    <input type="number" className="w-full border border-gray-300 rounded-lg p-2 outline-none" value={item.ceret} onChange={e => updateItem(index, 'ceret', Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">VAGAN</label>
                    <input type="number" className="w-full border border-gray-300 rounded-lg p-2 outline-none" value={item.vagan} onChange={e => updateItem(index, 'vagan', Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Rate</label>
                    <input type="number" className="w-full border border-gray-300 rounded-lg p-2 outline-none" value={item.rate} onChange={e => updateItem(index, 'rate', Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Total</label>
                    <div className="w-full bg-gray-100 border border-gray-300 rounded-lg p-2 font-medium">₹{item.total.toFixed(2)}</div>
                  </div>
                  <button onClick={() => removeRow(item.id)} className="h-[42px] flex items-center justify-center text-red-500 hover:text-red-700 bg-red-50 rounded-lg w-full">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-end text-xl font-bold text-gray-900">
              Final Amount: ₹ {finalAmount.toFixed(2)}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button onClick={() => setStep(2)} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-sm w-full md:w-auto">
              Preview & Share
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // STEP 2: PREVIEW & SHARE
  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center gap-6 pb-20">
      
      <div className="w-full flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <button onClick={() => setStep(1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium">
          <ArrowLeft size={18} /> Back to Edit
        </button>
        <select 
          value={locale} 
          onChange={(e) => setLocale(e.target.value as any)}
          className="border border-gray-300 p-2 rounded-lg bg-white font-medium outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="en">English (Rupees)</option>
          <option value="hi">Hindi (रुपये)</option>
          <option value="gu">Gujarati (રૂપિયા)</option>
        </select>
      </div>

      <div className="w-full grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6 items-start">
        {/* A4 Preview Container */}
        <div className="overflow-x-auto w-full flex justify-center bg-gray-50 border border-gray-200 shadow-sm p-4 rounded-xl">
          <div 
            ref={targetRef} 
            className="invoice-container bg-white flex-shrink-0"
            style={{ width: '794px', minHeight: '1123px', fontFamily: "'Inter', sans-serif" }}
          >
            <div className="w-full h-full border border-black flex flex-col">
              {/* Header */}
              <div className="text-center pt-2 pb-4 border-b-2 border-black">
                <div className="italic text-xs mb-2">{t.thanks}</div>
                <h1 className="text-[22px] font-bold uppercase tracking-wide">{profile.farmName}</h1>
                <p className="text-[14px] mt-1">{profile.placeArea}</p>
                <div className="flex items-center justify-center gap-1 mt-1 text-[14px]">
                  <Phone size={14} /> <span>{profile.mobileNo}</span>
                </div>
              </div>

              {/* Title Banner */}
              <div className="flex justify-between items-center bg-[#DBEAFE] px-4 py-2 border-b-2 border-black">
                <div className="w-1/3"></div>
                <div className="text-[18px] font-bold w-1/3 text-center tracking-wider">{t.taxInvoice}</div>
                <div className="text-[12px] italic w-1/3 text-right">{t.originalForRec}</div>
              </div>

              {/* Metadata Section */}
              <div className="grid grid-cols-2 p-2 border-b-2 border-black text-[13px] leading-relaxed">
                <div>
                  <div className="grid grid-cols-[130px_1fr]">
                    <span>{t.invNum}</span>
                    <span className="font-semibold text-right">{invoiceMetadata.invoiceNumber}</span>
                  </div>
                  <div className="grid grid-cols-[130px_1fr]">
                    <span>{t.invDate}</span>
                    <span className="font-semibold text-right">{invoiceMetadata.invoiceDate}</span>
                  </div>
                  <div className="grid grid-cols-[130px_1fr]">
                    <span>{t.state}</span>
                    <span className="font-semibold text-right uppercase">{invoiceMetadata.state}</span>
                  </div>
                  <div className="grid grid-cols-[130px_1fr]">
                    <span>{t.revCharge}</span>
                    <span className="font-semibold text-right uppercase">{invoiceMetadata.reverseCharge}</span>
                  </div>
                </div>
              </div>

              {/* Receiver Details */}
              <div className="bg-[#DBEAFE] text-center text-[13px] font-semibold py-1 border-b border-black">
                {t.detailsRec}
              </div>
              <div className="p-2 border-b-2 border-black text-[13px]">
                <div className="flex">
                  <span className="w-20">{t.name}</span>
                  <span className="font-bold uppercase flex-1">{invoiceMetadata.receiverName}</span>
                </div>
                <div className="flex mt-1">
                  <span className="w-20">{t.gstin}</span>
                  <span className="uppercase flex-1">{invoiceMetadata.gstin}</span>
                </div>
              </div>

              {/* Table */}
              <div className="flex-1 flex flex-col border-b-2 border-black">
                <div className="grid grid-cols-[50px_1fr_70px_70px_80px_80px_120px] border-b-2 border-black bg-[#DBEAFE] text-[13px] font-bold text-center items-center">
                  <div className="border-r-2 border-black py-1 h-full">{t.srNo}</div>
                  <div className="border-r-2 border-black py-1 h-full">{t.prodName}</div>
                  <div className="border-r-2 border-black py-1 h-full">{t.ceret}</div>
                  <div className="border-r-2 border-black py-1 h-full">{t.vagan}</div>
                  <div className="border-r-2 border-black py-1 h-full">{t.qty}</div>
                  <div className="border-r-2 border-black py-1 h-full">{t.rate}</div>
                  <div className="py-1 h-full">{t.total}</div>
                </div>
                
                <div className="flex-1 min-h-[300px]">
                  {items.map((item) => (
                    <div key={item.id} className="grid grid-cols-[50px_1fr_70px_70px_80px_80px_120px] border-b border-gray-300 text-[13px] items-center">
                      <div className="border-r-2 border-black py-1 text-center h-full">{item.srNo}</div>
                      <div className="border-r-2 border-black py-1 px-2 h-full">{item.productName}</div>
                      <div className="border-r-2 border-black py-1 text-center h-full">{item.ceret}</div>
                      <div className="border-r-2 border-black py-1 text-center h-full">{item.vagan}</div>
                      <div className="border-r-2 border-black py-1 text-center h-full">{item.qty}</div>
                      <div className="border-r-2 border-black py-1 text-center h-full">{item.rate}</div>
                      <div className="py-1 text-right px-2 font-medium h-full">₹ {item.total.toFixed(2)}</div>
                    </div>
                  ))}
                  <div className="grid grid-cols-[50px_1fr_70px_70px_80px_80px_120px] h-full flex-1 min-h-[100px]">
                     <div className="border-r-2 border-black h-full"></div>
                     <div className="border-r-2 border-black h-full"></div>
                     <div className="border-r-2 border-black h-full"></div>
                     <div className="border-r-2 border-black h-full"></div>
                     <div className="border-r-2 border-black h-full"></div>
                     <div className="border-r-2 border-black h-full"></div>
                     <div className="h-full"></div>
                  </div>
                </div>

                {/* Total Row */}
                <div className="grid grid-cols-[50px_1fr_70px_70px_80px_80px_120px] border-t-2 border-black bg-[#DBEAFE] font-bold text-[13px]">
                  <div className="border-r-2 border-black py-1 h-full"></div>
                  <div className="border-r-2 border-black py-1 text-right px-2 h-full">{t.total}</div>
                  <div className="border-r-2 border-black py-1 h-full"></div>
                  <div className="border-r-2 border-black py-1 h-full"></div>
                  <div className="border-r-2 border-black py-1 text-center h-full">{totalQty.toFixed(3)}</div>
                  <div className="border-r-2 border-black py-1 h-full"></div>
                  <div className="py-1 text-right px-2 h-full">₹ {finalAmount.toFixed(2)}</div>
                </div>
              </div>

              {/* Footer Totals */}
              <div className="grid grid-cols-[1fr_200px] text-[13px] border-b-2 border-black">
                <div className="border-r-2 border-black p-2 flex flex-col justify-center items-center">
                  <div className="font-semibold">{t.totInvWords}</div>
                  <div className="font-bold text-center mt-1">
                    {translateNumberToIndianWords(finalAmount, locale)}
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="flex justify-between p-2 border-b-2 border-black font-semibold bg-[#DBEAFE]">
                    <span>{t.finalInvAmt}</span>
                    <span>₹ {finalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between p-2 font-bold">
                    <span>{t.balanceDue}</span>
                    <span>₹ {finalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Terms & Signature */}
              <div className="grid grid-cols-2 text-[12px] h-[120px]">
                <div className="border-r-2 border-black p-2">
                  <div className="font-bold mb-1">{t.terms}</div>
                  <div>{t.t1}</div>
                  <div>{t.t2}</div>
                </div>
                <div className="p-2 flex flex-col justify-between items-end text-right">
                  <div>{t.cert}</div>
                  <div className="font-bold">{t.for} {profile.farmName}</div>
                  <div className="mt-8 font-semibold">{t.authSig}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-6 sticky top-6">
          <div>
            <h3 className="font-bold text-gray-900 mb-2">Share via WhatsApp</h3>
            <div className="space-y-3">
              <select
                value={exportFormat}
                onChange={e => setExportFormat(e.target.value as 'pdf'|'jpg')}
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-green-500 bg-white"
              >
                <option value="pdf">Send as PDF Document</option>
                <option value="jpg">Send as JPG Image</option>
              </select>
              <button 
                onClick={handleWhatsAppShare}
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white py-2.5 rounded-lg font-bold hover:bg-[#128C7E] transition-colors"
              >
                <Send size={18} /> Open WhatsApp
              </button>
            </div>
          </div>

          <hr className="border-gray-100" />

          <div>
            <h3 className="font-bold text-gray-900 mb-2">Manual Download</h3>
            <div className="flex gap-2">
              <button onClick={() => {setExportFormat('jpg'); handleDownload()}} className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-800 py-2.5 rounded-lg font-medium hover:bg-gray-200">
                <Download size={16} /> JPG
              </button>
              <button onClick={() => {setExportFormat('pdf'); handleDownload()}} className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-800 py-2.5 rounded-lg font-medium hover:bg-gray-200">
                <Download size={16} /> PDF
              </button>
            </div>
          </div>
          
          <hr className="border-gray-100" />

          <button 
            onClick={handleSaveInvoice}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
          >
            <Save size={18} /> {isSaving ? 'Saving...' : 'Save Invoice'}
          </button>
        </div>
      </div>
    </div>
  );
}
