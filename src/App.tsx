import React, { useEffect, useState } from 'react';
import { FluentProvider, webLightTheme, webDarkTheme, Spinner } from '@fluentui/react-components';
import { useSettingsStore } from './store/settingsStore';
import { usePatientsStore } from './store/patientsStore';
import { useAppointmentsStore } from './store/appointmentsStore';
import { useDoctorsStore } from './store/doctorsStore';
import { useLabworkStore } from './store/labworkStore';
import { useExpensesStore } from './store/expensesStore';
import { useAuth } from './hooks/useAuth';
import { validateLicenseKey, saveLocalSettings } from './services/db';
import NavSidebar from './components/common/NavSidebar';
import { LoginPage } from './pages/LoginPage';
import { LicenseGatePage } from './pages/LicenseGatePage';
import PatientsPage from './pages/PatientsPage';
import CalendarPage from './pages/CalendarPage';
import DoctorsPage from './pages/DoctorsPage';
import LabworkPage from './pages/LabworkPage';
import ExpensesPage from './pages/ExpensesPage';
import StatsPage from './pages/StatsPage';
import SettingsPage from './pages/SettingsPage';

export type Page = 'patients' | 'calendar' | 'doctors' | 'labwork' | 'expenses' | 'stats' | 'settings';
type AppPhase = 'loading' | 'license-gate' | 'login' | 'app';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('patients');
  const [appPhase, setAppPhase] = useState<AppPhase>('loading');

  const { loadAll, local, global: globalSettings } = useSettingsStore();
  const { autoLogin, currentUser } = useAuth();
  const loadPatients = usePatientsStore((s) => s.load);
  const loadAppointments = useAppointmentsStore((s) => s.load);
  const loadDoctors = useDoctorsStore((s) => s.load);
  const loadLabworks = useLabworkStore((s) => s.load);
  const loadExpenses = useExpensesStore((s) => s.load);

  // Startup sequence: load settings, check license, attempt auto-login, load data stores
  useEffect(() => {
    const runStartupSequence = async () => {
      try {
        // 1. Load settings
        await loadAll();

        // 2. Check license validity and grace period
        const settings = useSettingsStore.getState();
        const now = Date.now();
        const installDateStr = settings.local?.installDate || '';

        let isLicenseValid = settings.local?.licenseValid === true;

        // If no install date, set it now (first launch)
        if (!installDateStr) {
          const newSettings = {
            ...settings.local!,
            installDate: String(now),
          };
          await saveLocalSettings(newSettings);
          // First launch = license valid for this session
          isLicenseValid = true;
        } else {
          // Check if we're past the 7-day grace period
          const installDate = Number(installDateStr);
          const gracePeriodMs = 7 * 24 * 60 * 60 * 1000;
          const isGracePeriodActive = now - installDate <= gracePeriodMs;

          // If grace period active OR license is valid, allow login
          isLicenseValid = isGracePeriodActive || isLicenseValid;
        }

        // If license invalid, show license gate
        if (!isLicenseValid) {
          setAppPhase('license-gate');
          return;
        }

        // 3. Attempt auto-login
        const sessionRestored = await autoLogin();

        if (sessionRestored) {
          // 4a. If auto-login succeeded, load data stores
          await Promise.all([
            loadPatients(),
            loadAppointments(),
            loadDoctors(),
            loadLabworks(),
            loadExpenses(),
          ]);
          setAppPhase('app');
        } else {
          // 4b. If no session, show login screen
          setAppPhase('login');
        }
      } catch (err) {
        console.error('Startup error:', err);
        // On error, show login (safest fallback)
        setAppPhase('login');
      }
    };

    runStartupSequence();
  }, []);

  // Watch for auth store changes (after successful login)
  useEffect(() => {
    if (currentUser && appPhase === 'login') {
      // User just logged in, load data and transition to app
      Promise.all([
        loadPatients(),
        loadAppointments(),
        loadDoctors(),
        loadLabworks(),
        loadExpenses(),
      ]).then(() => {
        setAppPhase('app');
      });
    }
  }, [currentUser, appPhase]);

  // Handle license gate completion
  const handleLicenseValidated = async (licenseKey: string) => {
    try {
      const isValid = await validateLicenseKey(licenseKey);
      if (isValid) {
        // Save license to local settings
        const settings = useSettingsStore.getState().local!;
        await saveLocalSettings({
          ...settings,
          licenseValid: true,
          licenseKey: licenseKey,
        });
        // Transition to login screen
        setAppPhase('login');
      } else {
        // Invalid key - error already shown in LicenseGatePage callback
        throw new Error('Invalid license key');
      }
    } catch (err) {
      // Component handles error display
      throw err;
    }
  };

  const theme = local?.selectedTheme === 'dark' ? webDarkTheme : webLightTheme;
  const dir = local?.selectedLocale === 'ar' ? 'rtl' : 'ltr';

  const pages: Record<Page, JSX.Element> = {
    patients: <PatientsPage />,
    calendar: <CalendarPage />,
    doctors: <DoctorsPage />,
    labwork: <LabworkPage />,
    expenses: <ExpensesPage />,
    stats: <StatsPage />,
    settings: <SettingsPage />,
  };

  // Render appropriate screen based on app phase
  const renderContent = () => {
    switch (appPhase) {
      case 'loading':
        return (
          <div className="flex items-center justify-center h-screen w-screen">
            <Spinner size="huge" label="Loading..." />
          </div>
        );

      case 'license-gate':
        return <LicenseGatePage onValidateComplete={handleLicenseValidated} />;

      case 'login':
        return <LoginPage />;

      case 'app':
        return (
          <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
            <NavSidebar currentPage={currentPage} onNavigate={setCurrentPage} />
            <main className="flex-1 overflow-auto">{pages[currentPage]}</main>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <FluentProvider theme={theme}>
      <div dir={dir}>{renderContent()}</div>
    </FluentProvider>
  );
}
