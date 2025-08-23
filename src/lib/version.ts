import packageJson from '../../package.json';

export const APP_VERSION = packageJson.version;

export const getVersionDisplay = (): string => {
  return `v${APP_VERSION}`;
};

export const getFullVersionInfo = (): { version: string; name: string } => {
  return {
    version: APP_VERSION,
    name: packageJson.name,
  };
};