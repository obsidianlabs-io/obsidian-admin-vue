import type { DemoBackend } from './backend';
import type { DemoBackendRequest, DemoBackendResponse, DemoTenantRecord } from './backend-core';
import { fail, nowString, ok, paginate, toSnapshot, validation } from './backend-core';

export function handleTenantRequest(backend: DemoBackend, request: DemoBackendRequest): DemoBackendResponse | null {
  switch (`${request.method.toUpperCase()} ${request.path}`) {
    case 'GET /tenant/list':
      return ok(tenantList(backend, request.query, request.headers));
    case 'GET /tenant/all':
      return ok({ records: backend.activeTenants(request.headers) });
    case 'POST /tenant':
      return createTenant(backend, request.body, request.headers);
    case 'PUT /tenant/:id':
      return updateTenant({
        backend,
        path: request.path,
        body: request.body,
        headers: request.headers
      });
    case 'DELETE /tenant/:id':
      return deleteTenant(backend, request.path);
    case 'GET /organization/list':
      return ok(organizationList(backend, request.query, request.headers));
    case 'GET /organization/all':
      return ok({ records: organizationOptions(backend, request.headers) });
    case 'POST /organization':
      return createOrganization(backend, request.body, request.headers);
    case 'PUT /organization/:id':
      return updateOrganization(backend, request.path, request.body);
    case 'DELETE /organization/:id':
      return deleteOrganization(backend, request.path);
    case 'GET /team/list':
      return ok(teamList(backend, request.query, request.headers));
    case 'GET /team/all':
      return ok({ records: teamOptions(backend, request.query, request.headers) });
    case 'POST /team':
      return createTeam(backend, request.body);
    case 'PUT /team/:id':
      return updateTeam(backend, request.path, request.body);
    case 'DELETE /team/:id':
      return deleteTeam(backend, request.path);
    default:
      return null;
  }
}

function tenantList(
  backend: DemoBackend,
  query: URLSearchParams,
  headers: Record<string, string>
): Api.Tenant.TenantList {
  const actor = backend.requireCurrentUser(headers);
  let items = [...backend.state.tenants];

  if (actor.roleCode !== 'R_SUPER' && actor.tenantId) {
    items = items.filter(item => item.id === actor.tenantId);
  }

  const keyword = String(query.get('keyword') || '')
    .trim()
    .toLowerCase();
  const status = String(query.get('status') || '').trim();

  if (keyword) {
    items = items.filter(
      item => item.tenantCode.toLowerCase().includes(keyword) || item.tenantName.toLowerCase().includes(keyword)
    );
  }

  if (status) {
    items = items.filter(item => item.status === status);
  }

  return paginate(
    items.map(item => ({
      id: item.id,
      tenantCode: item.tenantCode,
      tenantName: item.tenantName,
      status: item.status,
      userCount: backend.state.users.filter(user => user.tenantId === item.id).length,
      createTime: item.createTime,
      updateTime: item.updateTime
    })),
    query
  );
}

function createTenant(backend: DemoBackend, body: Record<string, unknown>, headers: Record<string, string>) {
  const tenantCode = String(body.tenantCode || '')
    .trim()
    .toUpperCase();

  if (backend.state.tenants.some(item => item.tenantCode === tenantCode)) {
    return validation({ tenantCode: ['Tenant code has already been taken'] });
  }

  const now = nowString();
  const record: DemoTenantRecord = {
    id: backend.state.tenants.length + 1,
    tenantCode,
    tenantName: String(body.tenantName || '').trim() || `Tenant ${backend.state.tenants.length + 1}`,
    status: String(body.status || '1') === '2' ? '2' : '1',
    createTime: now,
    updateTime: now
  };

  backend.state.tenants.push(record);
  backend.appendAuditLogFromHeaders(
    headers,
    'tenant.create',
    record.id,
    'tenant',
    String(record.id),
    {},
    toSnapshot(record)
  );

  return ok({}, 'Add success');
}

function updateTenant(params: {
  backend: DemoBackend;
  path: string;
  body: Record<string, unknown>;
  headers: Record<string, string>;
}) {
  const { backend, path, body, headers } = params;
  const id = backend.parseId(path);
  const record = backend.state.tenants.find(item => item.id === id);

  if (!record) {
    return fail('4040', 'Tenant not found', 404);
  }

  const nextCode = String(body.tenantCode || record.tenantCode)
    .trim()
    .toUpperCase();

  if (backend.state.tenants.some(item => item.id !== id && item.tenantCode === nextCode)) {
    return validation({ tenantCode: ['Tenant code has already been taken'] });
  }

  const previous = toSnapshot(record);
  record.tenantCode = nextCode;
  record.tenantName = String(body.tenantName || record.tenantName).trim() || record.tenantName;
  record.status = String(body.status || record.status) === '2' ? '2' : '1';
  record.updateTime = nowString();

  backend.appendAuditLogFromHeaders(
    headers,
    'tenant.update',
    record.id,
    'tenant',
    String(record.id),
    previous,
    toSnapshot(record)
  );

  return ok({}, 'Update success');
}

