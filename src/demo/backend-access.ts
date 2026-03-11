import type { DemoBackend } from './backend';
import type { DemoBackendRequest, DemoBackendResponse } from './backend-core';
import { fail, nowString, ok, paginate, validation } from './backend-core';

export function handleAccessRequest(backend: DemoBackend, request: DemoBackendRequest): DemoBackendResponse | null {
  switch (`${request.method.toUpperCase()} ${request.path}`) {
    case 'GET /permission/list':
      return ok(permissionList(backend, request.query));
    case 'GET /permission/all':
      return ok({ records: permissionOptions(backend) });
    case 'POST /permission':
      return createPermission(backend, request.body);
    case 'PUT /permission/:id':
      return updatePermission(backend, request.path, request.body);
    case 'DELETE /permission/:id':
      return deletePermission(backend, request.path);
    case 'GET /role/list':
      return ok(roleList(backend, request.query, request.headers));
    case 'GET /role/all':
      return ok({ records: roleOptions(backend, request.query, request.headers) });
    case 'GET /role/assignable-permissions':
      return ok({ records: permissionOptions(backend) });
    case 'POST /role':
      return createRole(backend, request.body, request.headers);
    case 'PUT /role/:id':
      return updateRole(backend, request.path, request.body);
    case 'PUT /role/:id/permissions':
      return syncRolePermissions(backend, request.path, request.body);
    case 'DELETE /role/:id':
      return deleteRole(backend, request.path);
    case 'GET /user/list':
      return ok(userList(backend, request.query, request.headers));
    case 'POST /user':
      return createUser(backend, request.body, request.headers);
    case 'PUT /user/:id':
      return updateUser(backend, request.path, request.body);
    case 'PUT /user/:id/role':
      return assignUserRole(backend, request.path, request.body);
    case 'DELETE /user/:id':
      return deleteUser(backend, request.path);
    default:
      return null;
  }
}

function permissionList(backend: DemoBackend, query: URLSearchParams): Api.Permission.PermissionList {
  let items = [...backend.state.permissions];
  const keyword = String(query.get('keyword') || '')
    .trim()
    .toLowerCase();
  const status = String(query.get('status') || '').trim();
  const group = String(query.get('group') || '')
    .trim()
    .toLowerCase();

  if (keyword) {
    items = items.filter(
      item => item.permissionCode.toLowerCase().includes(keyword) || item.permissionName.toLowerCase().includes(keyword)
    );
  }

  if (status) {
    items = items.filter(item => item.status === status);
  }

  if (group) {
    items = items.filter(item => item.group.toLowerCase() === group);
  }

  return paginate(
    items.map(item => ({
      id: item.id,
      permissionCode: item.permissionCode,
      permissionName: item.permissionName,
      group: item.group,
      description: item.description,
      status: item.status,
      roleCount: backend.state.roles.filter(role => role.permissionCodes.includes(item.permissionCode)).length,
      createTime: item.createTime,
      updateTime: item.updateTime
    })),
    query
  );
}

function permissionOptions(backend: DemoBackend): Api.Permission.PermissionOption[] {
  return backend.state.permissions
    .filter(item => item.status === '1')
    .map(item => ({
      id: item.id,
      permissionCode: item.permissionCode,
      permissionName: item.permissionName,
      group: item.group
    }));
}

function createPermission(backend: DemoBackend, body: Record<string, unknown>) {
  const permissionCode = String(body.permissionCode || '').trim();

  if (backend.state.permissions.some(item => item.permissionCode === permissionCode)) {
    return validation({ permissionCode: ['Permission code has already been taken'] });
  }

  const now = nowString();
  backend.state.permissions.push({
    id: backend.state.permissions.length + 1,
    permissionCode,
    permissionName: String(body.permissionName || '').trim() || permissionCode,
    group: String(body.group || 'system').trim() || 'system',
    description: String(body.description || '').trim(),
    status: String(body.status || '1') === '2' ? '2' : '1',
    createTime: now,
    updateTime: now
  });

  return ok({}, 'Add success');
}

