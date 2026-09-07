const { AsyncLocalStorage } = require('node:async_hooks');
const { createUserClient } = require('../db');
const tenantContext = new AsyncLocalStorage();
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function getTenantContext() {
  const context = tenantContext.getStore();
  if (!context?.tenantId || !context?.client) throw new Error('Authenticated tenant context required');
  return context;
}
function makeResolveTenant(clientFactory = createUserClient) {
  return async (req, res, next) => {
    try {
      const match = /^Bearer (\S+)$/i.exec(req.get('authorization') || '');
      if (!match) return res.status(401).json({ error: 'AUTH_REQUIRED' });
      const client = clientFactory(match[1]);
      const { data, error } = await client.auth.getUser(match[1]);
      if (error || !data?.user) return res.status(401).json({ error: 'INVALID_TOKEN' });
      const tenantId = req.get('x-tenant-id');
      if (!UUID.test(tenantId || '')) return res.status(400).json({ error: 'VALID_TENANT_ID_REQUIRED' });
      const membership = await client.from('tenant_memberships').select('tenant_id')
        .eq('tenant_id', tenantId).eq('user_id', data.user.id).maybeSingle();
      if (membership.error) throw membership.error;
      if (!membership.data) return res.status(403).json({ error: 'TENANT_ACCESS_DENIED' });
      tenantContext.run({ tenantId, client, userId: data.user.id }, next);
    } catch (error) { next(error); }
  };
}
module.exports = { makeResolveTenant, getTenantContext, tenantContext, UUID };
