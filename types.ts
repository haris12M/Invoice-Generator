
export interface InvoiceItem {
  id: string;
  sno: number;
  description: string;
  qty: number;
  unitRate: number;
}

export interface Invoice {
  id: string;
  ntnNo: string;
  ref: string;
  date: string;
  recipient: string; // M/s
  items: InvoiceItem[];
}
