import { useState, useEffect } from 'react';
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
import { getMachineId } from '../services/db';

interface LicenseGatePageProps {
  onValidateComplete: (licenseKey: string) => void;
}

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
    maxWidth: '450px',
    padding: '40px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
  },
  header: {
    marginBottom: '32px',
    textAlign: 'center',
  },
  title: {
    fontSize: '24px',
    fontWeight: 600,
    marginBottom: '8px',
    color: tokens.colorNeutralForeground1,
  },
  subtitle: {
    fontSize: '14px',
    color: tokens.colorNeutralForeground3,
    lineHeight: '1.5',
  },
  formGroup: {
    marginBottom: '20px',
  },
  machineIdWrapper: {
    backgroundColor: tokens.colorNeutralBackground2,
    padding: '12px',
    borderRadius: '4px',
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    fontFamily: 'monospace',
    fontSize: '12px',
    wordBreak: 'break-all',
    color: tokens.colorNeutralForeground2,
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

export function LicenseGatePage({ onValidateComplete }: LicenseGatePageProps) {
  const styles = useStyles();
  const { t } = useTranslation();

  const [machineId, setMachineId] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMachineId, setIsFetchingMachineId] = useState(true);
  const [error, setError] = useState('');

  // Load machine ID on mount
  useEffect(() => {
    const loadMachineId = async () => {
      try {
        const id = await getMachineId();
        setMachineId(id);
      } catch (err) {
        setError(t('common.error'));
      } finally {
        setIsFetchingMachineId(false);
      }
    };

    loadMachineId();
  }, [t]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    // Clear previous error
    setError('');

    // Validate input
    if (!licenseKey.trim()) {
      setError(t('common.error'));
      return;
    }

    setIsLoading(true);

    try {
      // Call the callback with the license key
      // The parent (App.tsx) will validate and handle the response
      onValidateComplete(licenseKey);
    } catch (err) {
      setError(t('licenseGate.errorInvalidKey'));
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading && !isFetchingMachineId) {
      handleSubmit();
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.title}>{t('licenseGate.title')}</div>
          <Text className={styles.subtitle}>{t('licenseGate.subtitle')}</Text>
        </div>

        {/* Machine ID Display */}
        {isFetchingMachineId ? (
          <div className={styles.formGroup}>
            <div className={styles.spinnerWrapper}>
              <Spinner size="small" />
              <span>{t('common.loading')}</span>
            </div>
          </div>
        ) : (
          <div className={styles.formGroup}>
            <Label>{t('licenseGate.machineId')}</Label>
            <div className={styles.machineIdWrapper}>{machineId}</div>
          </div>
        )}

        {/* License Key Input */}
        <div className={styles.formGroup}>
          <Label htmlFor="license-key-input">{t('licenseGate.keyPlaceholder')}</Label>
          <Input
            id="license-key-input"
            type="text"
            placeholder={t('licenseGate.keyPlaceholder')}
            value={licenseKey}
            onChange={(e) => setLicenseKey(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading || isFetchingMachineId}
          />
          {error && <div className={styles.errorMessage}>{error}</div>}
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={isLoading || isFetchingMachineId || !machineId}
          className={styles.submitButton}
        >
          {isLoading ? (
            <div className={styles.spinnerWrapper}>
              <Spinner size="tiny" />
              <span>{t('licenseGate.validating')}</span>
            </div>
          ) : (
            t('licenseGate.submit')
          )}
        </Button>
      </Card>
    </div>
  );
}
