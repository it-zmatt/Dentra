import { getMachineId, validateLicenseKey } from './db';
import { getLocalSettings, saveLocalSettings } from './db';

export async function checkLicenseStatus(): Promise<{
  valid: boolean;
  inGracePeriod: boolean;
  graceDaysLeft: number;
  machineChanged: boolean;
  machineId: string;
}> {
  const settings = await getLocalSettings();
  const currentMachineId = await getMachineId();

  const machineChanged =
    !!settings.licenseMachineId && settings.licenseMachineId !== currentMachineId;

  if (settings.licenseValid && !machineChanged) {
    return { valid: true, inGracePeriod: false, graceDaysLeft: 0, machineChanged: false, machineId: currentMachineId };
  }

  // Check grace period
  let graceDaysLeft = 0;
  let inGracePeriod = false;

  if (settings.installDate) {
    const installDate = new Date(settings.installDate);
    const now = new Date();
    const daysSinceInstall = Math.floor(
      (now.getTime() - installDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    graceDaysLeft = Math.max(0, 7 - daysSinceInstall);
    inGracePeriod = graceDaysLeft > 0;
  }

  return {
    valid: false,
    inGracePeriod,
    graceDaysLeft,
    machineChanged,
    machineId: currentMachineId,
  };
}

export async function activateLicense(key: string): Promise<boolean> {
  const isValid = await validateLicenseKey(key);
  if (!isValid) return false;

  const machineId = await getMachineId();
  const settings = await getLocalSettings();
  await saveLocalSettings({
    ...settings,
    licenseKey: key,
    licenseMachineId: machineId,
    licenseValid: true,
  });

  return true;
}
