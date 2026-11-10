export const formatRupee = (amount: number | undefined | null, includeDecimals = false): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return includeDecimals ? '₹ 0.00' : '₹ 0';
  }
  const rounded = Math.round(amount * 100) / 100;
  if (includeDecimals) {
    const parts = rounded.toFixed(2).split('.');
    const integerPart = parseInt(parts[0], 10).toLocaleString('en-IN');
    return `₹ ${integerPart}.${parts[1]}`;
  }
  return '₹ ' + Math.round(amount).toLocaleString('en-IN');
};

export const parseRupee = (val: string | number | undefined | null): number => {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const cleaned = val.toString().replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

export const formatHours = (hours: number | undefined | null): string => {
  if (hours === undefined || hours === null || isNaN(hours)) return '0.00';
  const parts = hours.toFixed(2).split('.');
  const integerPart = parseInt(parts[0], 10).toLocaleString('en-IN');
  return `${integerPart}.${parts[1]}`;
};

export const formatDateForDisplay = (dateInput: string | Date | undefined | null): string => {
  if (!dateInput) return '-';
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput.trim())) {
    const [y, m, d] = dateInput.trim().split('-').map(Number);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d} ${months[m - 1]} ${y}`;
  }
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);
  const day = d.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
};

export const formatDateForInput = (dateInput?: string | Date | null): string => {
  if (!dateInput) {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput.trim())) {
    return dateInput.trim();
  }
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

