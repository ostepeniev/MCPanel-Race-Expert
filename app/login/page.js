'use client';

/**
 * Login Page — MCPanel v2.0
 *
 * Full-screen dark login with glassmorphism card.
 * Single-user auth: Admin / Rozum
 */

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Eye, EyeOff, AlertTriangle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);

  // Rate limiting: block after 5 failed attempts for 60s
  const [blockedUntil, setBlockedUntil] = useState(0);
  const isBlocked = Date.now() < blockedUntil;

  async function handleSubmit(e) {
    e.preventDefault();

    if (isBlocked) {
      const secsLeft = Math.ceil((blockedUntil - Date.now()) / 1000);
      setError(`Забагато спроб. Зачекайте ${secsLeft} секунд.`);
      return;
    }

    if (!username.trim() || !password.trim()) {
      setError('Введіть логін і пароль');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        username: username.trim(),
        password: password.trim(),
        redirect: false,
      });

      if (result?.error) {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (newAttempts >= 5) {
          setBlockedUntil(Date.now() + 60_000);
          setError('Забагато невдалих спроб. Зачекайте 60 секунд.');
          setAttempts(0);
        } else {
          setError(`Невірний логін або пароль (спроба ${newAttempts}/5)`);
        }
      } else {
        // Success — redirect
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError('Помилка з\'єднання. Спробуйте пізніше.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-bg-effects">
        <div className="login-orb login-orb-1" />
        <div className="login-orb login-orb-2" />
        <div className="login-orb login-orb-3" />
      </div>

      <form onSubmit={handleSubmit} className="login-card" autoComplete="off">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <Shield size={32} />
          </div>
          <h1 className="login-title">MCPanel</h1>
          <p className="login-subtitle">Mission Control · Race Expert</p>
        </div>

        {/* Error */}
        {error && (
          <div className="login-error">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Username */}
        <div className="login-field">
          <label htmlFor="login-username">Логін</label>
          <input
            id="login-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Введіть логін"
            autoComplete="username"
            disabled={isLoading || isBlocked}
            autoFocus
          />
        </div>

        {/* Password */}
        <div className="login-field">
          <label htmlFor="login-password">Пароль</label>
          <div className="login-password-wrapper">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введіть пароль"
              autoComplete="current-password"
              disabled={isLoading || isBlocked}
            />
            <button
              type="button"
              className="login-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              aria-label={showPassword ? 'Сховати пароль' : 'Показати пароль'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="login-submit"
          disabled={isLoading || isBlocked}
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="login-spinner" />
              Вхід...
            </>
          ) : (
            'Увійти'
          )}
        </button>

        {/* Security notice */}
        <p className="login-security-note">
          🔒 Захищене з&apos;єднання · Сесія 30 днів
        </p>
      </form>
    </div>
  );
}
