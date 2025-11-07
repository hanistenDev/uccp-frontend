import React, { useEffect, useState } from 'react';
import api from './api';

const LANGUAGE_NAMES = {
  en: 'English',
  de: 'Deutsch',
};

// ----------------------------
// Kleine „Navigation“ per Hash
// ----------------------------
const getRoute = () => (window.location.hash.replace('#', '') || '/');

export default function App() {
  const [language, setLanguage] = useState(() => {
    if (typeof window === 'undefined') return 'en';
    const stored = localStorage.getItem('language');
    return stored && LANGUAGE_NAMES[stored] ? stored : 'en';
  });
  const [route, setRoute] = useState(getRoute());   // '/' oder '/login'
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') localStorage.setItem('language', language);
  }, [language]);

  // Hash-Änderungen beobachten
  useEffect(() => {
    const onHashChange = () => setRoute(getRoute());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Beim Start: bin ich eingeloggt?
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/auth/me');
        setUser(data.user);
        localStorage.setItem('user_name', data.user?.name || '');
        if (getRoute() === '/login') window.location.hash = '#/'; // schon eingeloggt → Dashboard
      } catch {
        setUser(null);
        if (getRoute() !== '/login') window.location.hash = '#/login';
      }
    })();
  }, []);

  if (route === '/login') {
    return (
      <LoginPage
        language={language}
        onLanguageChange={setLanguage}
        onLoggedIn={(u) => {
          // <<< HIER: echten User aus dem Backend übernehmen
          setUser(u);
          localStorage.setItem('user_name', u?.name || '');
          window.location.hash = '#/';
        }}
      />
    );
  }

  return (
    <Dashboard
      language={language}
      onLanguageChange={setLanguage}
      user={user}
      onLogout={() => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_name');
        setUser(null);
        window.location.hash = '#/login';
      }}
    />
  );
}

// ----------------------------
// Login-Seite (vollbild)
// ----------------------------
function LoginPage({ onLoggedIn, language, onLanguageChange }) {
  const translations = {
    en: {
      subtitle: 'Please sign in',
      usernameLabel: 'Username',
      passwordLabel: 'Password',
      submitLabel: 'Log in',
      genericError: 'Login failed',
      languageLabel: 'Language',
    },
    de: {
      subtitle: 'Bitte melden Sie sich an',
      usernameLabel: 'Benutzername',
      passwordLabel: 'Passwort',
      submitLabel: 'Anmelden',
      genericError: 'Login fehlgeschlagen',
      languageLabel: 'Sprache',
    },
  };
  const [form, setForm] = useState({ username: '', password: '' });
  const [err, setErr] = useState(null);

  const t = translations[language] || translations.en;

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    try {
      const { data } = await api.post('/auth/login', form);
      // Token & Name speichern
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_name', data.user?.name || '');
      // <<< WICHTIG: echten User nach oben geben
      onLoggedIn(data.user);
    } catch (e) {
      const apiMessage = e?.response?.data?.error;
      if (apiMessage) setErr({ type: 'api', message: apiMessage });
      else setErr({ type: 'generic' });
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg,#6b74f7 0%, #7a57d1 100%)',
        padding: 16,
      }}
    >
      <form
        onSubmit={submit}
        style={{
          width: 380,
          maxWidth: '95vw',
          background: '#fff',
          borderRadius: 16,
          padding: 24,
          boxShadow: '0 20px 50px rgba(0,0,0,.12)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: '#f1f5f9',
              borderRadius: 999,
              padding: '4px 8px 4px 12px',
              fontSize: 12,
              color: '#475569',
            }}
          >
            <span style={{ fontWeight: 600 }}>{t.languageLabel}</span>
            {Object.keys(LANGUAGE_NAMES).map((code) => {
              const active = language === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => onLanguageChange(code)}
                  style={{
                    border: 0,
                    borderRadius: 999,
                    padding: '4px 10px',
                    fontSize: 12,
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    background: active ? '#6366f1' : 'transparent',
                    color: active ? '#fff' : '#475569',
                  }}
                >
                  {LANGUAGE_NAMES[code]}
                </button>
              );
            })}
          </div>
        </div>

        <h2 style={{ margin: 0, textAlign: 'center' }}>UCCP DataVision</h2>
        <p style={{ marginTop: 8, color: '#64748b', textAlign: 'center' }}>
          {t.subtitle}
        </p>

        <label style={{ fontSize: 13, color: '#475569' }}>{t.usernameLabel}</label>
        <input
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
          style={{
            width: '100%',
            padding: '10px 12px',
            marginTop: 6,
            marginBottom: 12,
            borderRadius: 10,
            border: '1px solid #e5e7eb',
            background: '#f8fafc',
          }}
        />

        <label style={{ fontSize: 13, color: '#475569' }}>{t.passwordLabel}</label>
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          style={{
            width: '100%',
            padding: '10px 12px',
            marginTop: 6,
            marginBottom: 16,
            borderRadius: 10,
            border: '1px solid #e5e7eb',
            background: '#f8fafc',
          }}
        />

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '12px 14px',
            border: 0,
            borderRadius: 12,
            background: 'linear-gradient(90deg,#6366f1,#8b5cf6)',
            color: '#fff',
            fontWeight: 700,
            letterSpacing: 0.3,
            cursor: 'pointer',
          }}
        >
          {t.submitLabel}
        </button>

        {err && (
          <div style={{ color: '#ef4444', marginTop: 10, textAlign: 'center' }}>
            {err.type === 'api' ? err.message : t.genericError}
          </div>
        )}

        <div
          style={{
            marginTop: 14,
            fontSize: 12,
            color: '#94a3b8',
            textAlign: 'center',
          }}
        >
          © {new Date().getFullYear()} UCCP DataVision
        </div>
      </form>
    </div>
  );
}

