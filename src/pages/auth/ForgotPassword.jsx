import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { clearError, requestPasswordResetOtp } from '../../features/authSlice';
import AuthShell from '../../components/common/AuthShell';
import InlineLoader from '../../components/common/InlineLoader';

const schema = z.object({
  email: z.string().trim().email('Enter a valid email'),
});

const forgotHighlights = [
  {
    title: 'Secure recovery flow',
    text: 'We will send a one-time code to your email so you can verify access safely.',
  },
  {
    title: 'Quick return to your workspace',
    text: 'Complete the reset process in a few steps and get back to your dashboard faster.',
  },
];

export default function ForgotPassword() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
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

  const onSubmit = async ({ email }) => {
    dispatch(clearError());
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const payload = await dispatch(
        requestPasswordResetOtp({ email: normalizedEmail })
      ).unwrap();

      toast.success(payload?.message || 'Reset code sent. Check your email.');
      navigate('/reset-password', { state: { email: normalizedEmail } });
    } catch {
      // handled via slice error state and toast
    }
  };

  return (
    <AuthShell
      kicker="Recover access"
      title="Forgot your password?"
      description="Enter your email and we will send a secure one-time code so you can reset your password."
      highlights={forgotHighlights}
      formSubtitle="Request a password reset code for your KOLski account."
      footerText="Remembered your password?"
      footerLinkTo="/login"
      footerLinkLabel="Back to sign in"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="auth-form-stack">
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

        <button
          type="submit"
          className="btn btn-primary w-100 py-2 premium-auth-btn"
          disabled={loading}
        >
          {loading ? <InlineLoader label="Sending code..." /> : 'Send reset code'}
        </button>

        <p className="auth-submit-note">
          We will email a 6-digit OTP that you can use on the next screen.
        </p>

        <p className="auth-inline-note">
          Already have a code?{' '}
          <Link to="/reset-password" className="auth-inline-link">
            Go to reset page
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
