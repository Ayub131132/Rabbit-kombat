import { useState, useEffect } from 'react';
import './App.css';
import { api } from './services/api';

import homeImg from './assets/home.png';
import earnImg from './assets/earn.png';
import miningImg from './assets/mining.png';
import friendsImg from './assets/friends.png';
import leaderboardImg from './assets/leaderboard.png';

import Home from './pages/Home';
import Earn from './pages/Earn';
import Mining from './pages/Mining';
import Friends from './pages/Friends';
import Leaderboard from './pages/Leaderboard';

function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('home');
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [referralData, setReferralData] = useState(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;

    if (tg) {
      tg.ready();
      tg.expand();

      const authenticate = async () => {
        try {
          const initData = tg.initData;
          const startParam = tg.initDataUnsafe?.start_param;

          if (!initData) {
            console.warn('Demo Mode: No Telegram initData found');
            setIsAuthLoading(false);
            return;
          }

          const response = await api.post('/auth/telegram', { 
            initData, 
            start_param: startParam 
          });

          if (response.success) {
            localStorage.setItem('jwt_token', response.token);
            setUser(response.user);

            const refResponse = await api.get('/referrals/me');
            if (refResponse.success) {
              setReferralData(refResponse);
            }
          } else {
            setAuthError('Authentication failed. Access denied.');
          }
        } catch (err) {
          console.error('Auth Error:', err);
          setAuthError('Unable to connect to security server.');
        } finally {
          setIsAuthLoading(false);
        }
      };

      authenticate();
    } else {
      setIsAuthLoading(false);
    }
  }, []);

  if (isAuthLoading) {
    return (
      <div className="loading-screen">
        <div className="loader">Authenticating...</div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="auth-error-screen">
        <h2 className="auth-error-title">⚠️ Access Denied</h2>
        <p>{authError}</p>
      </div>
    );
  }

  const renderPage = () => {
    switch (page) {
      case 'home': return <Home data={referralData} />;
      case 'earn': return <Earn />;
      case 'mining': return <Mining />;
      case 'friends': return <Friends data={referralData} />;
      case 'leaderboard': return <Leaderboard />;
      default: return null;
    }
  };

  const tabs = [
    { id: 'home', icon: homeImg, label: 'Home' },
    { id: 'mining', icon: miningImg, label: 'Mining' },
    { id: 'leaderboard', icon: leaderboardImg, label: 'Leaderboard' },
    { id: 'earn', icon: earnImg, label: 'Earn' },
    { id: 'friends', icon: friendsImg, label: 'Friends' },
  ];

  const activeIndex = tabs.findIndex(t => t.id === page);

  return (
    <div className="app">
      <header className="app-header">
        <h1>{user ? `Welcome, ${user.first_name}` : 'Demo Mode'}</h1>
      </header>

      <div className="content">
        {renderPage()}
      </div>

      <div className="bottom-nav">
        <div className={`nav-indicator pos-${activeIndex}`} />

        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={page === tab.id ? 'active' : ''}
            onClick={() => setPage(tab.id)}
          >
            <img src={tab.icon} alt={tab.label} />
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;