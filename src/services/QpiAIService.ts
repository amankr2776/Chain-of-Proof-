/**
 * QpiAIService: Frontend client module for QpiAI API communication.
 * Handles optimization requests with fallback mechanism detection.
 */

import { apiFetch } from './apiClient';

export interface QpiAiOptimizationResponse {
  success: boolean;
  fallback?: boolean;
  [key: string]: any;
}

export class QpiAIService {
  private static async post<T = any>(endpoint: string, body: any): Promise<T> {
    const response = await apiFetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (data.fallback) {
      console.warn(`[QpiAIService] ${endpoint} executing in FALLBACK mode.`);
    }

    if (!response.ok) {
      throw new Error(data.error || 'Optimization task failed');
    }

    return data;
  }

  static async runDisposition(batteryIds: string[], marketDemandLimit: number) {
    return this.post<QpiAiOptimizationResponse>('/api/optimization/disposition', {
      batteryIds,
      marketDemandLimit,
    });
  }

  static async runDispatch(batchId: string, massKg: number, chemistry: string) {
    return this.post<QpiAiOptimizationResponse>('/api/optimization/dispatch', {
      batchId,
      batchMassKg: massKg,
      batchChemistry: chemistry,
    });
  }
}
