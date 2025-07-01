import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
  QueryConstraint,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User, Company, MentalHealthReport, ChatSession, ChatMessage } from '@/types';

// Generic Firestore operations
export class FirestoreService {
  // Create document
  static async create<T>(collectionName: string, data: Omit<T, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error(`Error creating document in ${collectionName}:`, error);
      throw error;
    }
  }

  // Create document with custom ID
  static async createWithId<T>(collectionName: string, id: string, data: Omit<T, 'id'>): Promise<void> {
    try {
      await setDoc(doc(db, collectionName, id), {
        ...data,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });
    } catch (error) {
      console.error(`Error creating document with ID in ${collectionName}:`, error);
      throw error;
    }
  }

  // Get document by ID
  static async getById<T>(collectionName: string, id: string): Promise<T | null> {
    try {
      const docSnap = await getDoc(doc(db, collectionName, id));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      }
      return null;
    } catch (error) {
      console.error(`Error getting document from ${collectionName}:`, error);
      throw error;
    }
  }

  // Update document
  static async update(collectionName: string, id: string, data: Partial<any>): Promise<void> {
    try {
      await updateDoc(doc(db, collectionName, id), {
        ...data,
        updated_at: serverTimestamp()
      });
    } catch (error) {
      console.error(`Error updating document in ${collectionName}:`, error);
      throw error;
    }
  }

  // Delete document
  static async delete(collectionName: string, id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error);
      throw error;
    }
  }

  // Query documents with pagination
  static async query<T>(
    collectionName: string,
    constraints: QueryConstraint[] = [],
    pageSize: number = 10,
    lastDoc?: DocumentSnapshot
  ): Promise<{ data: T[]; lastDoc?: DocumentSnapshot }> {
    try {
      let queryConstraints = [...constraints, limit(pageSize)];
      
      if (lastDoc) {
        queryConstraints.push(startAfter(lastDoc));
      }

      const q = query(collection(db, collectionName), ...queryConstraints);
      const querySnapshot = await getDocs(q);
      
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];

      const newLastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

      return { data, lastDoc: newLastDoc };
    } catch (error) {
      console.error(`Error querying ${collectionName}:`, error);
      throw error;
    }
  }
}

// User-specific operations
export class UserService extends FirestoreService {
  static async createUser(userId: string, userData: Omit<User, 'id'>): Promise<void> {
    return this.createWithId<User>('users', userId, userData);
  }

  static async getUser(userId: string): Promise<User | null> {
    return this.getById<User>('users', userId);
  }

  static async updateUser(userId: string, userData: Partial<User>): Promise<void> {
    return this.update('users', userId, userData);
  }

  static async getUsersByCompany(companyId: string): Promise<User[]> {
    const { data } = await this.query<User>('users', [
      where('company_id', '==', companyId),
      where('role', '==', 'employee')
    ], 100);
    return data;
  }
}

// Company-specific operations
export class CompanyService extends FirestoreService {
  static async createCompany(companyData: Omit<Company, 'id'>): Promise<string> {
    return this.create<Company>('companies', companyData);
  }

  static async getCompany(companyId: string): Promise<Company | null> {
    return this.getById<Company>('companies', companyId);
  }

  static async updateCompany(companyId: string, companyData: Partial<Company>): Promise<void> {
    return this.update('companies', companyId, companyData);
  }
}

// Mental Health Report operations
export class ReportService extends FirestoreService {
  static async createReport(reportData: Omit<MentalHealthReport, 'id'>): Promise<string> {
    return this.create<MentalHealthReport>('mental_health_reports', reportData);
  }

  static async getReport(reportId: string): Promise<MentalHealthReport | null> {
    return this.getById<MentalHealthReport>('mental_health_reports', reportId);
  }

  static async getReportsByEmployee(
    employeeId: string, 
    pageSize: number = 10,
    lastDoc?: DocumentSnapshot
  ): Promise<{ data: MentalHealthReport[]; lastDoc?: DocumentSnapshot }> {
    return this.query<MentalHealthReport>('mental_health_reports', [
      where('employee_id', '==', employeeId),
      orderBy('created_at', 'desc')
    ], pageSize, lastDoc);
  }

  static async getReportsByCompanyEmployees(
    employeeIds: string[],
    pageSize: number = 10,
    lastDoc?: DocumentSnapshot
  ): Promise<{ data: MentalHealthReport[]; lastDoc?: DocumentSnapshot }> {
    // Firestore 'in' queries are limited to 10 items
    if (employeeIds.length > 10) {
      // For larger datasets, we'd need to batch the queries
      const batches = [];
      for (let i = 0; i < employeeIds.length; i += 10) {
        const batch = employeeIds.slice(i, i + 10);
        batches.push(batch);
      }

      const allResults = await Promise.all(
        batches.map(batch => 
          this.query<MentalHealthReport>('mental_health_reports', [
            where('employee_id', 'in', batch)
          ], pageSize)
        )
      );

      // Combine and sort results
      const combinedData = allResults.flatMap(result => result.data);
      combinedData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return { data: combinedData.slice(0, pageSize) };
    }

    return this.query<MentalHealthReport>('mental_health_reports', [
      where('employee_id', 'in', employeeIds)
    ], pageSize, lastDoc);
  }
}

// Chat operations
export class ChatService extends FirestoreService {
  static async createChatSession(sessionData: Omit<ChatSession, 'id' | 'messages'>): Promise<string> {
    return this.create<Omit<ChatSession, 'messages'>>('chat_sessions', sessionData);
  }

  static async getChatSession(sessionId: string): Promise<ChatSession | null> {
    return this.getById<ChatSession>('chat_sessions', sessionId);
  }

  static async addMessage(sessionId: string, messageData: Omit<ChatMessage, 'id'>): Promise<string> {
    return this.create<ChatMessage>(`chat_sessions/${sessionId}/messages`, messageData);
  }

  static async getMessages(
    sessionId: string,
    pageSize: number = 50,
    lastDoc?: DocumentSnapshot
  ): Promise<{ data: ChatMessage[]; lastDoc?: DocumentSnapshot }> {
    return this.query<ChatMessage>(`chat_sessions/${sessionId}/messages`, [
      orderBy('timestamp', 'asc')
    ], pageSize, lastDoc);
  }

  static async getSessionsByEmployee(
    employeeId: string,
    pageSize: number = 10,
    lastDoc?: DocumentSnapshot
  ): Promise<{ data: ChatSession[]; lastDoc?: DocumentSnapshot }> {
    return this.query<ChatSession>('chat_sessions', [
      where('employee_id', '==', employeeId),
      orderBy('created_at', 'desc')
    ], pageSize, lastDoc);
  }
}

// Utility functions
export function convertTimestamp(timestamp: any): string {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString();
  }
  if (timestamp && timestamp.seconds) {
    return new Date(timestamp.seconds * 1000).toISOString();
  }
  return timestamp || new Date().toISOString();
}

export function sanitizeData<T>(data: any): T {
  if (!data) return data;
  
  const sanitized = { ...data };
  
  // Convert Firestore timestamps to ISO strings
  Object.keys(sanitized).forEach(key => {
    if (sanitized[key] instanceof Timestamp) {
      sanitized[key] = sanitized[key].toDate().toISOString();
    }
  });
  
  return sanitized as T;
}