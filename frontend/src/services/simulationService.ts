/**
 * Simulation Service
 * TODO: Replace with FastAPI backend calls for real attack testing
 */

import { Attack, SimulationResult } from '../types';
import { mockAttacks } from '../data/mockAttacks';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const simulationResults: Record<string, Partial<SimulationResult>> = {
  prompt_injection: { status: 'blocked', riskScore: 94, threatType: 'Prompt Injection', action: 'Blocked — Input sanitized and rejected', explanation: 'The prompt risk analyzer detected instruction override patterns ("ignore previous instructions", "reveal system prompt"). The input was classified as a direct prompt injection attempt and blocked before reaching the RAG pipeline.' },
  jailbreak: { status: 'blocked', riskScore: 91, threatType: 'Jailbreak Attempt', action: 'Blocked — Persona manipulation detected', explanation: 'The jailbreak detection module identified persona manipulation patterns (DAN, unrestricted mode). Safety bypass attempts are blocked at the prompt analysis stage.' },
  malicious_document: { status: 'blocked', riskScore: 87, threatType: 'Malicious Document', action: 'Blocked — Document quarantined', explanation: 'The document security analyzer detected hidden instruction payloads embedded within the document content. The document was quarantined and excluded from the retrieval index.' },
  prompt_leakage: { status: 'blocked', riskScore: 82, threatType: 'Prompt Leakage', action: 'Blocked — System prompt protected', explanation: 'The prompt leakage protection module detected an attempt to extract system instructions. The request was blocked and the system prompt remains confidential.' },
  unsafe_output: { status: 'blocked', riskScore: 89, threatType: 'Unsafe Output', action: 'Blocked — Sensitive data filtered', explanation: 'The response validator detected patterns consistent with sensitive data (SSNs, credit cards, passwords) in the requested output. The response was blocked before delivery.' },
};

export const simulationService = {
  async getAttackTemplates(): Promise<Attack[]> {
    await delay(300);
    return [...mockAttacks];
  },

  async runSimulation(attackType: string, _payload: string): Promise<SimulationResult> {
    await delay(2000 + Math.random() * 1000);

    const base = simulationResults[attackType] || simulationResults.prompt_injection;
    return {
      status: base.status || 'blocked',
      riskScore: base.riskScore || 90,
      threatType: base.threatType || 'Unknown',
      action: base.action || 'Blocked',
      explanation: base.explanation || 'Threat detected and blocked.',
      detectionTime: Math.floor(Math.random() * 200) + 50,
    };
  },
};