function updatePermission(backend: DemoBackend, path: string, body: Record<string, unknown>) {
  const id = backend.parseId(path);
  const record = backend.state.permissions.find(item => item.id === id);

  if (!record) {
    return fail('4040', 'Permission not found', 404);
  }

  const nextCode = String(body.permissionCode || record.permissionCode).trim();

  if (backend.state.permissions.some(item => item.id !== id && item.permissionCode === nextCode)) {
    return validation({ permissionCode: ['Permission code has already been taken'] });
  }

  record.permissionCode = nextCode;
  record.permissionName = String(body.permissionName || record.permissionName).trim() || record.permissionName;
  record.group = String(body.group || record.group).trim() || record.group;
  record.description = String(body.description || record.description);
  record.status = String(body.status || record.status) === '2' ? '2' : '1';
  record.updateTime = nowString();
  return ok({}, 'Update success');
}

function deletePermission(backend: DemoBackend, path: string) {
  const id = backend.parseId(path);
  backend.state.permissions = backend.state.permissions.filter(item => item.id !== id);
  return ok({}, 'Delete success');
}

function roleList(backend: DemoBackend, query: URLSearchParams, headers: Record<string, string>): Api.Role.RoleList {
  const scopedTenantId = backend.resolveTenantScope(headers, backend.requireCurrentUser(headers))?.id ?? null;
  let items = [...backend.state.roles];

  if (scopedTenantId) {
    items = items.filter(item => item.tenantId === null || item.tenantId === scopedTenantId);
  }

  const keyword = String(query.get('keyword') || '')
    .trim()
    .toLowerCase();
  const status = String(query.get('status') || '').trim();
  const level = Number(query.get('level') || 0);

  if (keyword) {
    items = items.filter(
      item => item.roleCode.toLowerCase().includes(keyword) || item.roleName.toLowerCase().includes(keyword)
    );
  }

  if (status) {
    items = items.filter(item => item.status === status);
  }

  if (level) {
    items = items.filter(item => item.level === level);
  }

  const actorLevel = backend.roleByCode(backend.requireCurrentUser(headers).roleCode).level;

  return {
    ...paginate(
      items.map(item => ({
        id: item.id,
        roleCode: item.roleCode,
        roleName: item.roleName,
        tenantId: item.tenantId ? String(item.tenantId) : '',
        tenantName: backend.tenantName(item.tenantId),
        description: item.description,
        status: item.status,
        level: item.level,
        manageable: item.level < actorLevel,
        userCount: backend.state.users.filter(user => user.roleCode === item.roleCode).length,
        permissionCodes: [...item.permissionCodes],
        createTime: item.createTime,
        updateTime: item.updateTime
      })),
      query
    ),
    actorLevel
  };
}

function roleOptions(
  backend: DemoBackend,
  query: URLSearchParams,
  headers: Record<string, string>
): Api.Role.RoleOption[] {
  const manageableOnly = String(query.get('manageableOnly') || '') === 'true';
  const actor = backend.requireCurrentUser(headers);
  const actorLevel = backend.roleByCode(actor.roleCode).level;
  const scopedTenantId = backend.resolveTenantScope(headers, actor)?.id ?? null;

  return backend.state.roles
    .filter(
      item => item.status === '1' && (!scopedTenantId || item.tenantId === null || item.tenantId === scopedTenantId)
    )
    .filter(item => !manageableOnly || item.level < actorLevel)
    .map(item => ({
      id: item.id,
      roleCode: item.roleCode,
      roleName: item.roleName,
      level: item.level,
      manageable: item.level < actorLevel
    }));
}

