import type { DemoBackend } from './backend';
import type { DemoBackendRequest, DemoBackendResponse } from './backend-core';
import { cloneThemeConfig, defaultThemeConfig, fail, nowString, ok, paginate, validation } from './backend-core';

export function handleSystemRequest(backend: DemoBackend, request: DemoBackendRequest): DemoBackendResponse | null {
  switch (request.method.toUpperCase()) {
    case 'GET':
      return handleSystemGet(backend, request);
    case 'POST':
      return handleSystemPost(backend, request);
    case 'PUT':
      return handleSystemPut(backend, request);
    case 'DELETE':
      return handleSystemDelete(backend, request);
    default:
      return null;
  }
}

function handleSystemGet(backend: DemoBackend, request: DemoBackendRequest): DemoBackendResponse | null {
  switch (request.path) {
    case '/system/bootstrap':
      return ok({ defaultLocale: 'en-US' });
    case '/health/live':
    case '/health':
    case '/health/ready':
      return ok({ status: 'alive' });
    case '/theme/public-config':
    case '/theme/config':
      return ok(backend.themeScopePayload());
    case '/language/locales':
    case '/language/options':
      return ok({ records: backend.localeOptions() });
    case '/language/messages':
      return ok(backend.runtimeMessages(request.query));
    case '/language/list':
      return ok(languageList(backend, request.query));
    case '/audit/list':
      return ok(auditLogList(backend, request.query, request.headers));
    case '/audit/policy/list':
      return ok({ records: backend.state.auditPolicies });
    case '/audit/policy/history':
      return ok(paginate(backend.state.auditPolicyHistory, request.query));
    case '/system/feature-flags':
      return ok(paginate(featureFlagList(backend, request.query), request.query));
    default:
      if (request.path.startsWith('/system/ui/crud-schema/')) {
        return ok(crudSchema(request.path));
      }

      return null;
  }
}

function handleSystemPost(backend: DemoBackend, request: DemoBackendRequest): DemoBackendResponse | null {
  switch (request.path) {
    case '/theme/config/reset':
      backend.state.themeConfig = cloneThemeConfig(defaultThemeConfig);
      return ok(backend.themeScopePayload(), 'Theme configuration reset');
    case '/language':
      return createLanguage(backend, request.body);
    default:
      return null;
  }
}

function handleSystemPut(backend: DemoBackend, request: DemoBackendRequest): DemoBackendResponse | null {
  switch (request.path) {
    case '/theme/config':
      return updateThemeConfig(backend, request.body);
    case '/language/:id':
      return updateLanguage(backend, request.path, request.body);
    case '/audit/policy':
      return updateAuditPolicy(backend, request.body, request.headers);
    case '/system/feature-flags/toggle':
      return toggleFeatureFlag(backend, request.body, request.headers);
    default:
      return null;
  }
}

function handleSystemDelete(backend: DemoBackend, request: DemoBackendRequest): DemoBackendResponse | null {
  switch (request.path) {
    case '/language/:id':
      return deleteLanguage(backend, request.path);
    case '/system/feature-flags/purge':
      return purgeFeatureFlag(backend, request.body, request.headers);
    default:
      return null;
  }
}

function featureFlagList(backend: DemoBackend, query: URLSearchParams): Api.FeatureFlag.Flag[] {
  let items = [...backend.state.featureFlags];
  const keyword = String(query.get('keyword') || '')
    .trim()
    .toLowerCase();

  if (keyword) {
    items = items.filter(item => item.key.toLowerCase().includes(keyword));
  }

  return items.map(item => ({
    key: item.key,
    enabled: item.enabled,
    percentage: item.percentage,
    platform_only: item.platformOnly,
    tenant_only: item.tenantOnly,
    role_codes: [...item.roleCodes],
    global_override: item.globalOverride
  }));
}

function toggleFeatureFlag(backend: DemoBackend, body: Record<string, unknown>, headers: Record<string, string>) {
  const key = String(body.key || '').trim();
  const record = backend.state.featureFlags.find(item => item.key === key);

  if (!record) {
    return fail('4040', 'Feature flag not found', 404);
  }

  record.globalOverride = Boolean(body.enabled);
  backend.appendAuditLogFromHeaders(
    headers,
    'feature-flag.toggle',
    null,
    'feature-flag',
    key,
    {},
    {
      global_override: record.globalOverride
    }
  );

  return ok({ key, global_override: Boolean(record.globalOverride) }, 'Feature flag updated');
}

