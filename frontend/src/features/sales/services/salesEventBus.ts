/**
 * Event bus for notifying sales dashboards and related components
 * whenever sales records (leads, opportunities, proposals, contracts)
 * are created, updated, or deleted.
 */
export const SALES_DATA_CHANGED_EVENT = 'cms_sales_data_changed';

export function triggerSalesDataRefresh(
  type: 'lead' | 'opportunity' | 'proposal' | 'contract' = 'lead'
): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(SALES_DATA_CHANGED_EVENT, { detail: { type, timestamp: Date.now() } })
    );
  }
}
