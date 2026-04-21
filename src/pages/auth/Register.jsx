import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AtSign, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { registerUser, clearError } from '../../features/authSlice';
import AuthShell from '../../components/common/AuthShell';
import InlineLoader from '../../components/common/InlineLoader';

const schema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  username: z.string().trim().min(3, 'Username must be at least 3 characters'),
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const registerHighlights = [
  {
    title: 'Set up in minutes',
    text: 'Create your account quickly and open a cleaner workspace for your daily investing routine.',
  },
  {
    title: 'Built for clarity',
    text: 'Track your watchlist, portfolio, and activity in one place without unnecessary clutter.',
  },
];

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { loading, error, token, user } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onTouched',
  });

  const passwordValue = watch('password', '');

  useEffect(() => {
    if (token) {
      navigate(user?.isVerified ? '/dashboard' : '/verify-email', { replace: true });
    }
  }, [token, user, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const onSubmit = async ({ name, username, email, password }) => {
    dispatch(clearError());

    await dispatch(
      registerUser({
        name: name.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        password,
      })
    );
  };

  return (
    <AuthShell
      kicker="Create account"
      title="Start with a cleaner investing setup"
      description="Create your KOLski account and get immediate access to a more organized workspace."
      highlights={registerHighlights}
      formSubtitle="Set up your details to start exploring the platform."
      footerText="Already have an account?"
      footerLinkTo="/login"
      footerLinkLabel="Sign in"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="auth-form-stack">
        <div className="mb-3">
          <label className="form-label">Full name</label>
          <div className={`auth-input-wrap ${errors.name ? 'has-error' : ''}`}>
            <User size={18} className="auth-input-icon" />
            <input
              type="text"
              className={`form-control ${errors.name ? 'is-invalid' : ''}`}
              placeholder="John Doe"
              autoComplete="name"
              aria-invalid={Boolean(errors.name)}
              {...register('name')}
            />
          </div>
          {errors.name && <p className="error-text">{errors.name.message}</p>}
        </div>

        <div className="mb-3">
          <label className="form-label">Username</label>
          <div className={`auth-input-wrap ${errors.username ? 'has-error' : ''}`}>
            <AtSign size={18} className="auth-input-icon" />
            <input
              type="text"
              className={`form-control ${errors.username ? 'is-invalid' : ''}`}
              placeholder="johndoe"
              autoComplete="username"
              aria-invalid={Boolean(errors.username)}
              {...register('username')}
            />
          </div>
          {!errors.username ? (
            <p className="auth-helper-text">Use a simple name people can recognize inside your workspace.</p>
          ) : null}
          {errors.username && <p className="error-text">{errors.username.message}</p>}
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
          <label className="form-label">Password</label>
          <div className={`auth-input-wrap ${errors.password ? 'has-error' : ''}`}>
            <Lock size={18} className="auth-input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              placeholder="••••••••"
              autoComplete="new-password"
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
          <div className="auth-password-hint">
            <span className={passwordValue.length >= 8 ? 'is-met' : ''}>At least 8 characters</span>
            <span className={/[A-Za-z]/.test(passwordValue) && /\d/.test(passwordValue) ? 'is-met' : ''}>
              Letters and numbers recommended
            </span>
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label">Confirm password</label>
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

        <button
          type="submit"
          className="btn btn-primary w-100 py-2 premium-auth-btn"
          disabled={loading}
        >
          {loading ? <InlineLoader label="Creating account..." /> : 'Create Account'}
        </button>

        <p className="auth-submit-note">Create your account now and start with a cleaner investing workflow.</p>
      </form>
    </AuthShell>
  );
} 