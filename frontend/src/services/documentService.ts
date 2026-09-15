/**
 * Document Service
 * TODO: Replace with FastAPI/Firebase backend calls
 */

import { Document } from '../types';
import { mockDocuments } from '../data/mockDocuments';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
let documents = [...mockDocuments];

export const documentService = {
  async getDocuments(): Promise<Document[]> {
    await delay(500);
    return [...documents];
  },

  async getDocument(id: string): Promise<Document | null> {
    await delay(300);
    return documents.find(d => d.id === id) || null;
  },

  async uploadDocument(file: File): Promise<Document> {
    await delay(2000);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
    const type = (['pdf', 'docx', 'txt', 'csv'].includes(ext) ? ext : 'pdf') as Document['type'];
    const newDoc: Document = {
      id: `doc_${Date.now()}`,
      name: file.name,
      type,
      size: file.size,
      uploadDate: new Date().toISOString(),
      trustScore: 0,
      riskLevel: 'scanning',
      status: 'scanning',
      uploadedBy: 'Alex Morgan',
      findings: [],
      threats: [],
    };
    documents = [newDoc, ...documents];

    // Simulate analysis completing after 3 seconds
    setTimeout(() => {
      const score = Math.floor(Math.random() * 60) + 40;
      const idx = documents.findIndex(d => d.id === newDoc.id);
      if (idx >= 0) {
        documents[idx] = {
          ...documents[idx],
          trustScore: score,
          riskLevel: score >= 85 ? 'trusted' : score >= 60 ? 'moderate' : 'high',
          status: 'analyzed',
          findings: score < 60 ? [{ id: `f_${Date.now()}`, type: 'Security Scan', severity: 'high', description: 'Potential security concerns detected', timestamp: new Date().toISOString() }] : [],
        };
      }
    }, 3000);

    return newDoc;
  },

  async deleteDocument(id: string): Promise<void> {
    await delay(500);
    documents = documents.filter(d => d.id !== id);
  },

  async searchDocuments(query: string): Promise<Document[]> {
    await delay(300);
    const q = query.toLowerCase();
    return documents.filter(d => d.name.toLowerCase().includes(q) || d.type.includes(q));
  },

  async filterByRisk(riskLevel: string): Promise<Document[]> {
    await delay(200);
    if (riskLevel === 'all') return [...documents];
    return documents.filter(d => d.riskLevel === riskLevel);
  },
};
