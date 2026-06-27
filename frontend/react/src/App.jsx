// App.jsx - Root React component and route definitions
import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { api } from './api/client.js';
import { AuthModal } from './components/AuthModal.jsx';
import { Layout } from './components/Layout.jsx';
import { AdminPage } from './pages/AdminPage.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { ListingsPage } from './pages/ListingsPage.jsx';
import { UserPage } from './pages/UserPage.jsx';

function App() {
  const [user, setUser] = useState(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [authModal, setAuthModal] = useState({
    open: false,
    mode: 'login',
  });

  useEffect(() => {
    api.currentUser()
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setSessionLoaded(true));
  }, []);

  const openAuth = (mode = 'login') => {
    setAuthModal({
      open: true,
      mode,
    });
  };

  const closeAuth = () => {
    setAuthModal((current) => ({
      ...current,
      open: false,
    }));
  };

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
  };

  if (!sessionLoaded) {
    return <div className="screen-message">Loading...</div>;
  }

  return (
    <Layout user={user} onLogout={handleLogout} onOpenAuth={openAuth}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/listings" element={<ListingsPage user={user} onOpenAuth={openAuth} />} />
        <Route path="/user" element={<UserPage user={user} setUser={setUser} onOpenAuth={openAuth} />} />
        <Route path="/admin" element={<AdminPage user={user} setUser={setUser} />} />
      </Routes>

      <AuthModal
        open={authModal.open}
        mode={authModal.mode}
        onClose={closeAuth}
        onAuth={setUser}
      />
    </Layout>
  );
}

export default App;
