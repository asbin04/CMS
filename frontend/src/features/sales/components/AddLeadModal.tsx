import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  ChevronDown,
} from 'lucide-react';
import { Lead, LeadSource, ServiceInterest, LeadStage, LeadStatus } from '../types/leads';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (leadData: Omit<Lead, 'id' | 'leadDate'>) => Promise<void> | void;
  initialData?: Lead | null;
}

export const validateCompanyName = (rawCompany: string): string => {
  const trimmed = rawCompany.trim();
  if (!trimmed) {
    return 'Company name is required';
  }
  // Must contain letters, allows numbers, spaces, and common business symbols
  const companyRegex = /^(?=.*[\p{L}])[\p{L}0-9\s.'&/()#,-]+$/u;
  if (!companyRegex.test(trimmed)) {
    return 'Enter a valid company name containing letters.';
  }
  return '';
};

export const validateContactPersonName = (rawName: string): string => {
  const trimmed = rawName.trim();
  if (!trimmed) {
    return 'Contact name is required';
  }
  // Must reject numbers and invalid special characters.
  // Allowed: Letters (Unicode), spaces, periods, apostrophes, hyphens
  const nameRegex = /^(?=.*[\p{L}])[\p{L}\s.'-]+$/u;
  if (!nameRegex.test(trimmed) || /\d/.test(trimmed)) {
    return 'Enter a valid contact person name.';
  }
  return '';
};

export const validateCountry = (rawCountry: string): string => {
  const trimmed = rawCountry.trim();
  if (!trimmed) {
    return 'Country is required';
  }
  return '';
};

export const validateCity = (rawCity: string): string => {
  const trimmed = rawCity.trim();
  if (!trimmed) {
    return 'City is required';
  }
  return '';
};

export const validateEstimatedValue = (rawValue: string): string => {
  const trimmed = rawValue.trim();
  if (!trimmed) return '';
  if (!/^\d+(\.\d+)?$/.test(trimmed)) {
    return 'Enter a valid non-negative number.';
  }
  const num = Number(trimmed);
  if (isNaN(num) || num < 0) {
    return 'Enter a valid non-negative number.';
  }
  return '';
};

export const validateNextFollowUp = (rawDate: string): string => {
  const trimmed = rawDate.trim();
  if (!trimmed) return '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return 'Enter a valid date.';
  }
  const d = new Date(trimmed);
  if (isNaN(d.getTime())) {
    return 'Enter a valid date.';
  }
  return '';
};

export const validatePhoneNumber = (rawPhone: string): string => {
  const trimmed = rawPhone.trim();
  if (!trimmed) {
    return 'Phone number is required';
  }
  // Exactly 10 digits, starts with 6-9, no letters, no symbols, no spaces, no hyphens, no country codes
  const indianMobileRegex = /^[6-9]\d{9}$/;
  if (!indianMobileRegex.test(trimmed)) {
    return 'Enter a valid 10-digit Indian mobile number.';
  }
  return '';
};

export const EMAIL_DOMAIN_TYPOS: Record<string, string> = {
  // Gmail typos
  'gmil.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gmal.com': 'gmail.com',
  'gmaik.com': 'gmail.com',
  'gemail.com': 'gmail.com',
  'gil.com': 'gmail.com',
  'gmail.con': 'gmail.com',
  'gmail.co': 'gmail.com',
  'gmail.cm': 'gmail.com',
  'gmaio.com': 'gmail.com',
  'gmaol.com': 'gmail.com',
  'gmeil.com': 'gmail.com',
  'gmsil.com': 'gmail.com',
  'gml.com': 'gmail.com',
  'gml.co': 'gmail.com',
  'gmaill.con': 'gmail.com',
  'gmai.con': 'gmail.com',
  'gmil.con': 'gmail.com',

  // Yahoo typos
  'yaho.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'yaho.co': 'yahoo.com',
  'yaho.in': 'yahoo.in',
  'yahoo.con': 'yahoo.com',
  'yaho.con': 'yahoo.com',
  'yahoou.com': 'yahoo.com',

  // Hotmail / Outlook typos
  'hotmial.com': 'hotmail.com',
  'hotmai.com': 'hotmail.com',
  'hotamail.com': 'hotmail.com',
  'hotmail.con': 'hotmail.com',
  'outlok.com': 'outlook.com',
  'outloo.com': 'outlook.com',
  'ootlook.com': 'outlook.com',
  'outlook.con': 'outlook.com',

  // iCloud typos
  'iclud.com': 'icloud.com',
  'iclou.com': 'icloud.com',
  'icloud.con': 'icloud.com',
};

export const calculateLevenshteinDistance = (a: string, b: string): number => {
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[a.length][b.length];
};

export const getEmailDomainSuggestion = (domain: string): string | null => {
  if (!domain) return null;
  const clean = domain.trim().toLowerCase();
  if (EMAIL_DOMAIN_TYPOS[clean]) {
    return EMAIL_DOMAIN_TYPOS[clean];
  }
  const majorDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com'];
  for (const major of majorDomains) {
    if (clean === major) return null;
    if (clean === major.replace('.com', '.con')) {
      return major;
    }
    if (calculateLevenshteinDistance(clean, major) === 1) {
      return major;
    }
  }
  return null;
};

export const COMMON_TYPO_DOMAINS = new Set(Object.keys(EMAIL_DOMAIN_TYPOS));

export const validateEmailAddress = (rawEmail: string): string => {
  const trimmed = rawEmail.trim();
  if (!trimmed) {
    return 'Email address is required';
  }
  // Check for spaces anywhere
  if (/\s/.test(trimmed)) {
    return 'Enter a valid email address.';
  }
  // Reject consecutive dots anywhere (e.g. user..name@gmail.com or user@company..com)
  if (/\.\./.test(trimmed)) {
    return 'Enter a valid email address.';
  }
  // Must contain exactly one @ symbol
  const atParts = trimmed.split('@');
  if (atParts.length !== 2) {
    return 'Enter a valid email address.';
  }
  const [localPart, domain] = atParts;
  if (!localPart || !domain) {
    return 'Enter a valid email address.';
  }
  // Local part cannot start or end with dot
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return 'Enter a valid email address.';
  }
  const localPartRegex = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*$/;
  if (!localPartRegex.test(localPart)) {
    return 'Enter a valid email address.';
  }

  // Domain must contain at least one dot separating labels
  const domainLabels = domain.split('.');
  if (domainLabels.length < 2) {
    return 'Enter a valid email address.';
  }

  // Each domain label must be non-empty, alphanumeric, and not start or end with hyphen
  for (let i = 0; i < domainLabels.length; i++) {
    const label = domainLabels[i];
    if (!label) {
      return 'Enter a valid email address.';
    }
    if (label.startsWith('-') || label.endsWith('-')) {
      return 'Enter a valid email address.';
    }
    if (!/^[a-zA-Z0-9-]+$/.test(label)) {
      return 'Enter a valid email address.';
    }
  }

  // Last label (TLD) must have at least 2 letters and consist solely of letters
  const tld = domainLabels[domainLabels.length - 1];
  if (tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) {
    return 'Enter a valid email address.';
  }

  // Suggest correction if domain is a known or close typo of popular providers
  const suggestion = getEmailDomainSuggestion(domain);
  if (suggestion) {
    return `Did you mean ${suggestion}?`;
  }

  return '';
};