// ----------------------------
// Dashboard (deine aktuelle Seite)
// ----------------------------
function Dashboard({ user, onLogout, language, onLanguageChange }) {
  const translations = {
    en: {
      loggedInAs: 'Logged in as',
      logout: 'Log out',
      languageLabel: 'Language',
      subtitle: 'Analyze work code statistics for any date range',
      workcodeLabel: 'Work Code (optional)',
      workcodePlaceholder: 'e.g. PCMO.OC1, KCPF.BD1, KCPF.BD15',
      fromLabel: 'From date *',
      toLabel: 'To date *',
      submitIdle: 'ANALYZE',
      submitLoading: 'Loading…',
      missingDates: 'Please provide a start and end date.',
      invalidRange: 'Start date must be before end date.',
      dataFetchError: 'Failed to load data.',
      resultTitle: 'Result',
      resultCommunication: 'Communication:',
      resultForAll: 'All types',
      resultDateRange: 'Date range:',
      resultCount: 'Sent count:',
      resultCountSuffix: 'times',
      errorTitle: 'Error',
      footerBuiltBy: 'Built by Hanisten Thivakaran',
    },
    de: {
      loggedInAs: 'Angemeldet als',
      logout: 'Abmelden',
      languageLabel: 'Sprache',
      subtitle: 'Analysieren Sie Work Code Statistiken für beliebige Zeiträume',
      workcodeLabel: 'Work Code (optional)',
      workcodePlaceholder: 'z.B. PCMO.OC1, KCPF.BD1, KCPF.BD15',
      fromLabel: 'Von Datum *',
      toLabel: 'Bis Datum *',
      submitIdle: 'ANALYSIEREN',
      submitLoading: 'Wird geladen…',
      missingDates: 'Bitte Start- und Enddatum eingeben.',
      invalidRange: 'Startdatum muss vor Enddatum liegen.',
      dataFetchError: 'Fehler beim Laden der Daten.',
      resultTitle: 'Ergebnis',
      resultCommunication: 'Kommunikation:',
      resultForAll: 'Alle Typen',
      resultDateRange: 'Zeitraum:',
      resultCount: 'Anzahl versendet:',
      resultCountSuffix: 'mal',
      errorTitle: 'Fehler',
      footerBuiltBy: 'Erstellt von Hanisten Thivakaran',
    },
  };

  const t = translations[language] || translations.en;
  const [formData, setFormData] = useState({ workcode: '', from: '', to: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // wenn nicht eingeloggt → zur Login-Seite
  useEffect(() => {
    if (!localStorage.getItem('auth_token')) window.location.hash = '#/login';
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (result || error) {
      setResult(null);
      setError(null);
    }
  };

  const validateForm = () => {
    if (!formData.from || !formData.to) {
      setError(t.missingDates);
      return false;
    }
    if (new Date(formData.from) > new Date(formData.to)) {
      setError(t.invalidRange);
      return false;
    }
    return true;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);
      const params = { from: formData.from, to: formData.to };
      if (formData.workcode.trim()) params.workcode = formData.workcode.trim();
      const { data } = await api.get('/api/pcmo-count', {
        params,
        timeout: 10000,
      });
      setResult(data);
    } catch (err) {
      if (err?.response?.status === 401) window.location.hash = '#/login';
      else setError(t.dataFetchError);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) fetchData();
  };

  const fmtDate = (s) =>
    new Date(s).toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

  const ResultBlock = ({ data }) => {
    const count = (data.count ?? 0).toLocaleString(language === 'de' ? 'de-CH' : 'en-US');
    return (
      <div style={{ lineHeight: 1.45, fontSize: '0.95rem', color: '#1f2937' }}>
        <div style={{ marginBottom: 4 }}>
          <span style={{ color: '#6b7280' }}>{t.resultCommunication}</span>{' '}
          <strong>{data.workcode || t.resultForAll}</strong>
        </div>
        <div style={{ marginBottom: 4 }}>
          <span style={{ color: '#6b7280' }}>{t.resultDateRange}</span>{' '}
          {fmtDate(data.from)} – {fmtDate(data.to)}
        </div>
        <div>
          <span style={{ color: '#6b7280' }}>{t.resultCount}</span>{' '}
          <strong>
            {count}
            {' '}
            {t.resultCountSuffix}
          </strong>
        </div>
      </div>
    );
  };

  // Anzeige-Name mit Fallback aus localStorage (falls Seite reloadet)
  const displayName = user?.name || localStorage.getItem('user_name') || '—';

  return (
    <div
      className="app-container"
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
    >
      {/* Top-Bar: User + Logout */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 12,
          maxWidth: 760,
          width: '100%',
          margin: '12px auto 4px',
          fontSize: 13,
          color: '#94a3b8',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {displayName && displayName !== '—' ? (
            <span>
              {t.loggedInAs}{' '}
              <strong>{displayName}</strong>
            </span>
          ) : null}
          <button
            onClick={onLogout}
            style={{
              border: 0,
              background: 'transparent',
              color: '#c7d2fe',
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
          >
            {t.logout}
          </button>
        </div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: '#f1f5f9',
            borderRadius: 999,
            padding: '4px 8px 4px 12px',
            color: '#475569',
          }}
        >
          <span style={{ fontWeight: 600 }}>{t.languageLabel}</span>
          {Object.keys(LANGUAGE_NAMES).map((code) => {
            const active = language === code;
            return (
              <button
                key={code}
                type="button"
                onClick={() => onLanguageChange(code)}
                style={{
                  border: 0,
                  borderRadius: 999,
                  padding: '4px 10px',
                  fontSize: 12,
                  fontWeight: active ? 700 : 500,
                  cursor: 'pointer',
                  background: active ? '#6366f1' : 'transparent',
                  color: active ? '#fff' : '#475569',
                }}
              >
                {LANGUAGE_NAMES[code]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Header */}
      <div className="header" style={{ textAlign: 'center', marginTop: 16, marginBottom: 10 }}>
        <div
          style={{
            display: 'inline-block',
            padding: '6px 10px',
            marginBottom: 8,
            borderRadius: 999,
            fontWeight: 600,
            fontSize: 12,
            color: '#fff',
            background: 'linear-gradient(90deg,#6366f1,#8b5cf6)',
          }}
        >
          UCCP DataVision
        </div>
        <h1 style={{ margin: '6px 0 6px' }}>UCCP Analytics</h1>
        <p style={{ color: '#94a3b8', margin: 0 }}>
          {t.subtitle}
        </p>
      </div>

      {/* Formular */}
      <div style={{ flex: 1 }}>
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="workcode">{t.workcodeLabel}</label>
            <input
              id="workcode"
              name="workcode"
              value={formData.workcode}
              onChange={handleInputChange}
              placeholder={t.workcodePlaceholder}
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="from">{t.fromLabel}</label>
            <input
              type="date"
              id="from"
              name="from"
              value={formData.from}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="to">{t.toLabel}</label>
            <input
              type="date"
              id="to"
              name="to"
              value={formData.to}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>
          <button className="submit-btn" disabled={loading || !formData.from || !formData.to}>
            {loading ? t.submitLoading : t.submitIdle}
          </button>
        </form>

        {result && (
          <div
            className="results"
            style={{
              marginTop: 18,
              background: '#f8fafc',
              borderRadius: 14,
              borderLeft: '6px solid #22c55e',
              padding: '14px 16px',
            }}
          >
            <div style={{ color: '#16a34a', fontWeight: 700, marginBottom: 6 }}>{t.resultTitle}</div>
            <ResultBlock data={result} />
          </div>
        )}

        {error && (
          <div
            className="error"
            style={{
              marginTop: 18,
              background: '#fff1f2',
              borderRadius: 14,
              borderLeft: '6px solid #ef4444',
              padding: '14px 16px',
            }}
          >
            <div style={{ color: '#b91c1c', fontWeight: 700, marginBottom: 6 }}>{t.errorTitle}</div>
            <p style={{ margin: 0 }}>{error}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer
        style={{
          padding: '16px 12px',
          textAlign: 'center',
          color: '#94a3b8',
          fontSize: 13,
        }}
      >
        © {new Date().getFullYear()} UCCP DataVision ·{' '}
        <a
          href="https://www.linkedin.com/in/hanisten-thivakaran-765043327"
          target="_blank"
          rel="noreferrer"
          style={{ color: '#c7d2fe', textDecoration: 'underline' }}
        >
          {t.footerBuiltBy}
        </a>
      </footer>
    </div>
  );
}
