import React, { useState, useMemo, useRef } from 'react';
import type { Invoice, InvoiceItem } from '../types';
import { PlusIcon, TrashIcon, DownloadIcon } from './Icons';

interface InvoiceFormProps {
  invoice: Invoice | null;
  onSave: (invoice: Invoice) => void;
  onCancel: () => void;
}

// Since we're loading from CDN, we need to declare the globals
declare const jspdf: any;
declare const html2canvas: any;

const companyDetails = {
  name: 'RIZWAN ENGINEERING WORKS',
  subtitle: 'All Kinds of Machineries Parts Manufacturers.',
  address: 'Plot # L-3, 48/B, Korangi 2½ Karachi.',
  contact: '0312-2528003',
  email: 'kqureshi12@gmail.com',
};

const EditableField: React.FC<{ value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder: string; className?: string; type?: string }> = ({ value, onChange, placeholder, className = '', type='text' }) => (
    <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`bg-gray-800 text-white p-2 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full ${className}`}
    />
);

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ invoice, onSave, onCancel }) => {
  const [currentInvoice, setCurrentInvoice] = useState<Invoice>(
    invoice || {
      id: '',
      ntnNo: '',
      ref: '',
      date: new Date().toISOString().split('T')[0],
      recipient: '',
      items: [{ id: Date.now().toString(), sno: 1, description: '', qty: 1, unitRate: 0 }],
    }
  );
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (field: keyof Invoice) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentInvoice({ ...currentInvoice, [field]: e.target.value });
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const newItems = currentInvoice.items.map((item) => {
      if (item.id === id) {
        const value = field === 'description' ? e.target.value : parseFloat(e.target.value) || 0;
        return { ...item, [field]: value };
      }
      return item;
    });
    setCurrentInvoice({ ...currentInvoice, items: newItems });
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      sno: currentInvoice.items.length + 1,
      description: '',
      qty: 1,
      unitRate: 0,
    };
    setCurrentInvoice({ ...currentInvoice, items: [...currentInvoice.items, newItem] });
  };

  const removeItem = (id: string) => {
    const newItems = currentInvoice.items
      .filter((item) => item.id !== id)
      .map((item, index) => ({ ...item, sno: index + 1 }));
    setCurrentInvoice({ ...currentInvoice, items: newItems });
  };

  const totalAmount = useMemo(() => {
    return currentInvoice.items.reduce((total, item) => total + item.qty * item.unitRate, 0);
  }, [currentInvoice.items]);

  const handleSave = () => {
    onSave(currentInvoice);
  };

  const handleDownloadPdf = async () => {
    const input = pdfRef.current;
    if (!input) return;

    setIsGeneratingPdf(true);
    
    // Temporarily set a fixed width for consistent PDF output
    const originalWidth = input.style.width;
    input.style.width = '1024px';

    await new Promise(resolve => setTimeout(resolve, 100)); // Allow DOM to update

    try {
        const canvas = await html2canvas(input, {
            scale: 2, // Higher scale for better quality
            useCORS: true,
            logging: false,
            backgroundColor: '#111827' // Match bg-gray-900 for dark theme PDF
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jspdf.jsPDF({
            orientation: 'p',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`invoice-${currentInvoice.ref || 'new'}.pdf`);
    } catch (error) {
        console.error("Error generating PDF:", error);
    } finally {
        input.style.width = originalWidth; // Restore original width
        setIsGeneratingPdf(false);
    }
};

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div id="invoice-printable" ref={pdfRef} className="bg-gray-900 text-white p-8 md:p-12 rounded-lg shadow-lg">
        <header className="text-center mb-12 border-b pb-8 border-gray-700">
          <h1 className="text-4xl font-serif font-bold text-white">{companyDetails.name}</h1>
          <p className="text-gray-300 mt-2">{companyDetails.subtitle} NTN No: 
            <input 
              type="text" 
              value={currentInvoice.ntnNo} 
              onChange={handleInputChange('ntnNo')}
              placeholder="Enter NTN No."
              className="bg-transparent border-b border-gray-500 focus:outline-none focus:border-blue-500 w-48 ml-2 text-white text-center"
            />
          </p>
          <div className="text-sm text-gray-400 mt-4">
            <span>{companyDetails.address}</span>
            <span className="mx-2">|</span>
            <span>Contact: {companyDetails.contact}</span>
            <span className="mx-2">|</span>
            <span>Email: {companyDetails.email}</span>
          </div>
        </header>

        <h2 className="text-center text-3xl font-serif font-semibold text-white tracking-wider mb-10">
          COMMERCIAL INVOICE
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-10">
          <div className="flex items-center space-x-3">
            <label className="font-semibold text-white w-16">Ref:</label>
            <EditableField value={currentInvoice.ref} onChange={handleInputChange('ref')} placeholder="Reference No." />
          </div>
          <div className="flex items-center space-x-3">
            <label className="font-semibold text-white w-16">Date:</label>
            <EditableField value={currentInvoice.date} onChange={handleInputChange('date')} placeholder="YYYY-MM-DD" type="date"/>
          </div>
          <div className="flex items-center space-x-3 col-span-1 md:col-span-2">
            <label className="font-semibold text-white w-16">M/s:</label>
            <EditableField value={currentInvoice.recipient} onChange={handleInputChange('recipient')} placeholder="Recipient Name / Company" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-800">
                <th className="p-3 font-semibold text-white border-b-2 border-gray-700 w-16">Sno</th>
                <th className="p-3 font-semibold text-white border-b-2 border-gray-700">Description</th>
                <th className="p-3 font-semibold text-white border-b-2 border-gray-700 w-24 text-right">Qty</th>
                <th className="p-3 font-semibold text-white border-b-2 border-gray-700 w-32 text-right">Unit Rate</th>
                <th className="p-3 font-semibold text-white border-b-2 border-gray-700 w-32 text-right">Amount</th>
                <th className="p-3 font-semibold text-white border-b-2 border-gray-700 w-12 print-hide"></th>
              </tr>
            </thead>
            <tbody>
              {currentInvoice.items.map((item) => (
                <tr key={item.id} className="group hover:bg-gray-800">
                  <td className="p-2 border-b border-gray-700">{item.sno}</td>
                  <td className="p-2 border-b border-gray-700">
                    <EditableField value={item.description} onChange={handleItemChange(item.id, 'description')} placeholder="Item description" />
                  </td>
                  <td className="p-2 border-b border-gray-700">
                    <EditableField value={String(item.qty)} onChange={handleItemChange(item.id, 'qty')} placeholder="0" className="text-right" type="number" />
                  </td>
                  <td className="p-2 border-b border-gray-700">
                     <EditableField value={String(item.unitRate)} onChange={handleItemChange(item.id, 'unitRate')} placeholder="0.00" className="text-right" type="number"/>
                  </td>
                  <td className="p-2 border-b border-gray-700 text-right font-medium text-white">
                    {(item.qty * item.unitRate).toFixed(2)}
                  </td>
                  <td className="p-2 border-b border-gray-700 text-center print-hide">
                    <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-400 opacity-50 group-hover:opacity-100 transition-opacity">
                      <TrashIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="flex justify-start mt-4 print-hide">
            <button onClick={addItem} className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                <PlusIcon />
                <span>Add Item</span>
            </button>
        </div>

        <div className="flex justify-end mt-8">
            <div className="w-full max-w-xs">
                <div className="flex justify-between items-center py-2">
                    <span className="font-semibold text-white">Total Amount:</span>
                    <span className="font-bold text-xl text-white">
                        {totalAmount.toFixed(2)}
                    </span>
                </div>
            </div>
        </div>

        <footer className="mt-20 pt-8 border-t border-gray-700">
            <p className="font-semibold text-white">Sign:</p>
            <div className="w-1/2 h-0.5 bg-gray-600 mt-16"></div>
        </footer>
      </div>
      
      <div className="mt-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 print-hide">
        <button onClick={onCancel} className="px-6 py-2 text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors">
            Back to List
        </button>
        <div className="flex items-center space-x-4">
             <button
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="flex items-center space-x-2 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:bg-green-300 disabled:cursor-not-allowed"
            >
                <DownloadIcon />
                <span>{isGeneratingPdf ? 'Generating...' : 'Download PDF'}</span>
            </button>
            <button onClick={handleSave} className="bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                Save Invoice
            </button>
        </div>
      </div>
    </div>
  );
};