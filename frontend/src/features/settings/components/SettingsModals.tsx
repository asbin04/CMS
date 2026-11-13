import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Eye,
  EyeOff,
  Shield,
  Monitor,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogOut,
  Camera,
  Trash2,
} from 'lucide-react';
import {
  ChangePasswordPayload,
  LoginHistoryItem,
  UpdateMfaPayload,
  UpdateProfilePayload,
  UserProfileSettings,
  UserSessionItem,
} from '../types/settings';

export function getInitials(name?: string | null): string {
  if (!name || !name.trim()) return '--';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const ALLOWED_AVATAR_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
]);
const MAX_RAW_AVATAR_BYTES = 5 * 1024 * 1024;
const MAX_ENCODED_AVATAR_LENGTH = 1_400_000;
const TARGET_INLINE_DATA_URL_LENGTH = 900_000;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Could not read the selected image file.'));
      }
    };
    reader.onerror = () => reject(new Error('Could not read the selected image file.'));
    reader.readAsDataURL(file);
  });
}

async function resizeDataUrlIfNeeded(dataUrl: string, mimeType: string): Promise<string> {
  if (dataUrl.length <= TARGET_INLINE_DATA_URL_LENGTH || mimeType === 'image/gif') {
    return dataUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const maxSide = 512;
        const scale = Math.min(1, maxSide / Math.max(img.width || maxSide, img.height || maxSide));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

function formatModalDateTime(iso?: string | null): string {
  if (!iso) return '—';
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return '—';
  const datePart = parsed.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const timePart = parsed.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  return `${datePart}, ${timePart}`;
}

interface ModalShellProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  maxWidthClass?: string;
  children: React.ReactNode;
}

const ModalShell: React.FC<ModalShellProps> = ({
  title,
  subtitle,
  onClose,
  maxWidthClass = 'max-w-[480px]',
  children,
}) => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-[2px] p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full ${maxWidthClass} rounded-[16px] bg-white border border-slate-200 shadow-2xl overflow-hidden`}
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-[16px] font-bold text-[#0F172A] leading-6">{title}</h3>
            {subtitle && <p className="text-[12px] text-[#64748B] mt-0.5">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

interface CountryDialOption {
  iso: string;
  name: string;
  dialCode: string;
}

const DEFAULT_COUNTRY_ISO = 'IN';

export const COUNTRY_DIAL_CODES: readonly CountryDialOption[] = [
  { iso: 'AF', name: 'Afghanistan', dialCode: '+93' },
  { iso: 'AL', name: 'Albania', dialCode: '+355' },
  { iso: 'DZ', name: 'Algeria', dialCode: '+213' },
  { iso: 'AD', name: 'Andorra', dialCode: '+376' },
  { iso: 'AO', name: 'Angola', dialCode: '+244' },
  { iso: 'AG', name: 'Antigua and Barbuda', dialCode: '+1268' },
  { iso: 'AR', name: 'Argentina', dialCode: '+54' },
  { iso: 'AM', name: 'Armenia', dialCode: '+374' },
  { iso: 'AU', name: 'Australia', dialCode: '+61' },
  { iso: 'AT', name: 'Austria', dialCode: '+43' },
  { iso: 'AZ', name: 'Azerbaijan', dialCode: '+994' },
  { iso: 'BS', name: 'Bahamas', dialCode: '+1242' },
  { iso: 'BH', name: 'Bahrain', dialCode: '+973' },
  { iso: 'BD', name: 'Bangladesh', dialCode: '+880' },
  { iso: 'BB', name: 'Barbados', dialCode: '+1246' },
  { iso: 'BY', name: 'Belarus', dialCode: '+375' },
  { iso: 'BE', name: 'Belgium', dialCode: '+32' },
  { iso: 'BZ', name: 'Belize', dialCode: '+501' },
  { iso: 'BJ', name: 'Benin', dialCode: '+229' },
  { iso: 'BT', name: 'Bhutan', dialCode: '+975' },
  { iso: 'BO', name: 'Bolivia', dialCode: '+591' },
  { iso: 'BA', name: 'Bosnia and Herzegovina', dialCode: '+387' },
  { iso: 'BW', name: 'Botswana', dialCode: '+267' },
  { iso: 'BR', name: 'Brazil', dialCode: '+55' },
  { iso: 'BN', name: 'Brunei', dialCode: '+673' },
  { iso: 'BG', name: 'Bulgaria', dialCode: '+359' },
  { iso: 'BF', name: 'Burkina Faso', dialCode: '+226' },
  { iso: 'BI', name: 'Burundi', dialCode: '+257' },
  { iso: 'KH', name: 'Cambodia', dialCode: '+855' },
  { iso: 'CM', name: 'Cameroon', dialCode: '+237' },
  { iso: 'CA', name: 'Canada', dialCode: '+1' },
  { iso: 'CV', name: 'Cape Verde', dialCode: '+238' },
  { iso: 'CF', name: 'Central African Republic', dialCode: '+236' },
  { iso: 'TD', name: 'Chad', dialCode: '+235' },
  { iso: 'CL', name: 'Chile', dialCode: '+56' },
  { iso: 'CN', name: 'China', dialCode: '+86' },
  { iso: 'CO', name: 'Colombia', dialCode: '+57' },
  { iso: 'KM', name: 'Comoros', dialCode: '+269' },
  { iso: 'CG', name: 'Congo', dialCode: '+242' },
  { iso: 'CD', name: 'Congo (DRC)', dialCode: '+243' },
  { iso: 'CR', name: 'Costa Rica', dialCode: '+506' },
  { iso: 'HR', name: 'Croatia', dialCode: '+385' },
  { iso: 'CU', name: 'Cuba', dialCode: '+53' },
  { iso: 'CY', name: 'Cyprus', dialCode: '+357' },
  { iso: 'CZ', name: 'Czech Republic', dialCode: '+420' },
  { iso: 'DK', name: 'Denmark', dialCode: '+45' },
  { iso: 'DJ', name: 'Djibouti', dialCode: '+253' },
  { iso: 'DM', name: 'Dominica', dialCode: '+1767' },
  { iso: 'DO', name: 'Dominican Republic', dialCode: '+1809' },
  { iso: 'EC', name: 'Ecuador', dialCode: '+593' },
  { iso: 'EG', name: 'Egypt', dialCode: '+20' },
  { iso: 'SV', name: 'El Salvador', dialCode: '+503' },
  { iso: 'GQ', name: 'Equatorial Guinea', dialCode: '+240' },
  { iso: 'ER', name: 'Eritrea', dialCode: '+291' },
  { iso: 'EE', name: 'Estonia', dialCode: '+372' },
  { iso: 'SZ', name: 'Eswatini', dialCode: '+268' },
  { iso: 'ET', name: 'Ethiopia', dialCode: '+251' },
  { iso: 'FJ', name: 'Fiji', dialCode: '+679' },
  { iso: 'FI', name: 'Finland', dialCode: '+358' },
  { iso: 'FR', name: 'France', dialCode: '+33' },
  { iso: 'GA', name: 'Gabon', dialCode: '+241' },
  { iso: 'GM', name: 'Gambia', dialCode: '+220' },
  { iso: 'GE', name: 'Georgia', dialCode: '+995' },
  { iso: 'DE', name: 'Germany', dialCode: '+49' },
  { iso: 'GH', name: 'Ghana', dialCode: '+233' },
  { iso: 'GR', name: 'Greece', dialCode: '+30' },
  { iso: 'GD', name: 'Grenada', dialCode: '+1473' },
  { iso: 'GT', name: 'Guatemala', dialCode: '+502' },
  { iso: 'GN', name: 'Guinea', dialCode: '+224' },
  { iso: 'GW', name: 'Guinea-Bissau', dialCode: '+245' },
  { iso: 'GY', name: 'Guyana', dialCode: '+592' },
  { iso: 'HT', name: 'Haiti', dialCode: '+509' },
  { iso: 'HN', name: 'Honduras', dialCode: '+504' },
  { iso: 'HK', name: 'Hong Kong', dialCode: '+852' },
  { iso: 'HU', name: 'Hungary', dialCode: '+36' },
  { iso: 'IS', name: 'Iceland', dialCode: '+354' },
  { iso: 'IN', name: 'India', dialCode: '+91' },
  { iso: 'ID', name: 'Indonesia', dialCode: '+62' },
  { iso: 'IR', name: 'Iran', dialCode: '+98' },
  { iso: 'IQ', name: 'Iraq', dialCode: '+964' },
  { iso: 'IE', name: 'Ireland', dialCode: '+353' },
  { iso: 'IL', name: 'Israel', dialCode: '+972' },
  { iso: 'IT', name: 'Italy', dialCode: '+39' },
  { iso: 'CI', name: 'Ivory Coast', dialCode: '+225' },
  { iso: 'JM', name: 'Jamaica', dialCode: '+1876' },
  { iso: 'JP', name: 'Japan', dialCode: '+81' },
  { iso: 'JO', name: 'Jordan', dialCode: '+962' },
  { iso: 'KZ', name: 'Kazakhstan', dialCode: '+7' },
  { iso: 'KE', name: 'Kenya', dialCode: '+254' },
  { iso: 'KI', name: 'Kiribati', dialCode: '+686' },
  { iso: 'XK', name: 'Kosovo', dialCode: '+383' },
  { iso: 'KW', name: 'Kuwait', dialCode: '+965' },
  { iso: 'KG', name: 'Kyrgyzstan', dialCode: '+996' },
  { iso: 'LA', name: 'Laos', dialCode: '+856' },
  { iso: 'LV', name: 'Latvia', dialCode: '+371' },
  { iso: 'LB', name: 'Lebanon', dialCode: '+961' },
  { iso: 'LS', name: 'Lesotho', dialCode: '+266' },
  { iso: 'LR', name: 'Liberia', dialCode: '+231' },
  { iso: 'LY', name: 'Libya', dialCode: '+218' },
  { iso: 'LI', name: 'Liechtenstein', dialCode: '+423' },
  { iso: 'LT', name: 'Lithuania', dialCode: '+370' },
  { iso: 'LU', name: 'Luxembourg', dialCode: '+352' },
  { iso: 'MO', name: 'Macau', dialCode: '+853' },
  { iso: 'MG', name: 'Madagascar', dialCode: '+261' },
  { iso: 'MW', name: 'Malawi', dialCode: '+265' },
  { iso: 'MY', name: 'Malaysia', dialCode: '+60' },
  { iso: 'MV', name: 'Maldives', dialCode: '+960' },
  { iso: 'ML', name: 'Mali', dialCode: '+223' },
  { iso: 'MT', name: 'Malta', dialCode: '+356' },
  { iso: 'MH', name: 'Marshall Islands', dialCode: '+692' },
  { iso: 'MR', name: 'Mauritania', dialCode: '+222' },
  { iso: 'MU', name: 'Mauritius', dialCode: '+230' },
  { iso: 'MX', name: 'Mexico', dialCode: '+52' },
  { iso: 'FM', name: 'Micronesia', dialCode: '+691' },
  { iso: 'MD', name: 'Moldova', dialCode: '+373' },
  { iso: 'MC', name: 'Monaco', dialCode: '+377' },
  { iso: 'MN', name: 'Mongolia', dialCode: '+976' },
  { iso: 'ME', name: 'Montenegro', dialCode: '+382' },
  { iso: 'MA', name: 'Morocco', dialCode: '+212' },
  { iso: 'MZ', name: 'Mozambique', dialCode: '+258' },
  { iso: 'MM', name: 'Myanmar', dialCode: '+95' },
  { iso: 'NA', name: 'Namibia', dialCode: '+264' },
  { iso: 'NR', name: 'Nauru', dialCode: '+674' },
  { iso: 'NP', name: 'Nepal', dialCode: '+977' },
  { iso: 'NL', name: 'Netherlands', dialCode: '+31' },
  { iso: 'NZ', name: 'New Zealand', dialCode: '+64' },
  { iso: 'NI', name: 'Nicaragua', dialCode: '+505' },
  { iso: 'NE', name: 'Niger', dialCode: '+227' },
  { iso: 'NG', name: 'Nigeria', dialCode: '+234' },
  { iso: 'KP', name: 'North Korea', dialCode: '+850' },
  { iso: 'MK', name: 'North Macedonia', dialCode: '+389' },
  { iso: 'NO', name: 'Norway', dialCode: '+47' },
  { iso: 'OM', name: 'Oman', dialCode: '+968' },
  { iso: 'PK', name: 'Pakistan', dialCode: '+92' },
  { iso: 'PW', name: 'Palau', dialCode: '+680' },
  { iso: 'PS', name: 'Palestine', dialCode: '+970' },
  { iso: 'PA', name: 'Panama', dialCode: '+507' },
  { iso: 'PG', name: 'Papua New Guinea', dialCode: '+675' },
  { iso: 'PY', name: 'Paraguay', dialCode: '+595' },
  { iso: 'PE', name: 'Peru', dialCode: '+51' },
  { iso: 'PH', name: 'Philippines', dialCode: '+63' },
  { iso: 'PL', name: 'Poland', dialCode: '+48' },
  { iso: 'PT', name: 'Portugal', dialCode: '+351' },
  { iso: 'PR', name: 'Puerto Rico', dialCode: '+1787' },
  { iso: 'QA', name: 'Qatar', dialCode: '+974' },
  { iso: 'RO', name: 'Romania', dialCode: '+40' },
  { iso: 'RU', name: 'Russia', dialCode: '+7' },
  { iso: 'RW', name: 'Rwanda', dialCode: '+250' },
  { iso: 'KN', name: 'Saint Kitts and Nevis', dialCode: '+1869' },
  { iso: 'LC', name: 'Saint Lucia', dialCode: '+1758' },
  { iso: 'VC', name: 'Saint Vincent and the Grenadines', dialCode: '+1784' },
  { iso: 'WS', name: 'Samoa', dialCode: '+685' },
  { iso: 'SM', name: 'San Marino', dialCode: '+378' },
  { iso: 'ST', name: 'Sao Tome and Principe', dialCode: '+239' },
  { iso: 'SA', name: 'Saudi Arabia', dialCode: '+966' },
  { iso: 'SN', name: 'Senegal', dialCode: '+221' },
  { iso: 'RS', name: 'Serbia', dialCode: '+381' },
  { iso: 'SC', name: 'Seychelles', dialCode: '+248' },
  { iso: 'SL', name: 'Sierra Leone', dialCode: '+232' },
  { iso: 'SG', name: 'Singapore', dialCode: '+65' },
  { iso: 'SK', name: 'Slovakia', dialCode: '+421' },
  { iso: 'SI', name: 'Slovenia', dialCode: '+386' },
  { iso: 'SB', name: 'Solomon Islands', dialCode: '+677' },
  { iso: 'SO', name: 'Somalia', dialCode: '+252' },
  { iso: 'ZA', name: 'South Africa', dialCode: '+27' },
  { iso: 'KR', name: 'South Korea', dialCode: '+82' },
  { iso: 'SS', name: 'South Sudan', dialCode: '+211' },
  { iso: 'ES', name: 'Spain', dialCode: '+34' },
  { iso: 'LK', name: 'Sri Lanka', dialCode: '+94' },
  { iso: 'SD', name: 'Sudan', dialCode: '+249' },
  { iso: 'SR', name: 'Suriname', dialCode: '+597' },
  { iso: 'SE', name: 'Sweden', dialCode: '+46' },
  { iso: 'CH', name: 'Switzerland', dialCode: '+41' },
  { iso: 'SY', name: 'Syria', dialCode: '+963' },
  { iso: 'TW', name: 'Taiwan', dialCode: '+886' },
  { iso: 'TJ', name: 'Tajikistan', dialCode: '+992' },
  { iso: 'TZ', name: 'Tanzania', dialCode: '+255' },
  { iso: 'TH', name: 'Thailand', dialCode: '+66' },
  { iso: 'TL', name: 'Timor-Leste', dialCode: '+670' },
  { iso: 'TG', name: 'Togo', dialCode: '+228' },
  { iso: 'TO', name: 'Tonga', dialCode: '+676' },
  { iso: 'TT', name: 'Trinidad and Tobago', dialCode: '+1868' },
  { iso: 'TN', name: 'Tunisia', dialCode: '+216' },
  { iso: 'TR', name: 'Turkey', dialCode: '+90' },
  { iso: 'TM', name: 'Turkmenistan', dialCode: '+993' },
  { iso: 'TV', name: 'Tuvalu', dialCode: '+688' },
  { iso: 'UG', name: 'Uganda', dialCode: '+256' },
  { iso: 'UA', name: 'Ukraine', dialCode: '+380' },
  { iso: 'AE', name: 'United Arab Emirates', dialCode: '+971' },
  { iso: 'GB', name: 'United Kingdom', dialCode: '+44' },
  { iso: 'US', name: 'United States', dialCode: '+1' },
  { iso: 'UY', name: 'Uruguay', dialCode: '+598' },
  { iso: 'UZ', name: 'Uzbekistan', dialCode: '+998' },
  { iso: 'VU', name: 'Vanuatu', dialCode: '+678' },
  { iso: 'VA', name: 'Vatican City', dialCode: '+379' },
  { iso: 'VE', name: 'Venezuela', dialCode: '+58' },
  { iso: 'VN', name: 'Vietnam', dialCode: '+84' },
  { iso: 'YE', name: 'Yemen', dialCode: '+967' },
  { iso: 'ZM', name: 'Zambia', dialCode: '+260' },
  { iso: 'ZW', name: 'Zimbabwe', dialCode: '+263' },
];

const PRIMARY_ISO_BY_DIAL_CODE: Record<string, string> = {
  '+1': 'US',
  '+7': 'RU',
};

const DIAL_CODES_LONGEST_FIRST = [...COUNTRY_DIAL_CODES].sort(
  (a, b) => b.dialCode.length - a.dialCode.length
);

const UNIQUE_DIAL_CODE_OPTIONS: readonly CountryDialOption[] = Array.from(
  COUNTRY_DIAL_CODES.reduce((map, option) => {
    const preferredIso = PRIMARY_ISO_BY_DIAL_CODE[option.dialCode];
    if (!map.has(option.dialCode) || option.iso === preferredIso) {
      map.set(option.dialCode, option);
    }
    return map;
  }, new Map<string, CountryDialOption>()).values()
).sort((a, b) => Number(a.dialCode.slice(1)) - Number(b.dialCode.slice(1)));

const findCountryByDialCode = (dialCode: string): CountryDialOption | undefined => {
  const preferredIso = PRIMARY_ISO_BY_DIAL_CODE[dialCode];
  if (preferredIso) {
    const preferred = COUNTRY_DIAL_CODES.find((c) => c.iso === preferredIso);
    if (preferred) {
      return preferred;
    }
  }
  return COUNTRY_DIAL_CODES.find((c) => c.dialCode === dialCode);
};

const parsePhoneWithCountryCode = (
  rawPhone?: string | null
): { countryIso: string; phoneDigits: string } => {
  const trimmed = (rawPhone || '').trim();
  if (!trimmed) {
    return { countryIso: DEFAULT_COUNTRY_ISO, phoneDigits: '' };
  }

  if (trimmed.startsWith('+')) {
    const firstSpaceIdx = trimmed.search(/\s/);
    if (firstSpaceIdx > 1) {
      const prefixToken = trimmed.slice(0, firstSpaceIdx);
      const exactMatch = findCountryByDialCode(prefixToken);
      if (exactMatch) {
        return {
          countryIso: exactMatch.iso,
          phoneDigits: trimmed.slice(firstSpaceIdx + 1).replace(/\D/g, '').slice(0, 10),
        };
      }
    }

    const compact = trimmed.replace(/[\s-]/g, '');
    const matched = DIAL_CODES_LONGEST_FIRST.find((c) => compact.startsWith(c.dialCode));
    if (matched) {
      const primary = findCountryByDialCode(matched.dialCode) ?? matched;
      return {
        countryIso: primary.iso,
        phoneDigits: compact.slice(matched.dialCode.length).replace(/\D/g, '').slice(0, 10),
      };
    }
  }

  const allDigits = trimmed.replace(/\D/g, '');
  return {
    countryIso: DEFAULT_COUNTRY_ISO,
    phoneDigits: (allDigits.length > 10 ? allDigits.slice(-10) : allDigits).slice(0, 10),
  };
};

interface EditProfileModalProps {
  profile: UserProfileSettings;
  onClose: () => void;
  onSave: (payload: UpdateProfilePayload) => Promise<void>;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  profile,
  onClose,
  onSave,
}) => {
  const initialPhone = parsePhoneWithCountryCode(profile.phone);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [countryIso, setCountryIso] = useState<string>(initialPhone.countryIso);
  const [phoneDigits, setPhoneDigits] = useState<string>(initialPhone.phoneDigits);
  const [form, setForm] = useState<UpdateProfilePayload>({
    displayName: profile.displayName || '',
    email: profile.email || '',
    phone: profile.phone || '',
    department: profile.department || '',
    employeeId: profile.employeeId || '',
    jobTitle: profile.jobTitle || '',
    avatarUrl: profile.avatarUrl ?? null,
  });
  const [previewError, setPreviewError] = useState(false);
  const [processingAvatar, setProcessingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const normalizedType = file.type.toLowerCase();
    if (!ALLOWED_AVATAR_MIME_TYPES.has(normalizedType)) {
      setError('Please select a PNG, JPG, WEBP, or GIF image.');
      return;
    }
    if (file.size > MAX_RAW_AVATAR_BYTES) {
      setError('Profile picture file size must be 5 MB or smaller.');
      return;
    }

    setError(null);
    setProcessingAvatar(true);
    try {
      const rawDataUrl = await readFileAsDataUrl(file);
      const finalDataUrl = await resizeDataUrlIfNeeded(rawDataUrl, normalizedType);
      if (finalDataUrl.length > MAX_ENCODED_AVATAR_LENGTH) {
        setError('Image is too large even after compression. Please choose a smaller image.');
        return;
      }
      setPreviewError(false);
      setForm((prev) => ({ ...prev, avatarUrl: finalDataUrl }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to process the selected image.');
    } finally {
      setProcessingAvatar(false);
    }
  };

  const handleRemoveAvatar = () => {
    setPreviewError(false);
    setError(null);
    setForm((prev) => ({ ...prev, avatarUrl: '' }));
  };

  const selectedCountry =
    COUNTRY_DIAL_CODES.find((c) => c.iso === countryIso) ??
    COUNTRY_DIAL_CODES.find((c) => c.iso === DEFAULT_COUNTRY_ISO)!;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneDigits(digitsOnly);
  };

  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.ctrlKey || e.metaKey || e.altKey) {
      return;
    }
    const allowedKeys = new Set([
      'Backspace',
      'Delete',
      'Tab',
      'Escape',
      'Enter',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End',
    ]);
    if (allowedKeys.has(e.key) || /^[0-9]$/.test(e.key)) {
      return;
    }
    e.preventDefault();
  };

  const handlePhonePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedDigits = e.clipboardData.getData('text').replace(/\D/g, '');
    if (!pastedDigits) {
      return;
    }
    const input = e.currentTarget;
    const start = input.selectionStart ?? phoneDigits.length;
    const end = input.selectionEnd ?? phoneDigits.length;
    const merged = (phoneDigits.slice(0, start) + pastedDigits + phoneDigits.slice(end)).slice(0, 10);
    setPhoneDigits(merged);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.displayName.trim()) {
      setError('Display name is required.');
      return;
    }
    const digitsOnly = phoneDigits.replace(/\D/g, '');
    if (digitsOnly.length > 0 && digitsOnly.length !== 10) {
      setError('Phone number must be exactly 10 digits.');
      return;
    }
    const formattedPhone =
      digitsOnly.length === 10 ? `${selectedCountry.dialCode} ${digitsOnly}` : '';
    setError(null);
    setSaving(true);
    try {
      await onSave({
        displayName: form.displayName.trim(),
        email: profile.email || '',
        phone: formattedPhone,
        department: profile.department || '',
        employeeId: form.employeeId.trim(),
        jobTitle: profile.jobTitle || '',
        ...(form.avatarUrl !== null && form.avatarUrl !== undefined
          ? { avatarUrl: form.avatarUrl }
          : {}),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const hasCustomAvatar = Boolean(form.avatarUrl && form.avatarUrl.trim() && !previewError);
  const avatarInitials = getInitials(form.displayName || profile.displayName);

  return (
    <ModalShell
      title="Edit Profile"
      subtitle="Update your identity, department, and contact details."
      onClose={onClose}
    >
      <form noValidate onSubmit={handleSubmit} className="p-6 space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-[12px] text-rose-700">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Profile Picture */}
        <div className="flex items-center gap-4 p-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
          <div className="relative shrink-0">
            {hasCustomAvatar ? (
              <img
                src={form.avatarUrl || undefined}
                alt={form.displayName || 'Profile picture'}
                onError={() => setPreviewError(true)}
                className="w-16 h-16 rounded-full object-cover border border-[#E2E8F0] bg-white"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#2563EB] flex items-center justify-center shadow-[inset_0px_2px_4px_rgba(0,0,0,0.05)]">
                <span className="text-[18px] font-bold text-white select-none">
                  {avatarInitials}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5 min-w-0 flex-1">
            <span className="text-[12px] font-medium text-[#334155]">
              Profile Picture
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                aria-label="Upload profile picture"
                onChange={handleAvatarFileChange}
                className="hidden"
              />
              <button
                type="button"
                disabled={processingAvatar || saving}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-[#E2E8F0] bg-white text-[12px] font-medium text-[#1E293B] hover:border-[#4F46E5] hover:text-[#4F46E5] transition-colors cursor-pointer disabled:opacity-60"
              >
                {processingAvatar ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Camera size={13} />
                )}
                <span>{form.avatarUrl ? 'Change Photo' : 'Upload Photo'}</span>
              </button>
              {form.avatarUrl && (
                <button
                  type="button"
                  disabled={processingAvatar || saving}
                  onClick={handleRemoveAvatar}
                  className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-[12px] font-medium text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors cursor-pointer disabled:opacity-60"
                >
                  <Trash2 size={13} />
                  <span>Remove</span>
                </button>
              )}
            </div>
            <span className="text-[11px] text-[#64748B]">
              PNG, JPG, WEBP, or GIF. Max 5 MB.
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-[12px] font-medium text-[#334155] mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={form.displayName}
              onChange={(e) => setForm((prev) => ({ ...prev, displayName: e.target.value }))}
              className="w-full h-9 px-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-[13px] text-[#0F172A] focus:outline-none focus:border-[#4F46E5] focus:bg-white"
              placeholder="Enter full name"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="edit-profile-email"
              className="block text-[12px] font-medium text-[#334155] mb-1"
            >
              Email Address
            </label>
            <input
              id="edit-profile-email"
              type="email"
              value={form.email}
              disabled
              readOnly
              className="w-full h-9 px-3 rounded-lg border border-[#E2E8F0] bg-slate-100 text-[13px] text-[#64748B] cursor-not-allowed focus:outline-none"
              placeholder="name@company.in"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="edit-profile-phone"
              className="block text-[12px] font-medium text-[#334155] mb-1"
            >
              Phone Number
            </label>
            <div className="flex items-center gap-2">
              <select
                aria-label="Country code"
                value={countryIso}
                onChange={(e) => setCountryIso(e.target.value)}
                className="w-[96px] shrink-0 h-9 px-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-[13px] text-[#0F172A] tabular-nums focus:outline-none focus:border-[#4F46E5] focus:bg-white cursor-pointer"
              >
                {UNIQUE_DIAL_CODE_OPTIONS.map((country) => (
                  <option key={country.iso} value={country.iso} title={country.name}>
                    {country.dialCode}
                  </option>
                ))}
              </select>
              <input
                id="edit-profile-phone"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]{10}"
                maxLength={10}
                value={phoneDigits}
                onChange={handlePhoneChange}
                onKeyDown={handlePhoneKeyDown}
                onPaste={handlePhonePaste}
                className="flex-1 min-w-0 h-9 px-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-[13px] text-[#0F172A] tabular-nums focus:outline-none focus:border-[#4F46E5] focus:bg-white"
                placeholder="9876543210"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="edit-profile-department"
              className="block text-[12px] font-medium text-[#334155] mb-1"
            >
              Department
            </label>
            <input
              id="edit-profile-department"
              type="text"
              value={form.department || profile.role || 'ADMIN'}
              disabled
              readOnly
              className="w-full h-9 px-3 rounded-lg border border-[#E2E8F0] bg-slate-100 text-[13px] text-[#64748B] cursor-not-allowed focus:outline-none uppercase"
              placeholder="ADMIN"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 h-9 rounded-lg border border-slate-200 bg-white text-[12px] font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 h-9 rounded-lg bg-[#4F46E5] text-[12px] font-semibold text-white hover:bg-[#4338CA] disabled:opacity-60 cursor-pointer"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Save Changes
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

interface ChangePasswordModalProps {
  onClose: () => void;
  onSubmit: (payload: ChangePasswordPayload) => Promise<void>;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState<ChangePasswordPayload>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError('Please complete all password fields.');
      return;
    }
    if (form.newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('New password and confirmation password do not match.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell
      title="Change Password"
      subtitle="Verify your current password before setting a new one."
      onClose={onClose}
    >
      <form noValidate onSubmit={handleSubmit} className="p-6 space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-[12px] text-rose-700">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-[12px] font-medium text-[#334155] mb-1">
            Current Password
          </label>
          <div className="relative">
            <input
              type={showCurrent ? 'text' : 'password'}
              value={form.currentPassword}
              onChange={(e) => setForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
              className="w-full h-9 pl-3 pr-9 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-[13px] text-[#0F172A] focus:outline-none focus:border-[#4F46E5] focus:bg-white"
              placeholder="Enter current password"
            />
            <button
              type="button"
              onClick={() => setShowCurrent((v) => !v)}
              aria-label="Toggle current password visibility"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-medium text-[#334155] mb-1">
            New Password
          </label>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              value={form.newPassword}
              onChange={(e) => setForm((prev) => ({ ...prev, newPassword: e.target.value }))}
              className="w-full h-9 pl-3 pr-9 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-[13px] text-[#0F172A] focus:outline-none focus:border-[#4F46E5] focus:bg-white"
              placeholder="Minimum 8 characters"
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              aria-label="Toggle new password visibility"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-medium text-[#334155] mb-1">
            Confirm New Password
          </label>
          <input
            type="password"
            value={form.confirmPassword}
            onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
            className="w-full h-9 px-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-[13px] text-[#0F172A] focus:outline-none focus:border-[#4F46E5] focus:bg-white"
            placeholder="Re-enter new password"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 h-9 rounded-lg border border-slate-200 bg-white text-[12px] font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 h-9 rounded-lg bg-[#4F46E5] text-[12px] font-semibold text-white hover:bg-[#4338CA] disabled:opacity-60 cursor-pointer"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Update Password
          </button>
        </div>
      </form>
    </ModalShell>
  );
};

interface ManageMfaModalProps {
  enabled: boolean;
  method: string;
  onClose: () => void;
  onSave: (payload: UpdateMfaPayload) => Promise<void>;
}

export const ManageMfaModal: React.FC<ManageMfaModalProps> = ({
  enabled,
  method,
  onClose,
  onSave,
}) => {
  const [mfaEnabled, setMfaEnabled] = useState(enabled);
  const [selectedMethod, setSelectedMethod] = useState(method || 'Authenticator App');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    try {
      await onSave({ enabled: mfaEnabled, method: selectedMethod });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update MFA setting.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell
      title="Multi-Factor Authentication"
      subtitle="Add an extra verification step to protect your CMS workspace."
      onClose={onClose}
    >
      <div className="p-6 space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-[12px] text-rose-700">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-[#F8FAFF] p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] flex items-center justify-center text-[#4F46E5]">
              <Shield size={18} />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#0F172A]">MFA Protection</p>
              <p className="text-[11px] text-[#64748B]">
                {mfaEnabled ? 'Second factor is active on your account' : 'Currently disabled'}
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={mfaEnabled}
            aria-label="Toggle Multi-Factor Authentication"
            onClick={() => setMfaEnabled((v) => !v)}
            className="relative inline-flex items-center shrink-0 w-[36px] h-[20px] rounded-full transition-colors cursor-pointer"
            style={{ backgroundColor: mfaEnabled ? '#4F46E5' : '#E2E8F0' }}
          >
            <span
              className="inline-block w-[16px] h-[16px] rounded-full bg-white transition-transform"
              style={{
                transform: mfaEnabled ? 'translateX(18px)' : 'translateX(2px)',
                border: mfaEnabled ? '1px solid #FFFFFF' : '1px solid #D1D5DB',
              }}
            />
          </button>
        </div>

        <div>
          <label className="block text-[12px] font-medium text-[#334155] mb-1.5">
            Verification Method
          </label>
          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="w-full h-9 px-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-[13px] text-[#0F172A] focus:outline-none focus:border-[#4F46E5] focus:bg-white"
          >
            <option value="Authenticator App">Authenticator App</option>
            <option value="Email OTP">Email OTP</option>
            <option value="Hardware Security Key">Hardware Security Key</option>
          </select>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 h-9 rounded-lg border border-slate-200 bg-white text-[12px] font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 h-9 rounded-lg bg-[#4F46E5] text-[12px] font-semibold text-white hover:bg-[#4338CA] disabled:opacity-60 cursor-pointer"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Save MFA Settings
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

interface ActiveSessionsModalProps {
  sessions: UserSessionItem[];
  loading: boolean;
  onClose: () => void;
  onRevokeSession: (sessionId: string) => Promise<void>;
  onRevokeOthers: () => Promise<void>;
}

export const ActiveSessionsModal: React.FC<ActiveSessionsModalProps> = ({
  sessions,
  loading,
  onClose,
  onRevokeSession,
  onRevokeOthers,
}) => {
  const [busyId, setBusyId] = useState<string | null>(null);
  const hasOthers = sessions.some((s) => !s.current);

  const handleRevoke = async (id: string) => {
    setBusyId(id);
    try {
      await onRevokeSession(id);
    } finally {
      setBusyId(null);
    }
  };

  const handleRevokeAllOthers = async () => {
    setBusyId('all');
    try {
      await onRevokeOthers();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <ModalShell
      title="Active Sessions"
      subtitle="Devices currently signed in with your account."
      onClose={onClose}
      maxWidthClass="max-w-[560px]"
    >
      <div className="p-6 space-y-4">
        {loading ? (
          <div className="py-8 flex items-center justify-center text-[13px] text-slate-500 gap-2">
            <Loader2 size={16} className="animate-spin text-[#4F46E5]" />
            <span>Loading active sessions...</span>
          </div>
        ) : sessions.length === 0 ? (
          <div className="py-8 text-center text-[13px] text-slate-500">
            No active sessions found.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-[340px] overflow-y-auto pr-1">
            {sessions.map((session) => (
              <div key={session.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center text-[#4F46E5] shrink-0 mt-0.5">
                    <Monitor size={15} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13px] font-semibold text-[#1E293B]">
                        {session.deviceName} · {session.browser}
                      </span>
                      {session.current && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669]">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#64748B] tabular-nums mt-0.5">
                      IP: {session.ipAddress} · Last active {formatModalDateTime(session.lastActiveAt)}
                    </p>
                  </div>
                </div>
                {!session.current && (
                  <button
                    type="button"
                    disabled={busyId === session.id}
                    onClick={() => handleRevoke(session.id)}
                    className="inline-flex items-center gap-1 px-2.5 h-7 rounded border border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    {busyId === session.id ? <Loader2 size={12} className="animate-spin" /> : 'Revoke'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
          {hasOthers ? (
            <button
              type="button"
              disabled={busyId === 'all'}
              onClick={handleRevokeAllOthers}
              className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg border border-rose-200 bg-rose-50 text-[12px] font-semibold text-rose-700 hover:bg-rose-100 cursor-pointer disabled:opacity-50"
            >
              <LogOut size={13} />
              Sign out other sessions
            </button>
          ) : (
            <span className="text-[11px] text-slate-400">Only your current session is active</span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-4 h-8 rounded-lg bg-[#4F46E5] text-[12px] font-semibold text-white hover:bg-[#4338CA] cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

interface LoginHistoryModalProps {
  items: LoginHistoryItem[];
  loading: boolean;
  onClose: () => void;
}

export const LoginHistoryModal: React.FC<LoginHistoryModalProps> = ({
  items,
  loading,
  onClose,
}) => {
  return (
    <ModalShell
      title="Login History"
      subtitle="Recent authentication and security activity for your account."
      onClose={onClose}
      maxWidthClass="max-w-[580px]"
    >
      <div className="p-6 space-y-4">
        {loading ? (
          <div className="py-8 flex items-center justify-center text-[13px] text-slate-500 gap-2">
            <Loader2 size={16} className="animate-spin text-[#4F46E5]" />
            <span>Loading security activity...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="py-8 text-center text-[13px] text-slate-500">
            No login or security events recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-[360px] overflow-y-auto pr-1">
            {items.map((item) => {
              const isFailed = item.status === 'FAILED';
              return (
                <div key={item.id} className="py-3 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${isFailed ? 'bg-rose-50 text-rose-600' : 'bg-[#EFF6FF] text-[#4F46E5]'
                        }`}
                    >
                      {isFailed ? <AlertCircle size={15} /> : <Clock size={15} />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-[#1E293B]">
                        {item.details || item.eventType.replace(/_/g, ' ')}
                      </p>
                      <p className="text-[11px] text-[#64748B] tabular-nums mt-0.5">
                        {[item.deviceName, item.browser, item.ipAddress].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${isFailed
                          ? 'bg-rose-50 border-rose-200 text-rose-700'
                          : 'bg-[#ECFDF5] border-[#A7F3D0] text-[#059669]'
                        }`}
                    >
                      {!isFailed && <CheckCircle2 size={10} />}
                      {item.status}
                    </span>
                    <p className="text-[11px] text-[#64748B] tabular-nums mt-1">
                      {formatModalDateTime(item.occurredAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 h-8 rounded-lg bg-[#4F46E5] text-[12px] font-semibold text-white hover:bg-[#4338CA] cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

