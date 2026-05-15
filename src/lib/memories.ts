import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  Timestamp 
} from 'firebase/firestore';
import { db, auth } from './firebase';

export interface Memory {
  id?: string;
  ownerId: string;
  title: string;
  content: string;
  type: 'text' | 'video' | 'audio' | 'letter';
  unlockDate: Timestamp;
  createdAt: Timestamp;
  isLocked: boolean;
  emotion?: string;
  aiCaption?: string;
  aiSummary?: string;
  familySharedWith?: string[];
}

export async function createMemory(data: Omit<Memory, 'id' | 'ownerId' | 'createdAt' | 'isLocked'>) {
  if (!auth.currentUser) throw new Error("Auth required");
  
  return addDoc(collection(db, 'memories'), {
    ...data,
    ownerId: auth.currentUser.uid,
    createdAt: Timestamp.now(),
    isLocked: true,
    familySharedWith: []
  });
}

export function subscribeToMemories(callback: (memories: Memory[]) => void) {
  if (!auth.currentUser) return () => {};

  const q = query(
    collection(db, 'memories'),
    where('ownerId', '==', auth.currentUser.uid),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const memories = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Memory[];
    callback(memories);
  }, (error) => {
    console.error("Firestore Error:", error);
  });
}