export const AddLeadModal: React.FC<AddLeadModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [company, setCompany] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [source, setSource] = useState<LeadSource>('Website');
  const [serviceInterest, setServiceInterest] = useState<ServiceInterest>('Web Development');
  const [country, setCountry] = useState('India');
  const [city, setCity] = useState('');
  const [ownerId, setOwnerId] = useState('Akshit Ujjain (CEO)');
  const [stage, setStage] = useState<LeadStage>('New');
  const [status, setStatus] = useState<LeadStatus>('Active');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [nextFollowUp, setNextFollowUp] = useState('');
  const [notes, setNotes] = useState('');
  const [confirmedTypoEmail, setConfirmedTypoEmail] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setConfirmedTypoEmail(null);
      if (initialData) {
        setCompany(initialData.company || '');
        setContactName(initialData.contactName || '');
        setEmail(initialData.email || '');
        setPhone(initialData.phone || '');
        setSource((initialData.source as LeadSource) || 'Website');
        setServiceInterest((initialData.serviceInterest as ServiceInterest) || 'Web Development');
        setCountry(initialData.country || 'India');
        setCity(initialData.city || '');
        setOwnerId(initialData.ownerId || 'Akshit Ujjain (CEO)');
        setStage((initialData.stage as LeadStage) || 'New');
        setStatus((initialData.status as LeadStatus) || 'Active');
        setEstimatedValue(
          initialData.expectedValue != null
            ? String(initialData.expectedValue)
            : initialData.estimatedValue != null
            ? String(initialData.estimatedValue)
            : ''
        );
        setNextFollowUp(initialData.nextFollowUp || '');
        setNotes(initialData.notes || '');
      } else {
        setCompany('');
        setContactName('');
        setEmail('');
        setPhone('');
        setSource('Website');
        setServiceInterest('Web Development');
        setCountry('India');
        setCity('');
        setOwnerId('Akshit Ujjain (CEO)');
        setStage('New');
        setStatus('Active');
        setEstimatedValue('');
        setNextFollowUp('');
        setNotes('');
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const companyErr = validateCompanyName(company);
    if (companyErr) newErrors.company = companyErr;

    const contactNameErr = validateContactPersonName(contactName);
    if (contactNameErr) newErrors.contactName = contactNameErr;

    const emailErr = validateEmailAddress(email);
    if (emailErr) {
      if (emailErr.startsWith('Did you mean ') && confirmedTypoEmail === email.trim().toLowerCase()) {
        // User explicitly confirmed typo domain
      } else {
        newErrors.email = emailErr;
      }
    }

    const phoneErr = validatePhoneNumber(phone);
    if (phoneErr) newErrors.phone = phoneErr;

    const countryErr = validateCountry(country);
    if (countryErr) newErrors.country = countryErr;

    const cityErr = validateCity(city);
    if (cityErr) newErrors.city = cityErr;

    const estValErr = validateEstimatedValue(estimatedValue);
    if (estValErr) newErrors.estimatedValue = estValErr;

    const nextFollowUpErr = validateNextFollowUp(nextFollowUp);
    if (nextFollowUpErr) newErrors.nextFollowUp = nextFollowUpErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const numVal = estimatedValue.trim() ? Number(estimatedValue.trim()) : null;
      await onSubmit({
        company: company.trim(),
        contactName: contactName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        source,
        serviceInterest,
        country: country.trim(),
        city: city.trim(),
        ownerId,
        stage,
        status,
        estimatedValue: numVal,
        expectedValue: numVal,
        nextFollowUp: nextFollowUp.trim() || null,
        notes: notes.trim() || null,
        confirmTypoDomain: confirmedTypoEmail === email.trim().toLowerCase(),
      });

      // Reset fields
      setCompany('');
      setContactName('');
      setEmail('');
      setPhone('');
      setCity('');
      setEstimatedValue('');
      setNextFollowUp('');
      setNotes('');
      setErrors({});
      onClose();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'fieldErrors' in err) {
        const backendFieldErrors = (err as { fieldErrors?: Record<string, string> }).fieldErrors;
        if (backendFieldErrors && typeof backendFieldErrors === 'object') {
          setErrors((prev) => ({ ...prev, ...backendFieldErrors }));
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-2xl overflow-hidden animate-scale-up">
        {/* Modal Header */}
        <div className="px-6 pt-5 pb-1 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4F46E5] shrink-0">
              {initialData ? <Building2 size={18} /> : <Plus size={18} strokeWidth={2.2} />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {initialData ? 'Edit Lead' : 'Add New Lead'}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {initialData
                  ? `Update prospective enquiry details for ${initialData.id}`
                  : 'Record a new prospective client enquiry into the CRM pipeline'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form (No scrolling, completely visible) */}
        <form onSubmit={handleSubmit} className="px-6 pb-5 pt-1 flex flex-col gap-2.5">
          {/* Row 1: Company & Contact Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Company / Organization <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Enter company name"
                  value={company}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCompany(val);
                    if (errors.company) {
                      const err = validateCompanyName(val);
                      setErrors((prev) => ({ ...prev, company: err }));
                    }
                  }}
                  onBlur={() => {
                    const err = validateCompanyName(company);
                    setErrors((prev) => ({ ...prev, company: err }));
                  }}
                  className={`w-full pl-9 pr-3 h-[34px] bg-white border rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.company ? 'border-rose-400 ring-1 ring-rose-200' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.company && <p className="text-[10px] text-rose-500 mt-0.5">{errors.company}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Contact Person Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="e.g. Rajesh Kumar"
                  value={contactName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setContactName(val);
                    if (errors.contactName) {
                      const err = validateContactPersonName(val);
                      setErrors((prev) => ({ ...prev, contactName: err }));
                    } else if (val.trim()) {
                      const err = validateContactPersonName(val);
                      if (err) {
                        setErrors((prev) => ({ ...prev, contactName: err }));
                      }
                    }
                  }}
                  onBlur={() => {
                    const err = validateContactPersonName(contactName);
                    setErrors((prev) => ({ ...prev, contactName: err }));
                  }}
                  className={`w-full pl-9 pr-3 h-[34px] bg-white border rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.contactName ? 'border-rose-400 ring-1 ring-rose-200' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.contactName && <p className="text-[10px] text-rose-500 mt-0.5">{errors.contactName}</p>}
            </div>
          </div>

          {/* Row 2: Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEmail(val);
                    if (confirmedTypoEmail && val.trim().toLowerCase() !== confirmedTypoEmail) {
                      setConfirmedTypoEmail(null);
                    }
                    if (errors.email) {
                      const err = validateEmailAddress(val);
                      if (!err) {
                        setErrors((prev) => ({ ...prev, email: '' }));
                      } else if (err.startsWith('Did you mean ') && confirmedTypoEmail === val.trim().toLowerCase()) {
                        setErrors((prev) => ({ ...prev, email: '' }));
                      } else {
                        setErrors((prev) => ({ ...prev, email: err }));
                      }
                    }
                  }}
                  onBlur={() => {
                    if (email.trim()) {
                      const err = validateEmailAddress(email);
                      if (err) {
                        if (err.startsWith('Did you mean ') && confirmedTypoEmail === email.trim().toLowerCase()) {
                          setErrors((prev) => ({ ...prev, email: '' }));
                        } else {
                          setErrors((prev) => ({ ...prev, email: err }));
                        }
                      } else {
                        setErrors((prev) => ({ ...prev, email: '' }));
                      }
                    }
                  }}
                  className={`w-full pl-9 pr-3 h-[34px] bg-white border rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.email
                      ? errors.email.startsWith('Did you mean ')
                        ? 'border-amber-400 ring-1 ring-amber-200'
                        : 'border-rose-400 ring-1 ring-rose-200'
                      : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.email && (
                <div className="mt-1">
                  {errors.email.startsWith('Did you mean ') ? (
                    <div className="flex flex-wrap items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-md px-2 py-1 text-[11px] leading-tight">
                      <span className="text-amber-800 font-medium">{errors.email}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const parts = email.split('@');
                          const suggestion = getEmailDomainSuggestion(parts[1] || '');
                          if (parts.length === 2 && suggestion) {
                            const corrected = `${parts[0]}@${suggestion}`;
                            setEmail(corrected);
                            setConfirmedTypoEmail(null);
                            setErrors((prev) => ({ ...prev, email: '' }));
                          }
                        }}
                        className="text-indigo-600 hover:text-indigo-800 font-semibold underline cursor-pointer"
                      >
                        Yes, use {email.split('@')[0]}@{getEmailDomainSuggestion(email.split('@')[1] || '') || 'gmail.com'}
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmedTypoEmail(email.trim().toLowerCase());
                          setErrors((prev) => ({ ...prev, email: '' }));
                        }}
                        className="text-slate-500 hover:text-slate-700 underline cursor-pointer text-[10px]"
                      >
                        Keep as entered
                      </button>
                    </div>
                  ) : (
                    <p className="text-[10px] text-rose-500">{errors.email}</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="Enter 10-digit mobile number"
                  value={phone}
                  onKeyDown={(e) => {
                    // Allow navigation / control keys
                    if (
                      e.key === 'Backspace' ||
                      e.key === 'Delete' ||
                      e.key === 'Tab' ||
                      e.key === 'ArrowLeft' ||
                      e.key === 'ArrowRight' ||
                      e.key === 'Home' ||
                      e.key === 'End' ||
                      e.key === 'Enter' ||
                      e.key === 'Escape' ||
                      e.ctrlKey ||
                      e.metaKey
                    ) {
                      return;
                    }
                    // Prevent non-digit keys from being typed
                    if (!/^\d$/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onPaste={(e) => {
                    const pasteText = e.clipboardData.getData('text');
                    // Prevent pasting non-numeric characters
                    if (/\D/.test(pasteText)) {
                      e.preventDefault();
                      const digitsOnly = pasteText.replace(/\D/g, '');
                      if (digitsOnly) {
                        const target = e.currentTarget;
                        const start = target.selectionStart ?? phone.length;
                        const end = target.selectionEnd ?? phone.length;
                        const nextVal = (phone.slice(0, start) + digitsOnly + phone.slice(end)).slice(0, 10);
                        setPhone(nextVal);
                        const err = validatePhoneNumber(nextVal);
                        if (!err) {
                          setErrors((prev) => ({ ...prev, phone: '' }));
                        } else if (errors.phone || nextVal.length === 10) {
                          setErrors((prev) => ({ ...prev, phone: err }));
                        }
                      }
                    }
                  }}
                  onChange={(e) => {
                    const val = e.target.value.slice(0, 10);
                    setPhone(val);
                    if (errors.phone) {
                      const err = validatePhoneNumber(val);
                      if (!err) {
                        setErrors((prev) => ({ ...prev, phone: '' }));
                      } else if (val.length === 10) {
                        setErrors((prev) => ({ ...prev, phone: err }));
                      }
                    } else if (val.length === 10) {
                      const err = validatePhoneNumber(val);
                      if (err) {
                        setErrors((prev) => ({ ...prev, phone: err }));
                      }
                    }
                  }}
                  onBlur={() => {
                    if (phone.trim()) {
                      const err = validatePhoneNumber(phone);
                      if (err) {
                        setErrors((prev) => ({ ...prev, phone: err }));
                      } else {
                        setErrors((prev) => ({ ...prev, phone: '' }));
                      }
                    }
                  }}
                  className={`w-full pl-9 pr-3 h-[34px] bg-white border rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.phone ? 'border-rose-400 ring-1 ring-rose-200' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.phone && <p className="text-[10px] text-rose-500 mt-0.5">{errors.phone}</p>}
            </div>
          </div>

          {/* Row 3: Source & Service Interest */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Lead Source</label>
              <div className="relative">
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value as LeadSource)}
                  className="w-full appearance-none px-3 h-[34px] pr-8 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="Website">Website</option>
                  <option value="Referral">Referral</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Event">Event</option>
                  <option value="Cold Call">Cold Call</option>
                  <option value="Partner">Partner</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Other">Other</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Service Interest</label>
              <div className="relative">
                <select
                  value={serviceInterest}
                  onChange={(e) => setServiceInterest(e.target.value as ServiceInterest)}
                  className="w-full appearance-none px-3 h-[34px] pr-8 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="Web Development">Web Development</option>
                  <option value="Mobile App">Mobile App</option>
                  <option value="AI Solutions">AI Solutions</option>
                  <option value="ERP Solution">ERP Solution</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Digital Marketing">Digital Marketing</option>
                  <option value="Cloud & DevOps">Cloud & DevOps</option>
                  <option value="Custom Software">Custom Software</option>
                  <option value="UI/UX Design">UI/UX Design</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Row 4: Country & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Country <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Enter country"
                  value={country}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCountry(val);
                    if (errors.country) {
                      const err = validateCountry(val);
                      setErrors((prev) => ({ ...prev, country: err }));
                    }
                  }}
                  onBlur={() => {
                    const err = validateCountry(country);
                    setErrors((prev) => ({ ...prev, country: err }));
                  }}
                  className={`w-full pl-9 pr-3 h-[34px] bg-white border rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.country ? 'border-rose-400 ring-1 ring-rose-200' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.country && <p className="text-[10px] text-rose-500 mt-0.5">{errors.country}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                City <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter city"
                value={city}
                onChange={(e) => {
                  const val = e.target.value;
                  setCity(val);
                  if (errors.city) {
                    const err = validateCity(val);
                    setErrors((prev) => ({ ...prev, city: err }));
                  }
                }}
                onBlur={() => {
                  const err = validateCity(city);
                  setErrors((prev) => ({ ...prev, city: err }));
                }}
                className={`w-full px-3 h-[34px] bg-white border rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.city ? 'border-rose-400 ring-1 ring-rose-200' : 'border-slate-200'
                }`}
              />
              {errors.city && <p className="text-[10px] text-rose-500 mt-0.5">{errors.city}</p>}
            </div>
          </div>

          {/* Row 5: Lead Owner, Pipeline Stage, Status (3 equal columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Lead Owner</label>
              <div className="relative">
                <select
                  value={ownerId}
                  onChange={(e) => setOwnerId(e.target.value)}
                  className="w-full appearance-none px-2.5 h-[34px] pr-7 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer truncate"
                >
                  <option value="Akshit Ujjain (CEO)">Akshit Ujjain (CEO)</option>
                  <option value="Rajesh Sharma (Sales VP)">Rajesh Sharma (Sales VP)</option>
                  <option value="Ananya Roy (Account Exec)">Ananya Roy (Account Exec)</option>
                  <option value="Amit Patel (BDM)">Amit Patel (BDM)</option>
                  <option value="Neha Verma (Sales Mgr)">Neha Verma (Sales Mgr)</option>
                </select>
                <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Pipeline Stage</label>
              <div className="relative">
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value as LeadStage)}
                  className="w-full appearance-none px-2.5 h-[34px] pr-7 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Proposal Sent">Proposal Sent</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Won">Won</option>
                  <option value="Lost">Lost</option>
                </select>
                <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Status</label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as LeadStatus)}
                  className="w-full appearance-none px-2.5 h-[34px] pr-7 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Follow-up Required">Follow-up Required</option>
                  <option value="Converted">Converted</option>
                  <option value="Archived">Archived</option>
                  <option value="On Hold">On Hold</option>
                </select>
                <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Row 6: Estimated Value & Next Follow-up */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Estimated Deal Value</label>
              <div className="relative">
                <DollarSign size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Enter estimated value"
                  value={estimatedValue}
                  onKeyDown={(e) => {
                    if (
                      e.key === 'Backspace' ||
                      e.key === 'Delete' ||
                      e.key === 'Tab' ||
                      e.key === 'ArrowLeft' ||
                      e.key === 'ArrowRight' ||
                      e.key === 'Home' ||
                      e.key === 'End' ||
                      e.key === 'Enter' ||
                      e.key === 'Escape' ||
                      e.ctrlKey ||
                      e.metaKey
                    ) {
                      return;
                    }
                    if (!/[\d.]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEstimatedValue(val);
                    if (errors.estimatedValue) {
                      const err = validateEstimatedValue(val);
                      setErrors((prev) => ({ ...prev, estimatedValue: err }));
                    }
                  }}
                  onBlur={() => {
                    const err = validateEstimatedValue(estimatedValue);
                    setErrors((prev) => ({ ...prev, estimatedValue: err }));
                  }}
                  className={`w-full pl-9 pr-3 h-[34px] bg-white border rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.estimatedValue ? 'border-rose-400 ring-1 ring-rose-200' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.estimatedValue && <p className="text-[10px] text-rose-500 mt-0.5">{errors.estimatedValue}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Next Follow-up Date</label>
              <div className="relative">
                <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  placeholder="dd-mm-yyyy"
                  value={nextFollowUp}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNextFollowUp(val);
                    if (errors.nextFollowUp) {
                      const err = validateNextFollowUp(val);
                      setErrors((prev) => ({ ...prev, nextFollowUp: err }));
                    }
                  }}
                  onBlur={() => {
                    const err = validateNextFollowUp(nextFollowUp);
                    setErrors((prev) => ({ ...prev, nextFollowUp: err }));
                  }}
                  className={`w-full pl-9 pr-3 h-[34px] bg-white border rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer ${
                    errors.nextFollowUp ? 'border-rose-400 ring-1 ring-rose-200' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.nextFollowUp && <p className="text-[10px] text-rose-500 mt-0.5">{errors.nextFollowUp}</p>}
            </div>
          </div>

          {/* Row 7: Notes & Scope */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Lead Notes & Project Scope</label>
            <textarea
              rows={2}
              placeholder="Provide context regarding client requirements, tech preferences, or next steps..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 h-[50px] bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 h-[34px] bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 h-[34px] bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              {initialData ? (
                <span>Save Changes</span>
              ) : (
                <>
                  <Plus size={15} strokeWidth={2.2} />
                  <span>Create Lead</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
