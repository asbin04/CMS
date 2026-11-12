import { SalesDashboardData } from '../types';

/**
 * Builds standard CSV content from the Sales Dashboard data.
 */
export function buildSalesDashboardCsv(data: SalesDashboardData): string {
  const lines: string[] = [];

  // Metadata Header
  lines.push('KALPANAAA CMS - Sales Performance & Pipeline Report');
  lines.push(`Period,${data.period}`);
  lines.push(`Exported At,${new Date().toLocaleString('en-IN')}`);
  lines.push(`Last Data Update,${data.lastUpdated}`);
  lines.push('');

  // 1. Dashboard KPI Cards
  lines.push('--- DASHBOARD SUMMARY KPIS ---');
  lines.push('KPI Metric,Value');
  lines.push(`Total Leads,${data.kpis.totalLeads}`);
  lines.push(`Total Opportunities,${data.kpis.totalOpportunities}`);
  lines.push(`Total Proposals (Value),${data.kpis.formattedProposalsValue}`);
  lines.push(`Active Contracts,${data.kpis.activeContracts}`);
  lines.push('');

  // 2. Leads Performance
  lines.push('--- LEADS PERFORMANCE ---');
  lines.push('Metric,Value');
  lines.push(`Total Leads,${data.performance.leads.formattedTotalLeads}`);
  lines.push(`Open Leads,${data.performance.leads.formattedOpenLeads}`);
  lines.push(`Won Leads,${data.performance.leads.formattedWonLeads}`);
  lines.push(`Lead -> Won %,${data.performance.leads.formattedLeadWonPct}`);
  lines.push('');

  // 3. Opportunities Performance
  lines.push('--- OPPORTUNITIES PERFORMANCE ---');
  lines.push('Metric,Value');
  lines.push(`Total Opportunities,${data.performance.opportunities.formattedTotalOpportunities}`);
  lines.push(`Open Opportunities,${data.performance.opportunities.formattedOpenOpportunities}`);
  lines.push(`Pipeline Value,${data.performance.opportunities.formattedPipelineValue}`);
  lines.push(`Weighted Pipeline,${data.performance.opportunities.formattedWeightedPipeline}`);
  lines.push(`Won Opportunity Value,${data.performance.opportunities.formattedWonOpportunityValue}`);
  lines.push('');

  // 4. Proposal Performance
  lines.push('--- PROPOSAL PERFORMANCE ---');
  lines.push('Metric,Value');
  lines.push(`Total Proposal Value,${data.performance.proposals.formattedTotalProposalValue}`);
  lines.push(`Accepted Proposal Value,${data.performance.proposals.formattedAcceptedProposalValue}`);
  lines.push(`Proposal Win Rate,${data.performance.proposals.formattedProposalWinRate}`);
  lines.push('');

  // 5. Contract Performance
  lines.push('--- CONTRACT PERFORMANCE ---');
  lines.push('Metric,Value');
  lines.push(`Active Contracts,${data.performance.contracts.formattedActiveContracts}`);
  lines.push(`Contracted Value,${data.performance.contracts.formattedContractedValue}`);
  lines.push('');

  // 6. Sales Conversion Funnel & Overview
  lines.push('--- SALES CONVERSION FUNNEL ---');
  lines.push('Stage,Count');
  data.funnelStages.forEach((s) => {
    lines.push(`${s.sublabel || s.label},${s.value}`);
  });
  lines.push('');
  lines.push('Conversion Rate,Percentage');
  lines.push(`Lead -> Opportunity,${data.conversion.leadToOpportunity}`);
  lines.push(`Opportunity -> Proposal,${data.conversion.opportunityToProposal}`);
  lines.push(`Proposal -> Contract,${data.conversion.proposalToContract}`);
  lines.push(`Overall Conversion,${data.conversion.overallConversion}`);
  lines.push('');

  return lines.join('\n');
}

/**
 * Triggers a browser download of the sales dashboard CSV file.
 */
export function exportSalesDashboardCsv(
  data: SalesDashboardData,
  filename = 'sales-dashboard-report.csv'
): void {
  const csvContent = buildSalesDashboardCsv(data);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

