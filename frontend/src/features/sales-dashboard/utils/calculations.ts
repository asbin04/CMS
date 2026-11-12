/**
 * Sales Dashboard Financial & Conversion Calculations Utility
 *
 * Implements the 8 required sales formulas with robust zero-denominator guards,
 * consistent 2-decimal percentage formatting, and Indian Rupee (INR) currency formatting.
 */

/**
 * 1. Calculate Open Leads:
 * Open Leads = Total Leads - Won Leads - Lost Leads
 */
export function calculateOpenLeads(
  totalLeads: number,
  wonLeads: number,
  lostLeads: number
): number {
  return Math.max(0, totalLeads - wonLeads - lostLeads);
}

/**
 * 2. Calculate Lead Conversion:
 * Lead Conversion = (Opportunities / Leads) × 100
 */
export function calculateLeadConversion(
  opportunities: number,
  leads: number
): number {
  if (leads <= 0) return 0;
  return (opportunities / leads) * 100;
}

/**
 * 3. Calculate Proposal Conversion:
 * Proposal Conversion = (Proposals / Opportunities) × 100
 */
export function calculateProposalConversion(
  proposals: number,
  opportunities: number
): number {
  if (opportunities <= 0) return 0;
  return (proposals / opportunities) * 100;
}

/**
 * 4. Calculate Contract Conversion:
 * Contract Conversion = (Contracts / Proposals) × 100
 */
export function calculateContractConversion(
  contracts: number,
  proposals: number
): number {
  if (proposals <= 0) return 0;
  return (contracts / proposals) * 100;
}

/**
 * 5. Calculate Overall Conversion:
 * Overall Conversion = (Contracts / Leads) × 100
 */
export function calculateOverallConversion(
  contracts: number,
  leads: number
): number {
  if (leads <= 0) return 0;
  return (contracts / leads) * 100;
}

/**
 * 6. Calculate Proposal Win Rate:
 * Proposal Win Rate = (Accepted Proposals / Total Proposals) × 100
 */
export function calculateProposalWinRate(
  acceptedProposals: number,
  totalProposals: number
): number {
  if (totalProposals <= 0) return 0;
  return (acceptedProposals / totalProposals) * 100;
}

/**
 * 7. Calculate Weighted Pipeline:
 * Weighted Pipeline = Sum of (Opportunity Value × Probability)
 */
export function calculateWeightedPipeline(
  opportunities: Array<{ value: number; probability: number }>
): number {
  if (!opportunities || opportunities.length === 0) return 0;
  return opportunities.reduce((sum, item) => {
    const val = Number(item.value) || 0;
    const prob = Number(item.probability) || 0;
    return sum + val * prob;
  }, 0);
}

/**
 * 8. Calculate Contracted Value:
 * Contracted Value = Sum of active contract values
 */
export function calculateContractedValue(
  contracts: Array<{ value: number; isActive?: boolean }>
): number {
  if (!contracts || contracts.length === 0) return 0;
  return contracts.reduce((sum, item) => {
    if (item.isActive === false) return sum;
    return sum + (Number(item.value) || 0);
  }, 0);
}

/**
 * Format a number to percentage with 2 decimals (e.g. 100.00% or 0.00%)
 */
export function formatPercentage(val: number): string {
  if (isNaN(val) || !isFinite(val)) return '0.00%';
  return `${val.toFixed(2)}%`;
}

/**
 * Format a currency number in Indian Rupees format (e.g. ₹ 0.00 or ₹ 1,50,000.00)
 */
export function formatCurrencyINR(val: number): string {
  if (isNaN(val) || !isFinite(val) || val === 0) return '₹ 0.00';
  
  // Format with standard Indian numbering (lakhs/crores)
  const parts = val.toFixed(2).split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];

  const lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  const formattedInteger =
    otherNumbers !== ''
      ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree
      : lastThree;

  return `₹ ${formattedInteger}.${decimalPart}`;
}

/**
 * Format a decimal number with 2 decimal places (e.g. 997.00, 0.00)
 */
export function formatDecimal(val: number): string {
  if (isNaN(val) || !isFinite(val)) return '0.00';
  return val.toFixed(2);
}

