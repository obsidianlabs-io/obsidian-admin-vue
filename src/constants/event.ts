export const appEvent = {
  localeSync: 'app:locale-sync',
  authUserNameSync: 'app:auth-user-name-sync',
  themeSchemaSync: 'app:theme-schema-sync',
  themeConfigSync: 'app:theme-config-sync',
  tenantChanged: 'tenant-changed',
  workspaceReset: 'app:workspace-reset',
  tabsClear: 'app:tabs-clear',
  systemRealtimeUpdated: 'app:system-realtime-updated'
} as const;
