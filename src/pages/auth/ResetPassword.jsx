import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, KeyRound, Lock, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  clearError,
  clearPasswordResetState,
  resetForgotPassword,
  verifyPasswordResetOtp,
} from '../../features/authSlice';
import AuthShell from '../../components/common/AuthShell';
import InlineLoader from '../../components/common/InlineLoader';

const schema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  otp: z.string().trim().length(6, 'Enter the 6-digit code'),
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional(),
});

const resetHighlights = [
  {
    title: 'Verify in two quick steps',
    text: 'Confirm your email code first, then choose a new password to regain access safely.',
  },
  {
    title: 'Built for account safety',
    text: 'Your recovery flow uses a time-limited code and a secure reset token.',
  },
];

export default function ResetPassword() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { error, token, passwordReset } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(Boolean(passwordReset?.resetToken));
  const [submitting, setSubmitting] = useState(false);

  const initialEmail = location.state?.email || passwordReset?.email || '';

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: initialEmail,
      otp: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onTouched',
  });

  useEffect(() => {
    if (token) navigate('/dashboard', { replace: true });
  }, [token, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (passwordReset?.resetToken) {
      setIsCodeVerified(true);
    }
  }, [passwordReset?.resetToken]);

  const onSubmit = async (formData) => {
    dispatch(clearError());
    const normalizedEmail = formData.email.trim().toLowerCase();
    setSubmitting(true);

    if (!isCodeVerified) {
      try {
        const payload = await dispatch(
          verifyPasswordResetOtp({
            email: normalizedEmail,
            otp: formData.otp.trim(),
          })
        ).unwrap();

        setIsCodeVerified(true);
        toast.success(payload?.message || 'Code verified. You can now set a new password.');
      } catch {
        // handled by slice error state and toast
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (!formData.newPassword || formData.newPassword.length < 8) {
      setError('newPassword', {
        type: 'manual',
        message: 'New password must be at least 8 characters',
      });
      return;
    }

    if (formData.confirmPassword !== formData.newPassword) {
      setError('confirmPassword', {
        type: 'manual',
        message: "Passwords don't match",
      });
      return;
    }

    try {
      const payload = await dispatch(
        resetForgotPassword({
          resetToken: passwordReset?.resetToken,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        })
      ).unwrap();

      toast.success(payload?.message || 'Password reset successful. You can sign in now.');
      dispatch(clearPasswordResetState());
      navigate('/login', { replace: true });
    } catch {
      // handled by slice error state and toast
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      kicker="Reset password"
      title={isCodeVerified ? 'Create a new password' : 'Verify your reset code'}
      description="Use the one-time code from your email to confirm your identity and restore access securely."
      highlights={resetHighlights}
      formSubtitle="Complete the reset flow for your KOLski account."
      footerText="Need a fresh code?"
      footerLinkTo="/forgot-password"
      footerLinkLabel="Request another one"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="auth-form-stack">
        <div className="auth-step-badge">
          {isCodeVerified ? 'Step 2 of 2 — choose a new password' : 'Step 1 of 2 — verify your code'}
        </div>

        <div className="mb-3">
          <label className="form-label">Email address</label>
          <div className={`auth-input-wrap ${errors.email ? 'has-error' : ''}`}>
            <Mail size={18} className="auth-input-icon" />
            <input
              type="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              placeholder="you@example.com"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              {...register('email')}
            />
          </div>
          {errors.email && <p className="error-text">{errors.email.message}</p>}
        </div>

        <div className="mb-3">
          <label className="form-label">6-digit code</label>
          <div className={`auth-input-wrap ${errors.otp ? 'has-error' : ''}`}>
            <KeyRound size={18} className="auth-input-icon" />
            <input
              type="text"
              inputMode="numeric"
              className={`form-control ${errors.otp ? 'is-invalid' : ''}`}
              placeholder="123456"
              autoComplete="one-time-code"
              aria-invalid={Boolean(errors.otp)}
              {...register('otp')}
            />
          </div>
          {errors.otp && <p className="error-text">{errors.otp.message}</p>}
        </div>

        {isCodeVerified ? (
          <>
            <div className="mb-3">
              <label className="form-label">New password</label>
              <div className={`auth-input-wrap ${errors.newPassword ? 'has-error' : ''}`}>
                <Lock size={18} className="auth-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  aria-invalid={Boolean(errors.newPassword)}
                  {...register('newPassword')}
                />
                <button
                  type="button"
                  className="auth-visibility-btn"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.newPassword && <p className="error-text">{errors.newPassword.message}</p>}
            </div>

            <div className="mb-4">
              <label className="form-label">Confirm new password</label>
              <div className={`auth-input-wrap ${errors.confirmPassword ? 'has-error' : ''}`}>
                <Lock size={18} className="auth-input-icon" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  aria-invalid={Boolean(errors.confirmPassword)}
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  className="auth-visibility-btn"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="error-text">{errors.confirmPassword.message}</p>}
            </div>
          </>
        ) : null}

        <button
          type="submit"
          className="btn btn-primary w-100 py-2 premium-auth-btn"
          disabled={submitting}
        >
          {submitting ? (
            <InlineLoader label={isCodeVerified ? 'Saving password...' : 'Verifying code...'} />
          ) : isCodeVerified ? (
            'Reset password'
          ) : (
            'Verify code'
          )}
        </button>

        <p className="auth-submit-note">
          {isCodeVerified
            ? 'Choose a strong new password, then return to sign in.'
            : 'Enter the code from your email before setting a new password.'}
        </p>

        <p className="auth-inline-note">
          Back to{' '}
          <Link to="/login" className="auth-inline-link">
            sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
