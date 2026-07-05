import { db, auth } from './firebase';
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc, query, where } from 'firebase/firestore';

export interface UserProfile {
  farmName: string;
  placeArea: string;
  mobileNo: string;
}

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  date: string;
  timestamp: number;
  receiverName: string;
  totalAmount: number;
  items: any[];
  uid: string;
}

export async function getProfile(): Promise<UserProfile | null> {
  if (!auth.currentUser) return null;
  const docRef = doc(db, 'profiles', auth.currentUser.uid);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return snap.data() as UserProfile;
  }
  return null;
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  if (!auth.currentUser) throw new Error("Must be logged in");
  const docRef = doc(db, 'profiles', auth.currentUser.uid);
  await setDoc(docRef, profile, { merge: true });
}

export async function saveInvoice(invoice: Omit<InvoiceRecord, 'uid'>): Promise<void> {
  if (!auth.currentUser) throw new Error("Must be logged in");
  const record: InvoiceRecord = {
    ...invoice,
    uid: auth.currentUser.uid
  };
  const docRef = doc(db, 'invoices', record.id);
  await setDoc(docRef, record);
}

export async function getInvoices(): Promise<InvoiceRecord[]> {
  if (!auth.currentUser) return [];
  const q = query(collection(db, 'invoices'), where("uid", "==", auth.currentUser.uid));
  const snap = await getDocs(q);
  const invoices: InvoiceRecord[] = [];
  snap.forEach(doc => {
    invoices.push(doc.data() as InvoiceRecord);
  });
  return invoices;
}

export async function getInvoiceById(id: string): Promise<InvoiceRecord | null> {
  if (!auth.currentUser) return null;
  const docRef = doc(db, 'invoices', id);
  const snap = await getDoc(docRef);
  if (snap.exists() && snap.data().uid === auth.currentUser.uid) {
    return snap.data() as InvoiceRecord;
  }
  return null;
}

export async function deleteInvoice(id: string): Promise<void> {
  if (!auth.currentUser) throw new Error("Must be logged in");
  const docRef = doc(db, 'invoices', id);
  await deleteDoc(docRef);
}
