import { open } from '@tauri-apps/plugin-dialog';
import { relaunch } from '@tauri-apps/plugin-process';
import { exportBackup, importBackup } from './db';

export async function exportBackupToUsb(): Promise<string | null> {
  const folder = await open({ directory: true, title: 'Choisir le dossier de destination' });
  if (!folder) return null;

  const zipPath = await exportBackup(folder as string);
  return zipPath;
}

export async function restoreBackupFromFile(): Promise<void> {
  const file = await open({
    filters: [{ name: 'Backup', extensions: ['zip'] }],
    title: 'Sélectionner le fichier de sauvegarde',
  });
  if (!file) return;

  await importBackup(file as string);
  await relaunch();
}
