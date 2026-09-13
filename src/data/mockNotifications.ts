import { Notification } from '../types';

export const mockNotifications: Notification[] = [
  { id: 'n_001', title: 'Prompt Injection Blocked', message: 'High-risk prompt injection attempt was detected and blocked from user_external.', type: 'security', severity: 'high', read: false, timestamp: '2024-08-16T14:32:00Z' },
  { id: 'n_002', title: 'New Document Analyzed', message: 'Product_Specs.pdf has been uploaded and is currently being scanned.', type: 'document', severity: 'low', read: false, timestamp: '2024-08-16T09:00:00Z' },
  { id: 'n_003', title: 'Malicious Document Detected', message: 'Malicious_Report.pdf has been blocked due to known malware signatures.', type: 'document', severity: 'critical', read: false, timestamp: '2024-08-15T15:10:00Z' },
  { id: 'n_004', title: 'Security Evaluation Complete', message: 'Latest security evaluation completed. Detection rate: 94%.', type: 'system', severity: 'low', read: true, timestamp: '2024-08-15T12:00:00Z' },
  { id: 'n_005', title: 'Jailbreak Attempt Detected', message: 'DAN-style jailbreak attempt was blocked from external user.', type: 'security', severity: 'high', read: true, timestamp: '2024-08-14T16:30:00Z' },
  { id: 'n_006', title: 'System Update', message: 'Security rules have been updated to v2.4.1.', type: 'system', severity: 'low', read: true, timestamp: '2024-08-14T10:00:00Z' },
  { id: 'n_007', title: 'Unsafe Output Flagged', message: 'A response containing potential PII was flagged for review.', type: 'security', severity: 'medium', read: true, timestamp: '2024-08-13T14:00:00Z' },
];
