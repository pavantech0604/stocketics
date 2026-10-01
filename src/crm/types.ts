export type CRMRole = 'admin' | 'manager' | 'team_leader' | 'employee';
export interface CRMUser { id: string; name: string; email: string; role: CRMRole; status: string; teamLeaderId: string; managerId: string; branch: string }
export interface CRMRecord { id: string; version: number; created: string; updated: string; leadId: string; ownerId: string; teamLeaderId: string; managerId: string; [key: string]: any }
export interface CRMState {
  user: CRMUser; users: CRMUser[]; leads: CRMRecord[]; clients: CRMRecord[]; activity: CRMRecord[];
  followups: CRMRecord[]; requests: CRMRecord[]; assignments: CRMRecord[]; documents: CRMRecord[];
  notifications: CRMRecord[]; imports: CRMRecord[]; audit: CRMRecord[];
  settings: { maxRequest: number; aadhaarBackRequired: boolean; states: string[]; sources: string[]; version?: number };
}
