import { UserRole } from '../types';

export interface RoleCredential {
  role: UserRole;
  name: string;
  title: string;
  department: string;
  email: string;
  password: string;
  badgeColor: string;
  description: string;
  avatar: string;
}

export const DEFAULT_ROLE_CREDENTIALS: Record<UserRole, RoleCredential> = {
  manager: {
    role: 'manager',
    name: 'Vinod Kumar K J',
    title: 'VP, Equity Advisory & Markets',
    department: 'Equity Research & Advisory',
    email: 'manager@stocketics.com',
    password: 'manager123',
    badgeColor: '#0284c7',
    description: 'Oversees advisory sales, team approvals, research pipelines & high-net-worth client accounts.',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80'
  },
  hr: {
    role: 'hr',
    name: 'Sindhu H S',
    title: 'Head of People & HR Operations',
    department: 'Human Resources & Operations',
    email: 'hr@stocketics.com',
    password: 'hr123',
    badgeColor: '#8b5cf6',
    description: 'Manages staff attendance, leave approval workflows, employee onboarding, policies & payroll.',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  employee: {
    role: 'employee',
    name: 'Aditya Roy',
    title: 'Senior Equity Research Analyst',
    department: 'Equity Advisory Desk',
    email: 'employee@stocketics.com',
    password: 'employee123',
    badgeColor: '#10b981',
    description: 'Manages fresh retail leads, live market advisory, customer SMS dispatches & personal work shifts.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  }
};

const STORAGE_KEY = 'stocketics_crm_credentials';

export function getStoredCredentials(): Record<UserRole, RoleCredential> {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return { ...DEFAULT_ROLE_CREDENTIALS, ...JSON.parse(data) };
    }
  } catch (e) {
    console.error('Failed to parse stored credentials', e);
  }
  return DEFAULT_ROLE_CREDENTIALS;
}

export function saveStoredCredentials(creds: Record<UserRole, RoleCredential>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(creds));
  } catch (e) {
    console.error('Failed to save credentials', e);
  }
}
