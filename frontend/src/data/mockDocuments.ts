import { Document } from '../types';

export const mockDocuments: Document[] = [
  {
    id: 'doc_001', name: 'HR_Policy_2024.pdf', type: 'pdf', size: 2458624,
    uploadDate: '2024-08-15T10:30:00Z', trustScore: 96, riskLevel: 'trusted', status: 'analyzed',
    uploadedBy: 'Alex Morgan',
    findings: [{ id: 'f1', type: 'Content Analysis', severity: 'low', description: 'No security issues detected', timestamp: '2024-08-15T10:31:00Z' }],
    threats: [],
  },
  {
    id: 'doc_002', name: 'Financial_Report_Q3.pdf', type: 'pdf', size: 5242880,
    uploadDate: '2024-08-14T14:20:00Z', trustScore: 88, riskLevel: 'trusted', status: 'analyzed',
    uploadedBy: 'Sarah Chen',
    findings: [{ id: 'f2', type: 'Metadata Check', severity: 'low', description: 'Standard financial document', timestamp: '2024-08-14T14:21:00Z' }],
    threats: [],
  },
  {
    id: 'doc_003', name: 'Company_Rules.docx', type: 'docx', size: 1048576,
    uploadDate: '2024-08-13T09:15:00Z', trustScore: 82, riskLevel: 'moderate', status: 'analyzed',
    uploadedBy: 'James Wilson',
    findings: [
      { id: 'f3', type: 'Content Analysis', severity: 'medium', description: 'Contains embedded macros', timestamp: '2024-08-13T09:16:00Z' },
      { id: 'f4', type: 'Security Scan', severity: 'medium', description: 'Potential data extraction patterns detected', timestamp: '2024-08-13T09:17:00Z' },
    ],
    threats: ['Embedded macros', 'Data extraction patterns'],
  },
  {
    id: 'doc_004', name: 'Unknown_Source.pdf', type: 'pdf', size: 3145728,
    uploadDate: '2024-08-12T16:45:00Z', trustScore: 31, riskLevel: 'high', status: 'analyzed',
    uploadedBy: 'External Upload',
    findings: [
      { id: 'f5', type: 'Malware Scan', severity: 'critical', description: 'Suspicious payload detected in embedded objects', timestamp: '2024-08-12T16:46:00Z' },
      { id: 'f6', type: 'Content Analysis', severity: 'high', description: 'Prompt injection patterns found in text', timestamp: '2024-08-12T16:47:00Z' },
    ],
    threats: ['Malicious payload', 'Prompt injection in content', 'Untrusted source'],
  },
  {
    id: 'doc_005', name: 'Training_Manual.pdf', type: 'pdf', size: 4194304,
    uploadDate: '2024-08-11T11:00:00Z', trustScore: 94, riskLevel: 'trusted', status: 'analyzed',
    uploadedBy: 'Alex Morgan',
    findings: [{ id: 'f7', type: 'Content Analysis', severity: 'low', description: 'Clean training document', timestamp: '2024-08-11T11:01:00Z' }],
    threats: [],
  },
  {
    id: 'doc_006', name: 'Security_Audit.docx', type: 'docx', size: 1572864,
    uploadDate: '2024-08-10T08:30:00Z', trustScore: 91, riskLevel: 'trusted', status: 'analyzed',
    uploadedBy: 'Sarah Chen',
    findings: [],
    threats: [],
  },
  {
    id: 'doc_007', name: 'External_Data.csv', type: 'csv', size: 524288,
    uploadDate: '2024-08-09T13:20:00Z', trustScore: 67, riskLevel: 'moderate', status: 'analyzed',
    uploadedBy: 'James Wilson',
    findings: [
      { id: 'f8', type: 'Content Analysis', severity: 'medium', description: 'Contains URLs pointing to external resources', timestamp: '2024-08-09T13:21:00Z' },
    ],
    threats: ['External resource references'],
  },
  {
    id: 'doc_008', name: 'Malicious_Report.pdf', type: 'pdf', size: 2097152,
    uploadDate: '2024-08-08T15:10:00Z', trustScore: 12, riskLevel: 'blocked', status: 'blocked',
    uploadedBy: 'Unknown User',
    findings: [
      { id: 'f9', type: 'Malware Detection', severity: 'critical', description: 'Known malware signature detected', timestamp: '2024-08-08T15:11:00Z' },
      { id: 'f10', type: 'Injection Detection', severity: 'critical', description: 'Multiple prompt injection attempts embedded', timestamp: '2024-08-08T15:12:00Z' },
    ],
    threats: ['Malware signature', 'Prompt injection', 'Data exfiltration attempt'],
  },
  {
    id: 'doc_009', name: 'Product_Specs.pdf', type: 'pdf', size: 1835008,
    uploadDate: '2024-08-16T09:00:00Z', trustScore: 0, riskLevel: 'scanning', status: 'scanning',
    uploadedBy: 'Alex Morgan',
    findings: [],
    threats: [],
  },
];
