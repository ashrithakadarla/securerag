import { User } from '../types';

export const mockUser: User = {
  id: 'usr_001',
  fullName: 'Alex Morgan',
  email: 'alex.morgan@securerag.io',
  role: 'admin',
  avatar: undefined,
  createdAt: '2024-01-15T08:00:00Z',
};

export const mockUsers: User[] = [
  mockUser,
  { id: 'usr_002', fullName: 'Sarah Chen', email: 'sarah.chen@securerag.io', role: 'analyst', createdAt: '2024-02-10T10:30:00Z' },
  { id: 'usr_003', fullName: 'James Wilson', email: 'james.wilson@securerag.io', role: 'viewer', createdAt: '2024-03-05T14:00:00Z' },
];