function purgeFeatureFlag(backend: DemoBackend, body: Record<string, unknown>, headers: Record<string, string>) {
  const key = String(body.key || '').trim();
  const record = backend.state.featureFlags.find(item => item.key === key);

  if (!record) {
    return fail('4040', 'Feature flag not found', 404);
  }

  record.globalOverride = null;
  backend.appendAuditLogFromHeaders(
    headers,
    'feature-flag.purge',
    null,
    'feature-flag',
    key,
    {},
    {
      global_override: null
    }
  );

  return ok({ key, global_override: null }, 'Feature flag overrides purged');
}

function languageList(backend: DemoBackend, query: URLSearchParams): Api.Language.TranslationList {
  let items = [...backend.state.languages];
  const locale = String(query.get('locale') || '').trim() as App.I18n.LangType;
  const keyword = String(query.get('keyword') || '')
    .trim()
    .toLowerCase();
  const status = String(query.get('status') || '').trim();

  if (locale) {
    items = items.filter(item => item.locale === locale);
  }

  if (keyword) {
    items = items.filter(
      item =>
        item.translationKey.toLowerCase().includes(keyword) || item.translationValue.toLowerCase().includes(keyword)
    );
  }

  if (status) {
    items = items.filter(item => item.status === status);
  }

  return paginate(items, query);
}

function createLanguage(backend: DemoBackend, body: Record<string, unknown>) {
  const locale = String(body.locale || 'en-US') as App.I18n.LangType;
  const translationKey = String(body.translationKey || '').trim();

  if (backend.state.languages.some(item => item.locale === locale && item.translationKey === translationKey)) {
    return validation({ translationKey: ['Translation key already exists for this locale'] });
  }

  const now = nowString();
  backend.state.languages.push({
    id: backend.state.languages.length + 1,
    locale,
    localeName: locale === 'zh-CN' ? '简体中文' : 'English',
    translationKey,
    translationValue: String(body.translationValue || '').trim(),
    description: String(body.description || '').trim(),
    status: String(body.status || '1') === '2' ? '2' : '1',
    createTime: now,
    updateTime: now
  });
  backend.state.languageVersion += 1;
  return ok({}, 'Add success');
}

function updateLanguage(backend: DemoBackend, path: string, body: Record<string, unknown>) {
  const id = backend.parseId(path);
  const record = backend.state.languages.find(item => item.id === id);

  if (!record) {
    return fail('4040', 'Language item not found', 404);
  }

  const locale = String(body.locale || record.locale) as App.I18n.LangType;
  const translationKey = String(body.translationKey || record.translationKey).trim();

  if (
    backend.state.languages.some(
      item => item.id !== id && item.locale === locale && item.translationKey === translationKey
    )
  ) {
    return validation({ translationKey: ['Translation key already exists for this locale'] });
  }

  record.locale = locale;
  record.localeName = locale === 'zh-CN' ? '简体中文' : 'English';
  record.translationKey = translationKey;
  record.translationValue = String(body.translationValue || record.translationValue).trim();
  record.description = String(body.description || record.description).trim();
  record.status = String(body.status || record.status) === '2' ? '2' : '1';
  record.updateTime = nowString();
  backend.state.languageVersion += 1;
  return ok({}, 'Update success');
}

function deleteLanguage(backend: DemoBackend, path: string) {
  const id = backend.parseId(path);
  backend.state.languages = backend.state.languages.filter(item => item.id !== id);
  backend.state.languageVersion += 1;
  return ok({}, 'Delete success');
}

function auditLogList(
  backend: DemoBackend,
  query: URLSearchParams,
  headers: Record<string, string>
): Api.Audit.AuditLogList {
  const scopedTenantId = backend.resolveTenantScope(headers, backend.requireCurrentUser(headers))?.id ?? null;
  let items = [...backend.state.auditLogs];
  const keyword = String(query.get('keyword') || '')
    .trim()
    .toLowerCase();
  const action = String(query.get('action') || '')
    .trim()
    .toLowerCase();
  const logType = String(query.get('logType') || '')
    .trim()
    .toLowerCase();
  const userName = String(query.get('userName') || '')
    .trim()
    .toLowerCase();
  const requestId = String(query.get('requestId') || '')
    .trim()
    .toLowerCase();

  if (scopedTenantId) {
    items = items.filter(item => item.tenantId === String(scopedTenantId));
  }

  if (keyword) {
    items = items.filter(
      item => item.action.toLowerCase().includes(keyword) || item.target.toLowerCase().includes(keyword)
    );
  }

  if (action) {
    items = items.filter(item => item.action.toLowerCase().includes(action));
  }

  if (logType) {
    items = items.filter(item => item.logType === logType);
  }

  if (userName) {
    items = items.filter(item => item.userName.toLowerCase().includes(userName));
  }

  if (requestId) {
    items = items.filter(item => item.requestId.toLowerCase().includes(requestId));
  }

  return paginate(items, query);
}

