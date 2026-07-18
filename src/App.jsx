import { useState } from 'react';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';

import LoadingScreen from './components/LoadingScreen';
import Layout from './components/Layout';

import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import CreateSkillPage from './pages/CreateSkillPage';
import CreateRequestPage from './pages/CreateRequestPage';
import RequestsPage from './pages/RequestsPage';
import BookingsPage from './pages/BookingsPage';
import ProfilePage from './pages/ProfilePage';
import RankingPage from './pages/RankingPage';
import HistoryPage from './pages/HistoryPage';
import { useEffect } from 'react';

const screens = {
  home: HomePage,
  create: CreateSkillPage,
  createRequest: CreateRequestPage,
  requests: RequestsPage,
  bookings: BookingsPage,
  profile: ProfilePage,
  ranking: RankingPage,
  history: HistoryPage
};

function Router() {

  const {
    authUser,
    profile,
    loading,
    error
  } = useAuth();

  const [page, setPage] = useState('home');

  useEffect(() => {
    if (profile && typeof Notification !== 'undefined' && Notification.permission === 'default') Notification.requestPermission();
  }, [profile]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!authUser || !profile) {
    return <AuthPage />;
  }

  const Screen = screens[page] || HomePage;

  return (
    <Layout
      page={page}
      setPage={setPage}
      profile={profile}
      authUser={authUser}
    >
      {error && (
        <p className="message error">
          {error}
        </p>
      )}

      <Screen setPage={setPage} />
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router />
      </ToastProvider>
    </AuthProvider>
  );
}
