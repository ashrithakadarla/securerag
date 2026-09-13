/**
 * Chat Service
 * TODO: Replace mock responses with FastAPI RAG backend calls
 */

import { ChatMessage, ChatConversation } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mockResponses = [
  { content: 'Based on the HR Policy document (Trust Score: 96), employees are eligible for 15 days of paid vacation annually, plus 10 public holidays. Part-time employees receive prorated benefits.', docs: 3, risk: 5 },
  { content: 'The Q3 Financial Report shows revenue of $12.4M, a 15% increase from Q2. Operating expenses were $8.1M. The company\'s security infrastructure investment increased by 23%.', docs: 2, risk: 3 },
  { content: 'According to the Training Manual, the onboarding process consists of 5 phases: orientation (Week 1), technical training (Weeks 2-3), shadowing (Week 4), independent work (Weeks 5-6), and performance review (Week 7).', docs: 4, risk: 2 },
  { content: 'The Company Rules document outlines the code of conduct policy. Key points include: data confidentiality requirements, acceptable use of company resources, conflict of interest disclosure, and anti-harassment policies.', docs: 2, risk: 8 },
  { content: 'The security audit from August 2024 identified 3 low-severity findings: outdated SSL certificates on staging servers, missing MFA on 2 admin accounts, and insufficient logging on the document upload endpoint. All items were remediated within 48 hours.', docs: 1, risk: 4 },
];

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
    await delay(1500 + Math.random() * 1500);

    const response = mockResponses[Math.floor(Math.random() * mockResponses.length)];
    const assistantMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content: response.content,
      timestamp: new Date().toISOString(),
      securityStatus: 'safe',
      riskScore: response.risk,
      retrievedDocs: response.docs,
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
