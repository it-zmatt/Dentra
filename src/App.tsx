import { useEffect, useState } from 'react';
import { FluentProvider, webLightTheme, webDarkTheme } from '@fluentui/react-components';
import { useSettingsStore } from './store/settingsStore';
import { usePatientsStore } from './store/patientsStore';
import { useAppointmentsStore } from './store/appointmentsStore';
import { useDoctorsStore } from './store/doctorsStore';
import { useLabworkStore } from './store/labworkStore';
import { useExpensesStore } from './store/expensesStore';
import PatientsPage from './pages/PatientsPage';
import CalendarPage from './pages/CalendarPage';
import DoctorsPage from './pages/DoctorsPage';
import LabworkPage from './pages/LabworkPage';
import ExpensesPage from './pages/ExpensesPage';
import StatsPage from './pages/StatsPage';
import SettingsPage from './pages/SettingsPage';

type Page = 'patients' | 'calendar' | 'doctors' | 'labwork' | 'expenses' | 'stats' | 'settings';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('patients');
  const { loadAll, local, global: globalSettings } = useSettingsStore();
  const loadPatients = usePatientsStore((s) => s.load);
  const loadAppointments = useAppointmentsStore((s) => s.load);
  const loadDoctors = useDoctorsStore((s) => s.load);
  const loadLabworks = useLabworkStore((s) => s.load);
  const loadExpenses = useExpensesStore((s) => s.load);

  useEffect(() => {
    // Load settings first, then all data stores in parallel
    loadAll().then(() => {
      Promise.all([
        loadPatients(),
        loadAppointments(),
        loadDoctors(),
        loadLabworks(),
        loadExpenses(),
      ]);
    });
  }, []);

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

  return (
    <FluentProvider theme={theme}>
      <div dir={dir} className="flex h-screen w-screen overflow-hidden bg-gray-50">
        {/* Sidebar nav — TODO: build NavSidebar component */}
        <nav className="w-14 flex flex-col items-center py-4 gap-2 bg-white border-e border-gray-200 shrink-0">
          {/* Nav items placeholder */}
        </nav>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {pages[currentPage]}
        </main>
      </div>
    </FluentProvider>
  );
}
