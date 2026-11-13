import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Check, Loader2 } from 'lucide-react';
import { apiClient, ApiError, clearAuthStorage } from '../../../services/api/apiClient';
import { ForgotPasswordModal } from '../components/ForgotPasswordModal';

interface LoginResponseData {
  token: string;
  username: string;
  role: string;
  name: string;
  email?: string;
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  // Retrieve redirect target from URL query params
  const searchParams = new URLSearchParams(location.search);
  const redirectTarget = searchParams.get('redirect') || '/management/ceo-dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please enter your email or username.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await apiClient.post<LoginResponseData>('/auth/login', {
        username: email.trim(),
        password,
      });

      if (response?.data?.token) {
        if ((response.data.role || '').toUpperCase() !== 'ADMIN') {
          clearAuthStorage();
          setErrorMessage('Access restricted to administrators');
          return;
        }

        // Store JWT token and user profile
        localStorage.setItem('auth_token', response.data.token);
        if (response.data.name || response.data.username) {
          localStorage.setItem('auth_user_name', response.data.name || response.data.username);
        }
        localStorage.setItem('auth_user_role', 'ADMIN');
        const userEmail = response.data.email || (response.data.username && response.data.username.includes('@') ? response.data.username : email.trim());
        if (userEmail) {
          localStorage.setItem('auth_user_email', userEmail);
        }

        if (rememberMe) {
          localStorage.setItem('remember_login', 'true');
        } else {
          localStorage.removeItem('remember_login');
        }

        // Clear explicit logout flag so subsequent requests work normally
        sessionStorage.removeItem('logged_out');

        // Redirect back to requested route or CEO dashboard
        navigate(redirectTarget, { replace: true });
      } else {
        setErrorMessage('Authentication succeeded but no token was received.');
      }
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 403) {
        clearAuthStorage();
        setErrorMessage('Access restricted to administrators');
      } else {
        const message = err instanceof Error ? err.message : 'Invalid credentials. Please try again.';
        setErrorMessage(message.includes('401') ? 'Invalid email or password.' : message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Permanent Login Background Image provided by user - DO NOT CHANGE
    <div
      className="relative min-h-screen w-full flex items-center justify-center overflow-x-hidden overflow-y-auto bg-cover bg-center select-none"
      style={{
        backgroundImage: "url('/login-bg.jpg')",
        backgroundColor: '#60A5FA',
      }}
    >

      {/* Modal Card Window */}
      <div
        className="relative z-10 w-full max-w-[452px] mx-4 my-8 rounded-[32px] box-border flex flex-col items-start transition-all"
        style={{
          background: 'rgba(255, 255, 255, 0.88)',
          border: '1px solid rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          boxShadow:
            '0px 25px 70px -15px rgba(100, 116, 139, 0.25), 0px 8px 24px -4px rgba(71, 85, 105, 0.08), inset 0px 0px 0px 2px rgba(255, 255, 255, 0.8)',
          padding: '44px 40px',
          gap: '23px',
        }}
      >
        {/* Top Icon Badge: Emblem Symbol */}
        <div className="w-full flex justify-center items-start">
          <div
            className="w-[58px] h-[58px] rounded-[16px] flex items-center justify-center relative box-border"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #4F46E5',
              boxShadow:
                '0px 2px 8px rgba(0, 0, 0, 0.04), inset 0px 0px 0px 2px rgba(255, 255, 255, 0.9)',
            }}
          >
            <img
              src="/kalpanaaa-emblem.png"
              alt="KALPANAAA Emblem"
              className="w-[42px] h-[36px] object-contain"
            />
          </div>
        </div>

        {/* Card Title and Explanatory Description */}
        <div className="w-full flex flex-col items-center gap-[6.97px]">
          {/* Heading 1 */}
          <h1
            className="w-full text-center font-bold tracking-[-0.625px] text-[#0F172A]"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '25px',
              lineHeight: '38px',
            }}
          >
            Sign in with email
          </h1>

          {/* Subtitle */}
          <p
            className="text-center font-normal text-[#64748B] max-w-[275px] mx-auto"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '13.5px',
              lineHeight: '22px',
            }}
          >
            Log in to manage your workspace and
            <br />
            company operations.
          </p>
        </div>

        {/* AuthenticationForm */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-[14px] pt-[5px]">
          {/* Email Input Field */}
          <div className="w-full relative flex items-center">
            <div className="absolute left-[14px] top-1/2 -translate-y-1/2 pointer-events-none text-[#94A3B8] flex items-center justify-center">
              <Mail className="w-[20px] h-[20px] stroke-[#94A3B8]" strokeWidth={1.5} />
            </div>
            <input
              id="login-email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              disabled={isLoading}
              autoFocus
              className="w-full h-[50px] bg-[#F1F4F8] rounded-[12px] pl-[44px] pr-[16px] text-[14px] text-[#0F172A] placeholder-[#94A3B8] border border-transparent focus:border-[#4F46E5]/40 focus:bg-white focus:outline-none transition-colors"
              style={{ fontFamily: "'Inter', sans-serif" }}
            />
          </div>

          {/* Password Input Field */}
          <div className="w-full relative flex items-center">
            <div className="absolute left-[14px] top-1/2 -translate-y-1/2 pointer-events-none text-[#94A3B8] flex items-center justify-center">
              <Lock className="w-[20px] h-[20px] stroke-[#94A3B8]" strokeWidth={1.5} />
            </div>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              disabled={isLoading}
              className="w-full h-[50px] bg-[#F1F4F8] rounded-[12px] pl-[44px] pr-[44px] text-[14px] text-[#0F172A] placeholder-[#94A3B8] border border-transparent focus:border-[#4F46E5]/40 focus:bg-white focus:outline-none transition-colors"
              style={{ fontFamily: "'Inter', sans-serif" }}
            />
            <button
              type="button"
              aria-label="Toggle password visibility"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-[14px] top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B] transition-colors p-0 border-0 bg-transparent cursor-pointer flex items-center justify-center"
            >
              {showPassword ? (
                <Eye className="w-[20px] h-[20px] stroke-[#94A3B8]" strokeWidth={1.5} />
              ) : (
                <EyeOff className="w-[20px] h-[20px] stroke-[#94A3B8]" strokeWidth={1.5} />
              )}
            </button>
          </div>

          {/* Forgot Password Action Link & Remember Me Row */}
          <div className="w-full flex items-center justify-between pt-[1px] pb-[6px]">
            {/* Remember Me Checkbox & Label */}
            <label
              htmlFor="remember-me-checkbox"
              className="flex items-center gap-[8px] cursor-pointer select-none"
            >
              <div
                id="remember-me-checkbox"
                role="checkbox"
                aria-checked={rememberMe}
                tabIndex={0}
                onClick={() => setRememberMe((prev) => !prev)}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    setRememberMe((prev) => !prev);
                  }
                }}
                className={`w-[16px] h-[16px] rounded-[4px] flex items-center justify-center transition-colors cursor-pointer ${
                  rememberMe
                    ? 'bg-[#4F46E5]'
                    : 'bg-transparent border border-[#94A3B8] hover:border-[#64748B]'
                }`}
              >
                {rememberMe && <Check className="w-[12px] h-[12px] text-white stroke-[2.5]" />}
              </div>
              <span
                className="text-[12px] leading-[16px] text-[#475569] font-normal"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Remember Me
              </span>
            </label>

            {/* Forgot Password Link */}
            <button
              type="button"
              onClick={() => {
                setErrorMessage(null);
                setSuccessMessage(null);
                setIsForgotPasswordOpen(true);
              }}
              className="text-[13px] leading-[20px] text-[#475569] font-medium hover:text-[#0F172A] transition-colors p-0 border-0 bg-transparent cursor-pointer"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Forgot password?
            </button>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="w-full text-center text-[12px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/80 rounded-[8px] py-2 px-3 animate-fadeIn">
              {successMessage}
            </div>
          )}

          {/* Inline Error Message */}
          {errorMessage && (
            <div className="w-full text-center text-[12px] font-medium text-rose-600 bg-rose-50/80 border border-rose-200/80 rounded-[8px] py-1.5 px-3 animate-fadeIn">
              {errorMessage}
            </div>
          )}

          {/* Primary Call To Action Button → Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-[48px] bg-[#4F46E5] hover:bg-[#4338CA] active:bg-[#3730A3] text-white font-semibold text-[15px] leading-[22px] tracking-[0.375px] rounded-[12px] transition-all flex items-center justify-center cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              fontFamily: "'Inter', sans-serif",
              boxShadow: '0px 4px 14px rgba(15, 23, 42, 0.25)',
            }}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-[18px] h-[18px] animate-spin text-white" />
                <span>Signing in...</span>
              </div>
            ) : (
              <span>Login</span>
            )}
          </button>
        </form>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        initialEmail={email}
        onSuccess={(resetEmail) => {
          setEmail(resetEmail);
          setPassword('');
          setErrorMessage(null);
          setSuccessMessage('Your password has been successfully reset. Please log in with your new password.');
        }}
      />
    </div>
  );
};