function createRole(backend: DemoBackend, body: Record<string, unknown>, headers: Record<string, string>) {
  const roleCode = String(body.roleCode || '')
    .trim()
    .toUpperCase();
  const level = Number(body.level || 0);
  const scopedTenantId = backend.resolveTenantScope(headers, backend.requireCurrentUser(headers))?.id ?? null;

  if (backend.state.roles.some(item => item.roleCode === roleCode)) {
    return validation({ roleCode: ['Role code has already been taken'] });
  }

  if (backend.state.roles.some(item => item.level === level && item.tenantId === scopedTenantId)) {
    return validation({ level: ['Role level has already been taken'] });
  }

  const now = nowString();
  backend.state.roles.push({
    id: backend.state.roles.length + 1,
    roleCode,
    roleName: String(body.roleName || '').trim() || roleCode,
    tenantId: scopedTenantId,
    description: String(body.description || '').trim(),
    status: String(body.status || '1') === '2' ? '2' : '1',
    level,
    permissionCodes: Array.isArray(body.permissionCodes) ? body.permissionCodes.map(code => String(code)) : [],
    createTime: now,
    updateTime: now
  });

  return ok({}, 'Add success');
}

function updateRole(backend: DemoBackend, path: string, body: Record<string, unknown>) {
  const id = backend.parseId(path);
  const record = backend.state.roles.find(item => item.id === id);

  if (!record) {
    return fail('4040', 'Role not found', 404);
  }

  const nextCode = String(body.roleCode || record.roleCode)
    .trim()
    .toUpperCase();
  const nextLevel = Number(body.level || record.level);
  const errors: Record<string, string[]> = {};

  if (backend.state.roles.some(item => item.id !== id && item.roleCode === nextCode)) {
    errors.roleCode = ['Role code has already been taken'];
  }

  if (
    backend.state.roles.some(item => item.id !== id && item.level === nextLevel && item.tenantId === record.tenantId)
  ) {
    errors.level = ['Role level has already been taken'];
  }

  if (Object.keys(errors).length) {
    return validation(errors);
  }

  record.roleCode = nextCode;
  record.roleName = String(body.roleName || record.roleName).trim() || record.roleName;
  record.description = String(body.description || record.description);
  record.status = String(body.status || record.status) === '2' ? '2' : '1';
  record.level = nextLevel;

  if (Array.isArray(body.permissionCodes)) {
    record.permissionCodes = body.permissionCodes.map(code => String(code));
  }

  record.updateTime = nowString();
  return ok({}, 'Update success');
}

function syncRolePermissions(backend: DemoBackend, path: string, body: Record<string, unknown>) {
  const id = backend.parseId(path);
  const record = backend.state.roles.find(item => item.id === id);

  if (!record) {
    return fail('4040', 'Role not found', 404);
  }

  record.permissionCodes = Array.isArray(body.permissionCodes) ? body.permissionCodes.map(code => String(code)) : [];
  record.updateTime = nowString();
  return ok({}, 'Update success');
}

function deleteRole(backend: DemoBackend, path: string) {
  const id = backend.parseId(path);
  backend.state.roles = backend.state.roles.filter(item => item.id !== id);
  return ok({}, 'Delete success');
}

function userList(backend: DemoBackend, query: URLSearchParams, headers: Record<string, string>): Api.User.UserList {
  const actor = backend.requireCurrentUser(headers);
  const actorLevel = backend.roleByCode(actor.roleCode).level;
  const scopedTenantId = backend.resolveTenantScope(headers, actor)?.id ?? null;
  let items = [...backend.state.users];

  if (scopedTenantId) {
    items = items.filter(item => item.tenantId === scopedTenantId);
  }

  const keyword = String(query.get('keyword') || '')
    .trim()
    .toLowerCase();
  const status = String(query.get('status') || '').trim();
  const userName = String(query.get('userName') || '')
    .trim()
    .toLowerCase();
  const userEmail = String(query.get('userEmail') || '')
    .trim()
    .toLowerCase();
  const roleCode = String(query.get('roleCode') || '').trim();

  if (keyword) {
    items = items.filter(
      item => item.userName.toLowerCase().includes(keyword) || item.email.toLowerCase().includes(keyword)
    );
  }

  if (status) {
    items = items.filter(item => item.status === status);
  }

  if (userName) {
    items = items.filter(item => item.userName.toLowerCase().includes(userName));
  }

  if (userEmail) {
    items = items.filter(item => item.email.toLowerCase().includes(userEmail));
  }

  if (roleCode) {
    items = items.filter(item => item.roleCode === roleCode);
  }

  return {
    ...paginate(
      items.map(item => ({
        id: item.id,
        userName: item.userName,
        email: item.email,
        roleCode: item.roleCode,
        roleName: backend.roleByCode(item.roleCode).roleName,
        roleLevel: backend.roleByCode(item.roleCode).level,
        organizationId: item.organizationId ? String(item.organizationId) : '',
        organizationName: backend.organizationName(item.organizationId),
        teamId: item.teamId ? String(item.teamId) : '',
        teamName: backend.teamName(item.teamId),
        status: item.status,
        manageable: backend.roleByCode(item.roleCode).level < actorLevel,
        createTime: item.createTime,
        updateTime: item.updateTime
      })),
      query
    ),
    actorLevel
  };
}

