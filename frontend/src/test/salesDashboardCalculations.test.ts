import { describe, it, expect } from 'vitest';
import {
  calculateOpenLeads,
  calculateLeadConversion,
  calculateProposalConversion,
  calculateContractConversion,
  calculateOverallConversion,
  calculateProposalWinRate,
  calculateWeightedPipeline,
  calculateContractedValue,
  formatPercentage,
  formatCurrencyINR,
  formatDecimal,
} from '../features/sales-dashboard/utils/calculations';

describe('Sales Dashboard Calculations Utility', () => {
  describe('1. Open Leads Calculation', () => {
    it('calculates Open Leads = Total Leads - Won Leads - Lost Leads', () => {
      expect(calculateOpenLeads(100, 20, 30)).toBe(50);
      expect(calculateOpenLeads(997, 0, 997)).toBe(0);
    });

    it('prevents negative values if lost + won exceeds total leads', () => {
      expect(calculateOpenLeads(50, 40, 20)).toBe(0);
    });
  });

  describe('2. Lead Conversion (Lead -> Opportunity)', () => {
    it('calculates Lead Conversion = Opportunities / Leads * 100', () => {
      expect(calculateLeadConversion(997, 997)).toBe(100);
      expect(calculateLeadConversion(50, 100)).toBe(50);
    });

    it('guards against division by zero', () => {
      expect(calculateLeadConversion(10, 0)).toBe(0);
      expect(calculateLeadConversion(0, 0)).toBe(0);
    });
  });

  describe('3. Proposal Conversion (Opportunity -> Proposal)', () => {
    it('calculates Proposal Conversion = Proposals / Opportunities * 100', () => {
      expect(calculateProposalConversion(25, 100)).toBe(25);
      expect(calculateProposalConversion(0, 997)).toBe(0);
    });

    it('guards against division by zero', () => {
      expect(calculateProposalConversion(5, 0)).toBe(0);
    });
  });

  describe('4. Contract Conversion (Proposal -> Contract)', () => {
    it('calculates Contract Conversion = Contracts / Proposals * 100', () => {
      expect(calculateContractConversion(10, 20)).toBe(50);
    });

    it('guards against division by zero when proposals are 0', () => {
      expect(calculateContractConversion(0, 0)).toBe(0);
      expect(calculateContractConversion(5, 0)).toBe(0);
    });
  });

  describe('5. Overall Conversion (Contracts / Leads)', () => {
    it('calculates Overall Conversion = Contracts / Leads * 100', () => {
      expect(calculateOverallConversion(10, 100)).toBe(10);
      expect(calculateOverallConversion(0, 997)).toBe(0);
    });

    it('guards against division by zero when leads are 0', () => {
      expect(calculateOverallConversion(5, 0)).toBe(0);
    });
  });

  describe('6. Proposal Win Rate (Accepted Proposals / Total Proposals)', () => {
    it('calculates Proposal Win Rate = Accepted Proposals / Total Proposals * 100', () => {
      expect(calculateProposalWinRate(3, 10)).toBe(30);
    });

    it('guards against division by zero', () => {
      expect(calculateProposalWinRate(0, 0)).toBe(0);
    });
  });

  describe('7. Weighted Pipeline (Sum of Opportunity Value * Probability)', () => {
    it('calculates sum of (value * probability) correctly', () => {
      const opps = [
        { value: 100000, probability: 0.5 },
        { value: 200000, probability: 0.25 },
        { value: 300000, probability: 1.0 },
      ];
      // 50,000 + 50,000 + 300,000 = 400,000
      expect(calculateWeightedPipeline(opps)).toBe(400000);
    });

    it('returns 0 for empty list', () => {
      expect(calculateWeightedPipeline([])).toBe(0);
    });
  });

  describe('8. Contracted Value (Sum of active contract values)', () => {
    it('sums active contract values and ignores inactive ones', () => {
      const contracts = [
        { value: 150000, isActive: true },
        { value: 50000, isActive: false },
        { value: 250000, isActive: true },
      ];
      expect(calculateContractedValue(contracts)).toBe(400000);
    });

    it('returns 0 for empty list', () => {
      expect(calculateContractedValue([])).toBe(0);
    });
  });

  describe('Formatting Utilities', () => {
    it('formats percentages to 2 decimals', () => {
      expect(formatPercentage(100)).toBe('100.00%');
      expect(formatPercentage(0)).toBe('0.00%');
      expect(formatPercentage(33.3333)).toBe('33.33%');
      expect(formatPercentage(NaN)).toBe('0.00%');
    });

    it('formats Indian Rupee currency correctly', () => {
      expect(formatCurrencyINR(0)).toBe('₹ 0.00');
      expect(formatCurrencyINR(150000)).toBe('₹ 1,50,000.00');
      expect(formatCurrencyINR(5285000)).toBe('₹ 52,85,000.00');
      expect(formatCurrencyINR(NaN)).toBe('₹ 0.00');
    });

    it('formats decimal numbers to 2 places', () => {
      expect(formatDecimal(997)).toBe('997.00');
      expect(formatDecimal(0)).toBe('0.00');
      expect(formatDecimal(12.345)).toBe('12.35');
    });
  });
});

