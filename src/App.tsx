import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { LoginPage } from '@/components/auth/LoginPage';
import { RegisterPage } from '@/components/auth/RegisterPage';
import { Dashboard } from '@/components/dashboard/Dashboard';

type AuthView = 'login' | 'register';

export function App() {
  const { isAuthenticated } = useAuthStore();
  const [authView, setAuthView] = useState<AuthView>('login');

  if (isAuthenticated) {
    return <Dashboard />;
  }

  if (authView === 'register') {
    return <RegisterPage onSwitchToLogin={() => setAuthView('login')} />;
  }

  return <LoginPage onSwitchToRegister={() => setAuthView('register')} />;
}