function createUser(backend: DemoBackend, body: Record<string, unknown>, headers: Record<string, string>) {
  const userName = String(body.userName || '').trim();
  const email = String(body.email || '')
    .trim()
    .toLowerCase();
  const errors: Record<string, string[]> = {};

  if (backend.state.users.some(item => item.userName.toLowerCase() === userName.toLowerCase())) {
    errors.userName = ['User name has already been taken'];
  }

  if (backend.state.users.some(item => item.email.toLowerCase() === email)) {
    errors.email = ['Email has already been taken'];
  }

  if (Object.keys(errors).length) {
    return validation(errors);
  }

  const actor = backend.requireCurrentUser(headers);
  const tenantId = backend.resolveTenantScope(headers, actor)?.id ?? actor.tenantId ?? 1;
  const now = nowString();
  backend.state.users.push({
    id: backend.state.users.length + 1,
    tenantId,
    organizationId: Number(body.organizationId || 0) || null,
    teamId: Number(body.teamId || 0) || null,
    userName,
    email,
    password: String(body.password || '123456'),
    roleCode: String(body.roleCode || 'R_USER'),
    status: String(body.status || '1') === '2' ? '2' : '1',
    locale: 'en-US',
    timezone: 'UTC',
    themeSchema: 'light',
    twoFactorEnabled: false,
    createTime: now,
    updateTime: now
  });

  return ok({}, 'Add success');
}

function updateUser(backend: DemoBackend, path: string, body: Record<string, unknown>) {
  const id = backend.parseId(path);
  const record = backend.state.users.find(item => item.id === id);

  if (!record) {
    return fail('4040', 'User not found', 404);
  }

  const nextUserName = String(body.userName || record.userName).trim();
  const nextEmail = String(body.email || record.email)
    .trim()
    .toLowerCase();
  const errors: Record<string, string[]> = {};

  if (backend.state.users.some(item => item.id !== id && item.userName.toLowerCase() === nextUserName.toLowerCase())) {
    errors.userName = ['User name has already been taken'];
  }

  if (backend.state.users.some(item => item.id !== id && item.email.toLowerCase() === nextEmail)) {
    errors.email = ['Email has already been taken'];
  }

  if (Object.keys(errors).length) {
    return validation(errors);
  }

  record.userName = nextUserName;
  record.email = nextEmail;
  record.roleCode = String(body.roleCode || record.roleCode);
  record.status = String(body.status || record.status) === '2' ? '2' : '1';
  record.organizationId = Number(body.organizationId || 0) || null;
  record.teamId = Number(body.teamId || 0) || null;
  record.updateTime = nowString();
  return ok({}, 'Update success');
}

function assignUserRole(backend: DemoBackend, path: string, body: Record<string, unknown>) {
  const id = backend.parseId(path);
  const record = backend.state.users.find(item => item.id === id);

  if (!record) {
    return fail('4040', 'User not found', 404);
  }

  record.roleCode = String(body.roleCode || record.roleCode);
  record.updateTime = nowString();
  return ok({}, 'Update success');
}

function deleteUser(backend: DemoBackend, path: string) {
  const id = backend.parseId(path);
  backend.state.users = backend.state.users.filter(item => item.id !== id);
  return ok({}, 'Delete success');
}