function deleteTenant(backend: DemoBackend, path: string) {
  const id = backend.parseId(path);
  backend.state.tenants = backend.state.tenants.filter(item => item.id !== id);
  return ok({}, 'Delete success');
}

function organizationList(
  backend: DemoBackend,
  query: URLSearchParams,
  headers: Record<string, string>
): Api.Organization.OrganizationList {
  const scopedTenantId = backend.resolveTenantScope(headers, backend.requireCurrentUser(headers))?.id ?? null;
  let items = [...backend.state.organizations];

  if (scopedTenantId) {
    items = items.filter(item => item.tenantId === scopedTenantId);
  }

  const keyword = String(query.get('keyword') || '')
    .trim()
    .toLowerCase();
  const status = String(query.get('status') || '').trim();

  if (keyword) {
    items = items.filter(
      item =>
        item.organizationCode.toLowerCase().includes(keyword) || item.organizationName.toLowerCase().includes(keyword)
    );
  }

  if (status) {
    items = items.filter(item => item.status === status);
  }

  return paginate(
    items.map(item => ({
      id: item.id,
      tenantId: String(item.tenantId),
      tenantName: backend.tenantName(item.tenantId),
      organizationCode: item.organizationCode,
      organizationName: item.organizationName,
      description: item.description,
      status: item.status,
      sort: item.sort,
      teamCount: backend.state.teams.filter(team => team.organizationId === item.id).length,
      userCount: backend.state.users.filter(user => user.organizationId === item.id).length,
      createTime: item.createTime,
      updateTime: item.updateTime
    })),
    query
  );
}

function organizationOptions(
  backend: DemoBackend,
  headers: Record<string, string>
): Api.Organization.OrganizationOption[] {
  const scopedTenantId = backend.resolveTenantScope(headers, backend.requireCurrentUser(headers))?.id ?? null;
  return backend.state.organizations
    .filter(item => item.status === '1' && (!scopedTenantId || item.tenantId === scopedTenantId))
    .map(item => ({
      id: item.id,
      organizationCode: item.organizationCode,
      organizationName: item.organizationName
    }));
}

function createOrganization(backend: DemoBackend, body: Record<string, unknown>, headers: Record<string, string>) {
  const tenant = backend.resolveTenantScope(headers, backend.requireCurrentUser(headers)) || backend.state.tenants[0];
  const organizationCode = String(body.organizationCode || '')
    .trim()
    .toUpperCase();

  if (
    backend.state.organizations.some(item => item.tenantId === tenant.id && item.organizationCode === organizationCode)
  ) {
    return validation({ organizationCode: ['Organization code has already been taken'] });
  }

  const now = nowString();
  backend.state.organizations.push({
    id: backend.state.organizations.length + 1,
    tenantId: tenant.id,
    organizationCode,
    organizationName:
      String(body.organizationName || '').trim() || `Organization ${backend.state.organizations.length + 1}`,
    description: String(body.description || '').trim(),
    status: String(body.status || '1') === '2' ? '2' : '1',
    sort: Number(body.sort || 0),
    createTime: now,
    updateTime: now
  });

  return ok({}, 'Add success');
}

function updateOrganization(backend: DemoBackend, path: string, body: Record<string, unknown>) {
  const id = backend.parseId(path);
  const record = backend.state.organizations.find(item => item.id === id);

  if (!record) {
    return fail('4040', 'Organization not found', 404);
  }

  const nextCode = String(body.organizationCode || record.organizationCode)
    .trim()
    .toUpperCase();

  if (
    backend.state.organizations.some(
      item => item.id !== id && item.tenantId === record.tenantId && item.organizationCode === nextCode
    )
  ) {
    return validation({ organizationCode: ['Organization code has already been taken'] });
  }

  record.organizationCode = nextCode;
  record.organizationName = String(body.organizationName || record.organizationName).trim() || record.organizationName;
  record.description = String(body.description || record.description);
  record.status = String(body.status || record.status) === '2' ? '2' : '1';
  record.sort = Number(body.sort ?? record.sort);
  record.updateTime = nowString();
  return ok({}, 'Update success');
}

function deleteOrganization(backend: DemoBackend, path: string) {
  const id = backend.parseId(path);
  backend.state.organizations = backend.state.organizations.filter(item => item.id !== id);
  backend.state.teams = backend.state.teams.filter(item => item.organizationId !== id);
  return ok({}, 'Delete success');
}

