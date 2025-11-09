import React, { useState, useEffect, useCallback } from 'react';
import type { Invoice } from './types';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoiceList } from './components/InvoiceList';

type View = 'list' | 'form';

const App: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [currentView, setCurrentView] = useState<View>('list');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    try {
      const savedInvoices = localStorage.getItem('invoices');
      if (savedInvoices) {
        setInvoices(JSON.parse(savedInvoices));
      }
    } catch (error) {
      console.error("Failed to load invoices from local storage:", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('invoices', JSON.stringify(invoices));
    } catch (error) {
      console.error("Failed to save invoices to local storage:", error);
    }
  }, [invoices]);

  const handleCreateNew = () => {
    setSelectedInvoice(null);
    setCurrentView('form');
  };

  const handleEdit = (id: string) => {
    const invoiceToEdit = invoices.find((inv) => inv.id === id);
    if (invoiceToEdit) {
      setSelectedInvoice(invoiceToEdit);
      setCurrentView('form');
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      setInvoices(invoices.filter((inv) => inv.id !== id));
    }
  };

  const handleSave = (invoice: Invoice) => {
    if (invoice.id) {
      // Update existing invoice
      setInvoices(invoices.map((inv) => (inv.id === invoice.id ? invoice : inv)));
    } else {
      // Create new invoice
      const newInvoice = { ...invoice, id: Date.now().toString() };
      setInvoices([...invoices, newInvoice]);
    }
    setCurrentView('list');
    setSelectedInvoice(null);
  };
  
  const handleCancel = useCallback(() => {
      setCurrentView('list');
      setSelectedInvoice(null);
  }, []);

  return (
    <div className="bg-black min-h-screen font-sans text-white">
      <nav className="bg-gray-900 shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
                <div className="flex-shrink-0">
                    <h1 className="text-2xl font-bold text-white">Invoice Pro</h1>
                </div>
                {currentView === 'list' && (
                  <button
                    onClick={handleCreateNew}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow"
                  >
                    Create New Invoice
                  </button>
                )}
            </div>
        </div>
      </nav>
      
      <main>
        {currentView === 'list' ? (
          <InvoiceList invoices={invoices} onEdit={handleEdit} onDelete={handleDelete} />
        ) : (
          <InvoiceForm invoice={selectedInvoice} onSave={handleSave} onCancel={handleCancel} />
        )}
      </main>
    </div>
  );
};

export default App;