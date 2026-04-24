import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { loginUser, clearError } from '../../features/authSlice';
import AuthShell from '../../components/common/AuthShell';
import InlineLoader from '../../components/common/InlineLoader';

const schema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const loginHighlights = [
  {
    title: 'Fast access to your workspace',
    text: 'Jump back into your dashboard, portfolio, and watchlist from one secure sign-in.',
  },
  {
    title: 'Cleaner daily routine',
    text: 'Return to a calmer investing experience built to reduce noise and keep you focused.',
  },
];

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { error, token } = useSelector((state) => state.auth);

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

  const onSubmit = async (formData) => {
    dispatch(clearError());
    setSubmitting(true);
    try {
      await dispatch(
        loginUser({
          ...formData,
          email: formData.email.trim().toLowerCase(),
        })
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      kicker="Welcome back"
      title="Sign in to your investment workspace"
      description="Continue where you left off with a cleaner, more organized view of your investing flow."
      highlights={loginHighlights}
      formSubtitle="Enter your details to continue to KOLski."
      footerText="Don't have an account?"
      footerLinkTo="/register"
      footerLinkLabel="Create one"
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

        <div className="mb-4">
          <label className="form-label">Password</label>
          <div className={`auth-input-wrap ${errors.password ? 'has-error' : ''}`}>
            <Lock size={18} className="auth-input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              placeholder="••••••••"
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              {...register('password')}
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
          {errors.password && <p className="error-text">{errors.password.message}</p>}
          <div className="auth-form-meta">
            <Link to="/forgot-password" className="auth-inline-link">
              Forgot password?
            </Link>
            <Link to="/verify-email" className="auth-inline-link">
              Verify email
            </Link>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100 py-2 premium-auth-btn"
          disabled={submitting}
        >
          {submitting ? <InlineLoader label="Signing in..." /> : 'Sign In'}
        </button>

        <p className="auth-submit-note">Secure sign-in with quick access to your personal workspace.</p>
      </form>
    </AuthShell>
  );
}