function teamList(backend: DemoBackend, query: URLSearchParams, headers: Record<string, string>): Api.Team.TeamList {
  const scopedTenantId = backend.resolveTenantScope(headers, backend.requireCurrentUser(headers))?.id ?? null;
  let items = [...backend.state.teams];

  if (scopedTenantId) {
    items = items.filter(item => item.tenantId === scopedTenantId);
  }

  const keyword = String(query.get('keyword') || '')
    .trim()
    .toLowerCase();
  const status = String(query.get('status') || '').trim();
  const organizationId = Number(query.get('organizationId') || 0);

  if (keyword) {
    items = items.filter(
      item => item.teamCode.toLowerCase().includes(keyword) || item.teamName.toLowerCase().includes(keyword)
    );
  }

  if (status) {
    items = items.filter(item => item.status === status);
  }

  if (organizationId) {
    items = items.filter(item => item.organizationId === organizationId);
  }

  return paginate(
    items.map(item => ({
      id: item.id,
      tenantId: String(item.tenantId),
      organizationId: String(item.organizationId),
      organizationName: backend.organizationName(item.organizationId),
      teamCode: item.teamCode,
      teamName: item.teamName,
      description: item.description,
      status: item.status,
      sort: item.sort,
      userCount: backend.state.users.filter(user => user.teamId === item.id).length,
      createTime: item.createTime,
      updateTime: item.updateTime
    })),
    query
  );
}

function teamOptions(
  backend: DemoBackend,
  query: URLSearchParams,
  headers: Record<string, string>
): Api.Team.TeamOption[] {
  const scopedTenantId = backend.resolveTenantScope(headers, backend.requireCurrentUser(headers))?.id ?? null;
  const organizationId = Number(query.get('organizationId') || 0);

  return backend.state.teams
    .filter(
      item =>
        item.status === '1' &&
        (!scopedTenantId || item.tenantId === scopedTenantId) &&
        (!organizationId || item.organizationId === organizationId)
    )
    .map(item => ({
      id: item.id,
      organizationId: String(item.organizationId),
      teamCode: item.teamCode,
      teamName: item.teamName
    }));
}

function createTeam(backend: DemoBackend, body: Record<string, unknown>) {
  const organizationId = Number(body.organizationId || 0);
  const organization = backend.state.organizations.find(item => item.id === organizationId);

  if (!organization) {
    return validation({ organizationId: ['Organization is required'] });
  }

  const teamCode = String(body.teamCode || '')
    .trim()
    .toUpperCase();

  if (backend.state.teams.some(item => item.organizationId === organizationId && item.teamCode === teamCode)) {
    return validation({ teamCode: ['Team code has already been taken'] });
  }

  const now = nowString();
  backend.state.teams.push({
    id: backend.state.teams.length + 1,
    tenantId: organization.tenantId,
    organizationId,
    teamCode,
    teamName: String(body.teamName || '').trim() || `Team ${backend.state.teams.length + 1}`,
    description: String(body.description || '').trim(),
    status: String(body.status || '1') === '2' ? '2' : '1',
    sort: Number(body.sort || 0),
    createTime: now,
    updateTime: now
  });

  return ok({}, 'Add success');
}

function updateTeam(backend: DemoBackend, path: string, body: Record<string, unknown>) {
  const id = backend.parseId(path);
  const record = backend.state.teams.find(item => item.id === id);

  if (!record) {
    return fail('4040', 'Team not found', 404);
  }

  const organizationId = Number(body.organizationId || record.organizationId);
  const nextCode = String(body.teamCode || record.teamCode)
    .trim()
    .toUpperCase();

  if (
    backend.state.teams.some(
      item => item.id !== id && item.organizationId === organizationId && item.teamCode === nextCode
    )
  ) {
    return validation({ teamCode: ['Team code has already been taken'] });
  }

  record.organizationId = organizationId;
  record.tenantId = backend.state.organizations.find(item => item.id === organizationId)?.tenantId || record.tenantId;
  record.teamCode = nextCode;
  record.teamName = String(body.teamName || record.teamName).trim() || record.teamName;
  record.description = String(body.description || record.description);
  record.status = String(body.status || record.status) === '2' ? '2' : '1';
  record.sort = Number(body.sort ?? record.sort);
  record.updateTime = nowString();
  return ok({}, 'Update success');
}

function deleteTeam(backend: DemoBackend, path: string) {
  const id = backend.parseId(path);
  backend.state.teams = backend.state.teams.filter(item => item.id !== id);
  return ok({}, 'Delete success');
}
