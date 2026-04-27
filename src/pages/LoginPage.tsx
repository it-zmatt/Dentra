import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Input,
  Button,
  Spinner,
  Text,
  Label,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import { Eye24Regular, EyeOff24Regular } from '@fluentui/react-icons';
import { useAuth } from '../hooks/useAuth';
import { useSettingsStore } from '../store/settingsStore';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: tokens.colorNeutralBackground1,
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    padding: '40px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
  },
  header: {
    marginBottom: '32px',
    textAlign: 'center',
  },
  clinicName: {
    fontSize: '28px',
    fontWeight: 600,
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: tokens.colorNeutralForeground3,
  },
  formGroup: {
    marginBottom: '16px',
  },
  inputWrapper: {
    position: 'relative',
  },
  passwordToggle: {
    position: 'absolute',
    right: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    color: tokens.colorNeutralForeground3,
    '&:hover': {
      color: tokens.colorNeutralForeground2,
    },
  },
  submitButton: {
    width: '100%',
    marginTop: '24px',
    height: '40px',
  },
  errorMessage: {
    color: tokens.colorPaletteRedForeground1,
    fontSize: '13px',
    marginTop: '8px',
  },
  spinnerWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
});

export function LoginPage() {
  const styles = useStyles();
  const { t } = useTranslation();
  const { login } = useAuth();
  const { global: globalSettings } = useSettingsStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    // Clear previous error
    setError('');

    // Validate inputs
    if (!email || !password) {
      setError(t('common.error'));
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);
      // On successful login, the auth store is updated and App.tsx will handle routing
    } catch (err) {
      // Map known errors to i18n keys, default to generic error
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes('Invalid credentials')) {
        setError(t('login.errorInvalidCredentials'));
      } else {
        setError(t('login.errorGeneric'));
      }
      // Clear password field on error
      setPassword('');
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const clinicName = globalSettings?.clinicName || t('login.clinicName');

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.clinicName}>{clinicName}</div>
          <Text className={styles.subtitle}>{t('login.title')}</Text>
        </div>

        {/* Email Input */}
        <div className={styles.formGroup}>
          <Label htmlFor="email-input">{t('login.email')}</Label>
          <Input
            id="email-input"
            type="email"
            placeholder={t('login.email')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            size="large"
          />
        </div>

        {/* Password Input */}
        <div className={styles.formGroup}>
          <Label htmlFor="password-input">{t('login.password')}</Label>
          <div className={styles.inputWrapper}>
            <Input
              id="password-input"
              type={showPassword ? 'text' : 'password'}
              placeholder={t('login.password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              size="large"
            />
            <button
              className={styles.passwordToggle}
              onClick={() => setShowPassword(!showPassword)}
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              disabled={isLoading}
            >
              {showPassword ? <EyeOff24Regular /> : <Eye24Regular />}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && <Text className={styles.errorMessage}>{error}</Text>}

        {/* Submit Button */}
        <Button
          appearance="primary"
          className={styles.submitButton}
          onClick={() => handleSubmit()}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className={styles.spinnerWrapper}>
              <Spinner size="tiny" />
              <span>{t('login.loggingIn')}</span>
            </div>
          ) : (
            t('login.submit')
          )}
        </Button>
      </Card>
    </div>
  );
}
