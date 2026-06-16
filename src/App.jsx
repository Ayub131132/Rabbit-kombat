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

  useEffect(() => {
    const tg = window.Telegram?.WebApp;

    if (tg) {
      tg.ready();
      tg.expand();

      const authenticate = async () => {
        try {
          const initData = tg.initData;

          if (!initData) {
            console.warn('Demo Mode: No Telegram initData found');
            setIsAuthLoading(false);
            return;
          }

          // POST to backend for verification and JWT
          const response = await api.post('/auth/telegram', { initData });

          if (response.success) {
            localStorage.setItem('jwt_token', response.token);
            setUser(response.user);
          } else {
            console.error('Authentication failed:', response.error);
          }
        } catch (err) {
          console.error('Connection error to backend:', err);
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
      <div className="loading-screen" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        color: '#fff',
        background: '#000'
      }}>
        <div className="loader">Authenticating...</div>
      </div>
    );
  }

  const renderPage = () => {
    switch (page) {
      case 'home': return <Home />;
      case 'earn': return <Earn />;
      case 'mining': return <Mining />;
      case 'friends': return <Friends />;
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
      <header style={{ padding: '20px', textAlign: 'center' }}>
        <h1>{user ? `Welcome, ${user.first_name}` : 'Demo Mode'}</h1>
      </header>

      <div className="content">
        {renderPage()}
      </div>

      <div className="bottom-nav">
        <div 
          className="nav-indicator" 
          style={{ transform: `translateX(${activeIndex * 100}%)` }}
        />

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