function updateAuditPolicy(backend: DemoBackend, body: Record<string, unknown>, headers: Record<string, string>) {
  const records = Array.isArray(body.records) ? body.records : [];
  const changeReason = String(body.changeReason || '').trim();

  if (changeReason.length < 3) {
    return validation({ changeReason: ['Change reason must be at least 3 characters'] });
  }

  const changedActions: string[] = [];

  records.forEach(item => {
    const record = item as Record<string, unknown>;
    const policy = backend.state.auditPolicies.find(entry => entry.action === String(record.action || ''));

    if (!policy || policy.locked) {
      return;
    }

    policy.enabled = Boolean(record.enabled);

    if (record.samplingRate !== null && record.samplingRate !== undefined) {
      policy.samplingRate = Number(record.samplingRate);
    }

    if (record.retentionDays !== null && record.retentionDays !== undefined) {
      policy.retentionDays = Number(record.retentionDays);
    }

    policy.source = 'platform';
    changedActions.push(policy.action);
  });

  backend.state.revisionCounter += 1;
  const actor = backend.requireCurrentUser(headers);
  backend.state.auditPolicyHistory.unshift({
    id: `revision-${backend.state.revisionCounter}`,
    scope: 'platform',
    changedByUserId: String(actor.id),
    changedByUserName: actor.userName,
    changeReason,
    changedCount: changedActions.length,
    changedActions,
    createdAt: nowString()
  });

  return ok(
    {
      updated: changedActions.length,
      revisionId: `revision-${backend.state.revisionCounter}`,
      records: backend.state.auditPolicies,
      clearedTenantOverrides: 0
    },
    'Audit policy updated'
  );
}

function crudSchema(path: string): Api.CrudSchema.Schema {
  const resource = path.split('/').pop() || 'unknown';
  const schemaMap: Record<string, Api.CrudSchema.Schema> = {
    user: {
      resource: 'user',
      permission: 'user.view',
      searchFields: [
        {
          key: 'keyword',
          type: 'input',
          labelKey: 'common.keyword',
          placeholderKey: 'common.search'
        },
        {
          key: 'roleCode',
          type: 'select',
          labelKey: 'route.role',
          optionSource: 'role.all'
        }
      ],
      columns: [
        {
          key: 'userName',
          type: 'text',
          titleKey: 'page.user.userName',
          align: 'left',
          minWidth: 160
        },
        {
          key: 'email',
          type: 'text',
          titleKey: 'common.email',
          align: 'left',
          minWidth: 220
        },
        {
          key: 'status',
          type: 'status',
          titleKey: 'common.status',
          align: 'center',
          width: 120
        }
      ],
      scrollX: 1280
    },
    role: {
      resource: 'role',
      permission: 'role.view',
      searchFields: [
        {
          key: 'keyword',
          type: 'input',
          labelKey: 'common.keyword',
          placeholderKey: 'common.search'
        }
      ],
      columns: [
        {
          key: 'roleCode',
          type: 'text',
          titleKey: 'page.role.roleCode',
          align: 'left',
          minWidth: 160
        },
        {
          key: 'roleName',
          type: 'text',
          titleKey: 'page.role.roleName',
          align: 'left',
          minWidth: 180
        },
        {
          key: 'status',
          type: 'status',
          titleKey: 'common.status',
          align: 'center',
          width: 120
        }
      ],
      scrollX: 1180
    }
  };

  return (
    schemaMap[resource] || {
      resource,
      permission: `${resource}.view`,
      searchFields: [],
      columns: [],
      scrollX: 1080
    }
  );
}

function updateThemeConfig(backend: DemoBackend, body: Record<string, unknown>) {
  Object.assign(backend.state.themeConfig, body);
  return ok(backend.themeScopePayload(), 'Theme configuration updated');
}
