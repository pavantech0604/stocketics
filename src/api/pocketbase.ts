import PocketBase from 'pocketbase';
import { 
  Employee, 
  LeaveRequest, 
  AttendanceRecord, 
  AdvisoryLead, 
  KYCRecord, 
  CallLogRecord,
  ConfirmedPaymentRecord 
} from '../types';

export const POCKETBASE_URL = import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';

// Global singleton client
export const pb = new PocketBase(POCKETBASE_URL);

// Auto cancellation disabled so multiple parallel queries do not abort each other
pb.autoCancellation(false);

export const isCloudDeployment = 
  typeof window !== 'undefined' && 
  window.location.protocol === 'https:' && 
  (!import.meta.env.VITE_POCKETBASE_URL || import.meta.env.VITE_POCKETBASE_URL.startsWith('http://'));

let lastHealthCheckTime = 0;
let lastHealthCheckResult = false;

/**
 * Health check helper to see if PocketBase is online.
 * On remote HTTPS deployments (such as Vercel), skips insecure localhost HTTP calls to prevent Mixed Content browser errors.
 * Caches offline status for 10 seconds to avoid duplicate ERR_CONNECTION_REFUSED logs during React StrictMode initial mount.
 */
export async function checkPocketBaseHealth(): Promise<boolean> {
  if (isCloudDeployment) {
    return false;
  }

  const now = Date.now();
  if (!lastHealthCheckResult && (now - lastHealthCheckTime < 10000)) {
    return false;
  }
  lastHealthCheckTime = now;

  try {
    const health = await pb.health.check();
    lastHealthCheckResult = health.code === 200;
    return lastHealthCheckResult;
  } catch {
    lastHealthCheckResult = false;
    return false;
  }
}

/**
 * Collection Names
 */
export const COLLECTIONS = {
  EMPLOYEES: 'employees',
  LEAVES: 'leaves',
  ATTENDANCE: 'attendance',
  LEADS: 'leads',
  CONFIRMED_PAYMENTS: 'confirmed_payments',
  KYC_RECORDS: 'kyc_records',
  CALL_LOGS: 'call_logs'
} as const;

/**
 * Generic API Helpers
 */
export const api = {
  // Employees
  async getEmployees(): Promise<Employee[]> {
    const records = await pb.collection(COLLECTIONS.EMPLOYEES).getFullList<Employee>();
    return records;
  },
  async createEmployee(data: Partial<Employee>): Promise<Employee> {
    return await pb.collection(COLLECTIONS.EMPLOYEES).create<Employee>(data);
  },
  async updateEmployee(id: string, data: Partial<Employee>): Promise<Employee> {
    return await pb.collection(COLLECTIONS.EMPLOYEES).update<Employee>(id, data);
  },

  // Leaves
  async getLeaves(): Promise<LeaveRequest[]> {
    const records = await pb.collection(COLLECTIONS.LEAVES).getFullList<LeaveRequest>({
      sort: '-appliedAt'
    });
    return records;
  },
  async createLeave(data: Partial<LeaveRequest>): Promise<LeaveRequest> {
    return await pb.collection(COLLECTIONS.LEAVES).create<LeaveRequest>(data);
  },
  async updateLeave(id: string, data: Partial<LeaveRequest>): Promise<LeaveRequest> {
    return await pb.collection(COLLECTIONS.LEAVES).update<LeaveRequest>(id, data);
  },

  // Attendance
  async getAttendance(): Promise<AttendanceRecord[]> {
    const records = await pb.collection(COLLECTIONS.ATTENDANCE).getFullList<AttendanceRecord>({
      sort: '-date'
    });
    return records;
  },
  async createAttendance(data: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
    return await pb.collection(COLLECTIONS.ATTENDANCE).create<AttendanceRecord>(data);
  },
  async updateAttendance(id: string, data: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
    return await pb.collection(COLLECTIONS.ATTENDANCE).update<AttendanceRecord>(id, data);
  },

  // Advisory Leads
  async getLeads(): Promise<AdvisoryLead[]> {
    const records = await pb.collection(COLLECTIONS.LEADS).getFullList<AdvisoryLead>({
      sort: '-created'
    });
    return records;
  },
  async createLead(data: Partial<AdvisoryLead>): Promise<AdvisoryLead> {
    return await pb.collection(COLLECTIONS.LEADS).create<AdvisoryLead>(data);
  },
  async updateLead(id: string, data: Partial<AdvisoryLead>): Promise<AdvisoryLead> {
    return await pb.collection(COLLECTIONS.LEADS).update<AdvisoryLead>(id, data);
  },

  // Confirmed Payments
  async getConfirmedPayments(): Promise<ConfirmedPaymentRecord[]> {
    const records = await pb.collection(COLLECTIONS.CONFIRMED_PAYMENTS).getFullList<ConfirmedPaymentRecord>({
      sort: '-date'
    });
    return records;
  },
  async createConfirmedPayment(data: Partial<ConfirmedPaymentRecord>): Promise<ConfirmedPaymentRecord> {
    return await pb.collection(COLLECTIONS.CONFIRMED_PAYMENTS).create<ConfirmedPaymentRecord>(data);
  },
  async updateConfirmedPayment(id: string, data: Partial<ConfirmedPaymentRecord>): Promise<ConfirmedPaymentRecord> {
    return await pb.collection(COLLECTIONS.CONFIRMED_PAYMENTS).update<ConfirmedPaymentRecord>(id, data);
  },

  // KYC
  async getKYCRecords(): Promise<KYCRecord[]> {
    const records = await pb.collection(COLLECTIONS.KYC_RECORDS).getFullList<KYCRecord>({
      sort: '-submittedAt'
    });
    return records;
  },
  async updateKYCRecord(id: string, data: Partial<KYCRecord>): Promise<KYCRecord> {
    return await pb.collection(COLLECTIONS.KYC_RECORDS).update<KYCRecord>(id, data);
  },

  // Call Logs
  async getCallLogs(): Promise<CallLogRecord[]> {
    const records = await pb.collection(COLLECTIONS.CALL_LOGS).getFullList<CallLogRecord>({
      sort: '-timestamp'
    });
    return records;
  },
  async createCallLog(data: Partial<CallLogRecord>): Promise<CallLogRecord> {
    return await pb.collection(COLLECTIONS.CALL_LOGS).create<CallLogRecord>(data);
  },
  async updateCallLog(id: string, data: Partial<CallLogRecord>): Promise<CallLogRecord> {
    return await pb.collection(COLLECTIONS.CALL_LOGS).update<CallLogRecord>(id, data);
  }
};
