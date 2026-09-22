import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ArrowRight, PlayCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { loginAsDemo } from '../../features/authSlice';

export default function HeroSection({ reasonsToJoin = [] }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [startingDemo, setStartingDemo] = useState(false);

  const handleTryDemo = async () => {
    setStartingDemo(true);
    try {
      await dispatch(loginAsDemo()).unwrap();
      navigate('/dashboard');
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Could not start the demo. Please try again.');
    } finally {
      setStartingDemo(false);
    }
  };

  return (
    <div className="landing-hero__copy">
      <span className="page-kicker">Invest smarter with KOLski</span>
      <h1>Your premium command center for modern investing.</h1>
      <p>
        KOLski helps you track your portfolio, monitor markets, manage your watchlist,
        review activity history, and act on opportunities from one intelligent workspace.
      </p>

      <div className="landing-actions">
        <Link to="/register" className="landing-btn landing-btn--primary">
          <span>Create your free account</span>
          <ArrowRight size={18} />
        </Link>

        <button
          type="button"
          className="landing-btn landing-btn--secondary"
          onClick={handleTryDemo}
          disabled={startingDemo}
        >
          <PlayCircle size={18} />
          <span>{startingDemo ? 'Starting demo...' : 'Try the live demo'}</span>
        </button>

        <Link to="/login" className="landing-btn landing-btn--ghost">
          Sign in
        </Link>
      </div>

      <p className="landing-hero__demo-note">
        No sign-up required. Explores a shared sample portfolio with real trade history; data resets daily.
      </p>

      <ul className="landing-points">
        {reasonsToJoin.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
