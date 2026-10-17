/**
 * Document Service
 * Integrates with SecureRAG FastAPI Document Ingestion & Management APIs
 */

import { Document } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001/api/v1').replace(/\/$/, '');

function getToken(): string | null {
  return localStorage.getItem('securerag_access_token') || sessionStorage.getItem('securerag_access_token');
}

function mapDocument(data: any): Document {
  const isCompleted = data.status === 'completed' || data.processing_status === 'completed';
  return {
    id: String(data.id),
    name: data.name || data.filename || 'Unnamed Document',
    type: (data.type || data.file_type || 'pdf') as Document['type'],
    size: Number(data.size || data.file_size || 0),
    uploadDate: data.uploadDate || data.created_at || new Date().toISOString(),
    trustScore: data.trustScore !== undefined ? data.trustScore : (data.trust_score !== undefined ? data.trust_score : 0),
    riskLevel: (data.riskLevel || data.risk_level || 'scanning') as Document['riskLevel'],
    status: (isCompleted ? 'analyzed' : (data.status || data.processing_status || 'analyzed')) as Document['status'],
    uploadedBy: data.uploadedBy || (data.uploader_id ? `User #${data.uploader_id}` : 'You'),
    findings: Array.isArray(data.findings) ? data.findings : [],
    threats: Array.isArray(data.threats) ? data.threats : [],
  };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = 'Request failed';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch {
      // fallback
    }
    throw new Error(errorDetail);
  }

  return response.json() as Promise<T>;
}

export const documentService = {
  async getDocuments(): Promise<Document[]> {
    const data = await request<any[]>('/documents');
    return data.map(mapDocument);
  },

  async getDocument(id: string): Promise<Document | null> {
    try {
      const data = await request<any>(`/documents/${id}`);
      return mapDocument(data);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return null;
      }
      throw error;
    }
  },

  async uploadDocument(file: File): Promise<Document> {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      let errorDetail = 'Upload failed';
      try {
        const errJson = await response.json();
        errorDetail = errJson.detail || errJson.message || errorDetail;
      } catch {
        // fallback
      }
      throw new Error(errorDetail);
    }

    const data = await response.json();
    return mapDocument(data);
  },

  async deleteDocument(id: string): Promise<void> {
    await request<void>(`/documents/${id}`, {
      method: 'DELETE',
    });
  },

  async searchDocuments(query: string): Promise<Document[]> {
    const docs = await this.getDocuments();
    const q = query.toLowerCase();
    return docs.filter(d => d.name.toLowerCase().includes(q) || d.type.includes(q));
  },

  async filterByRisk(riskLevel: string): Promise<Document[]> {
    const docs = await this.getDocuments();
    if (riskLevel === 'all') return docs;
    return docs.filter(d => d.riskLevel === riskLevel);
  },
};
