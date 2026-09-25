export const measurementConfig = {
  gtmContainerId: 'GTM-M9CZ2JMS',
  consentStorageKey: 'mmdev.measurement-consent',
  consentSchemaVersion: 1,
  consentMaxAgeDays: 180,
  denialTombstoneName: 'mmdev_analytics_consent_denied',
  consentBroadcastChannel: 'mmdev-measurement-consent',
  preferencesOpenEvent: 'mmdev:privacy-preferences:open',
  consentChangeEvent: 'mmdev:analytics-consent-change',
} as const;
