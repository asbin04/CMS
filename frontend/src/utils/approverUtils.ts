/**
 * Approver options for authorized management approval workflows
 * (Akshit Ujjain, Gaurav Tripathy, Asbin T S)
 */
export const AUTHORIZED_APPROVERS = [
  'Akshit Ujjain',
  'Gaurav Tripathy',
  'Asbin T S',
] as const;

export type AuthorizedApprover = typeof AUTHORIZED_APPROVERS[number];

/**
 * Resolves the display name of the current authenticated approver from local/session storage.
 * Defaults to the logged in admin user (Akshit Ujjain, Gaurav Tripathy, or Asbin T S).
 */
export function getCurrentApproverName(): string {
  if (typeof window === 'undefined' || !window.localStorage) {
    return 'Akshit Ujjain';
  }

  const storedName = localStorage.getItem('auth_user_name');
  const storedEmail = localStorage.getItem('auth_user_email');
  const storedUsername = localStorage.getItem('auth_user_username');

  const normalize = (val: string | null): string | null => {
    if (!val || val === '—' || val === '-') return null;
    const lower = val.toLowerCase().trim();
    if (lower.includes('asbin') || lower.includes('aasbin')) {
      return 'Asbin T S';
    }
    if (lower.includes('gaurav') || lower.includes('tripath')) {
      return 'Gaurav Tripathy';
    }
    if (lower.includes('akshit') || lower.includes('ujjain')) {
      return 'Akshit Ujjain';
    }
    return val.trim();
  };

  const byName = normalize(storedName);
  if (byName) return byName;

  const byEmail = normalize(storedEmail);
  if (byEmail) return byEmail;

  const byUsername = normalize(storedUsername);
  if (byUsername) return byUsername;

  return 'Akshit Ujjain';
}
