import React from 'react';
import type { Invoice } from '../types';
import { EditIcon, TrashIcon } from './Icons';

interface InvoiceListProps {
  invoices: Invoice[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({ invoices, onEdit, onDelete }) => {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-white mb-6">Saved Invoices</h1>
      {invoices.length === 0 ? (
        <div className="text-center py-16 bg-gray-800 rounded-lg">
          <p className="text-gray-300">You have no saved invoices.</p>
          <p className="text-gray-300 mt-2">Click "Create New Invoice" to get started.</p>
        </div>
      ) : (
        <div className="bg-gray-900 shadow-md rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-700">
            {invoices.map((invoice) => (
              <li key={invoice.id} className="p-4 hover:bg-gray-800 transition-colors flex justify-between items-center">
                <div>
                  <p className="font-semibold text-white">
                    Ref: <span className="text-gray-300">{invoice.ref || 'N/A'}</span>
                  </p>
                  <p className="text-sm text-gray-400">
                    To: {invoice.recipient || 'N/A'} on {invoice.date}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => onEdit(invoice.id)}
                    className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-full transition-colors"
                    aria-label="Edit Invoice"
                  >
                    <EditIcon />
                  </button>
                  <button
                    onClick={() => onDelete(invoice.id)}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-full transition-colors"
                    aria-label="Delete Invoice"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};