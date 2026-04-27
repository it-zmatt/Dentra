import React from 'react';
import { Button, Tooltip } from '@fluentui/react-components';
import {
  PeopleRegular,
  CalendarRegular,
  PersonRegular,
  BeakerRegular,
  MoneyRegular,
  DataBarVerticalRegular,
  SettingsRegular,
  SignOutRegular,
} from '@fluentui/react-icons';
import { useTranslation as useI18n } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useSettingsStore } from '../../store/settingsStore';
import type { Page } from '../../App';

interface NavSidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function NavSidebar({ currentPage, onNavigate }: NavSidebarProps) {
  const { t } = useI18n();
  const { isAdmin, logout } = useAuth();
  const globalSettings = useSettingsStore((s) => s.global);

  // Module definition with icon, i18n key, and permission index
  const modules: Array<{
    page: Page;
    icon: React.ElementType;
    i18nKey: string;
    permissionIndex?: number;
  }> = [
    { page: 'patients', icon: PeopleRegular, i18nKey: 'nav.patients', permissionIndex: 0 },
    { page: 'calendar', icon: CalendarRegular, i18nKey: 'nav.calendar', permissionIndex: 1 },
    { page: 'doctors', icon: PersonRegular, i18nKey: 'nav.doctors', permissionIndex: 2 },
    { page: 'labwork', icon: BeakerRegular, i18nKey: 'nav.labwork', permissionIndex: 3 },
    { page: 'expenses', icon: MoneyRegular, i18nKey: 'nav.expenses', permissionIndex: 4 },
    { page: 'stats', icon: DataBarVerticalRegular, i18nKey: 'nav.stats', permissionIndex: 5 },
    { page: 'settings', icon: SettingsRegular, i18nKey: 'nav.settings' }, // No permission index — always visible
  ];

  // Check if a module is accessible to current user
  const isModuleVisible = (permissionIndex?: number): boolean => {
    // Settings always visible
    if (permissionIndex === undefined) return true;
    
    // Admin sees all modules
    if (isAdmin) return true;
    
    // If permissions not loaded, show all (fallback)
    if (!globalSettings || !globalSettings.permissions || globalSettings.permissions.length === 0) {
      return true;
    }
    
    // Check user's permission for this module
    return globalSettings.permissions[permissionIndex] === true;
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="w-14 flex flex-col items-center py-4 gap-2 bg-white border-e border-gray-200 shrink-0">
      {/* Module icons */}
      {modules.map((module) => {
        if (!isModuleVisible(module.permissionIndex)) {
          return null; // Hidden if no permission
        }

        const IconComponent = module.icon;
        const isActive = currentPage === module.page;

        return (
          <Tooltip key={module.page} content={t(module.i18nKey)} relationship="label">
            <Button
              icon={<IconComponent fontSize={20} />}
              onClick={() => onNavigate(module.page)}
              appearance={isActive ? 'primary' : 'subtle'}
              size="large"
              className={`
                !w-12 !h-12 !p-0 !rounded-md !transition-colors
                ${isActive ? '!bg-blue-100 !text-blue-600' : '!text-gray-600 hover:!bg-gray-100'}
                ${isActive && '!border-s-2 !border-s-blue-600'}
              `}
            />
          </Tooltip>
        );
      })}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Logout button */}
      <Tooltip content={t('nav.logout')} relationship="label">
        <Button
          icon={<SignOutRegular fontSize={20} />}
          onClick={handleLogout}
          appearance="subtle"
          size="large"
          className="!w-12 !h-12 !p-0 !rounded-md !text-gray-600 hover:!bg-gray-100 !transition-colors"
        />
      </Tooltip>
    </nav>
  );
}
