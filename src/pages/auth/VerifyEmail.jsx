import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { KeyRound, Mail, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  clearError,
  sendVerificationEmailRequest,
  verifyEmailToken,
} from '../../features/authSlice';
import AuthShell from '../../components/common/AuthShell';
import InlineLoader from '../../components/common/InlineLoader';

const verifyHighlights = [
  {
    title: 'Email-first security',
    text: 'Your account verification is linked to a secure token and sign-in flow.',
  },
  {
    title: 'Manual fallback supported',
    text: 'If the email link opens on a different host, you can still paste the token and verify here.',
  },
];

export default function VerifyEmail() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const verificationToken = searchParams.get('token')?.trim() || '';
  const hasAutoTriggered = useRef(false);

  const { loading, error, user } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: user?.email || '',
      token: verificationToken,
    },
    mode: 'onTouched',
  });

  useEffect(() => {
    if (user?.email) {
      setValue('email', user.email);
    }
  }, [user?.email, setValue]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (!verificationToken || hasAutoTriggered.current) {
      return;
    }

    hasAutoTriggered.current = true;
    setValue('token', verificationToken);

    dispatch(clearError());
    dispatch(verifyEmailToken({ token: verificationToken }))
      .unwrap()
      .then((payload) => {
        toast.success(payload?.message || 'Email verified successfully.');
        navigate('/dashboard', { replace: true });
      })
      .catch(() => {
        // handled through shared auth error state
      });
  }, [dispatch, navigate, setValue, verificationToken]);

  const handleSendVerification = async () => {
    dispatch(clearError());
    const email = getValues('email')?.trim().toLowerCase() || '';

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError('email', {
        type: 'manual',
        message: 'Enter a valid email address',
      });
      return;
    }

    try {
      const payload = await dispatch(sendVerificationEmailRequest({ email })).unwrap();
      toast.success(payload?.message || 'Verification email sent.');
    } catch {
      // handled via slice state
    }
  };

  const onVerify = async ({ token }) => {
    dispatch(clearError());
    const sanitizedToken = token?.trim() || '';

    if (!sanitizedToken) {
      setError('token', {
        type: 'manual',
        message: 'Enter the verification token from your email',
      });
      return;
    }

    try {
      const payload = await dispatch(verifyEmailToken({ token: sanitizedToken })).unwrap();
      toast.success(payload?.message || 'Email verified successfully.');
      navigate('/dashboard', { replace: true });
    } catch {
      // handled via slice state
    }
  };

  return (
    <AuthShell
      kicker="Verify access"
      title="Verify your email"
      description="Complete email verification to unlock the full KOLski sign-in and session experience."
      highlights={verifyHighlights}
      formSubtitle="Use the link from your inbox or request a fresh verification email here."
      footerText="Already verified?"
      footerLinkTo="/login"
      footerLinkLabel="Back to sign in"
    >
      <form onSubmit={handleSubmit(onVerify)} noValidate className="auth-form-stack">
        <div className="auth-step-badge">
          {verificationToken ? 'Verification token detected from your email link' : 'Request or paste your token'}
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
              {...register('email')}
            />
          </div>
          {errors.email && <p className="error-text">{errors.email.message}</p>}
        </div>

        <button
          type="button"
          className="panel-button panel-button--secondary"
          onClick={handleSendVerification}
          disabled={loading}
        >
          {loading ? <InlineLoader label="Sending..." /> : 'Send verification email'}
        </button>

        <div className="mb-3 mt-3">
          <label className="form-label">Verification token</label>
          <div className={`auth-input-wrap ${errors.token ? 'has-error' : ''}`}>
            <KeyRound size={18} className="auth-input-icon" />
            <input
              type="text"
              className={`form-control ${errors.token ? 'is-invalid' : ''}`}
              placeholder="Paste token from your email"
              autoComplete="one-time-code"
              {...register('token')}
            />
          </div>
          {errors.token && <p className="error-text">{errors.token.message}</p>}
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100 py-2 premium-auth-btn"
          disabled={loading}
        >
          {loading ? <InlineLoader label="Verifying..." /> : 'Verify email now'}
        </button>

        <p className="auth-submit-note">
          Open the email link directly or paste the token above if you are testing across environments.
        </p>

        <p className="auth-inline-note">
          Need password recovery instead?{' '}
          <Link to="/forgot-password" className="auth-inline-link">
            Reset password
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
