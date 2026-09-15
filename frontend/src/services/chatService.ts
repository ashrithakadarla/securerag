/**
 * Chat Service
 */

import { ChatMessage, ChatConversation } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001/api/v1').replace(/\/$/, '');

interface ChatResponse {
  answer: string;
  status: string;
  risk_score: number;
}

let conversations: ChatConversation[] = [
  {
    id: 'conv_001', title: 'HR Policy Questions', createdAt: '2024-08-15T10:00:00Z', updatedAt: '2024-08-15T10:05:00Z',
    messages: [
      { id: 'msg_001', role: 'user', content: 'What is the vacation policy?', timestamp: '2024-08-15T10:00:00Z', securityStatus: 'safe', riskScore: 2 },
      { id: 'msg_002', role: 'assistant', content: 'Based on the HR Policy document (Trust Score: 96), employees are eligible for 15 days of paid vacation annually, plus 10 public holidays.', timestamp: '2024-08-15T10:00:05Z', securityStatus: 'safe', riskScore: 2, retrievedDocs: 3, responseValidated: true },
    ],
  },
  {
    id: 'conv_002', title: 'Financial Report Summary', createdAt: '2024-08-14T14:00:00Z', updatedAt: '2024-08-14T14:03:00Z',
    messages: [
      { id: 'msg_003', role: 'user', content: 'Summarize the Q3 financial report.', timestamp: '2024-08-14T14:00:00Z', securityStatus: 'safe', riskScore: 3 },
      { id: 'msg_004', role: 'assistant', content: 'The Q3 Financial Report shows revenue of $12.4M, a 15% increase from Q2.', timestamp: '2024-08-14T14:00:04Z', securityStatus: 'safe', riskScore: 3, retrievedDocs: 2, responseValidated: true },
    ],
  },
];

export const chatService = {
  async getConversations(): Promise<ChatConversation[]> {
    await delay(300);
    return [...conversations];
  },

  async getConversation(id: string): Promise<ChatConversation | null> {
    await delay(200);
    return conversations.find(c => c.id === id) || null;
  },

  async createConversation(): Promise<ChatConversation> {
    await delay(200);
    const conv: ChatConversation = {
      id: `conv_${Date.now()}`,
      title: 'New Conversation',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    conversations = [conv, ...conversations];
    return conv;
  },

  async sendMessage(conversationId: string, content: string): Promise<ChatMessage> {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: content }),
    });

    if (!response.ok) {
      throw new Error('Unable to process chat request. Please try again.');
    }

    const chatResponse = await response.json() as ChatResponse;
    console.log('[SecureRAG] Chat API URL:', `${API_BASE_URL}/chat`);
    console.log('[SecureRAG] Chat API status:', response.status);
    console.log('[SecureRAG] Chat API response:', chatResponse);
    const assistantMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content: chatResponse.answer,
      timestamp: new Date().toISOString(),
      securityStatus: chatResponse.status === 'BLOCKED'
        ? 'blocked'
        : chatResponse.status === 'SAFE' ? 'safe' : 'warning',
      riskScore: chatResponse.risk_score,
      responseValidated: true,
    };

    const conv = conversations.find(c => c.id === conversationId);
    if (conv) {
      conv.messages.push(assistantMessage);
      conv.updatedAt = new Date().toISOString();
      if (conv.messages.length <= 2) {
        conv.title = content.slice(0, 40) + (content.length > 40 ? '...' : '');
      }
    }

    return assistantMessage;
  },

  async deleteConversation(id: string): Promise<void> {
    await delay(300);
    conversations = conversations.filter(c => c.id !== id);
  },

  async clearConversation(id: string): Promise<void> {
    await delay(200);
    const conv = conversations.find(c => c.id === id);
    if (conv) { conv.messages = []; }
  },
};
