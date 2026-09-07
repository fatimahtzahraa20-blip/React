// Local demo only. Production must derive tenant and actor from verified authentication.
function resolveTenant(req, res, next) {
  const tenantId = req.header('x-tenant-id');
  const actor = req.header('x-user-id') || null;
  if (!tenantId || !tenantId.trim() || tenantId.length > 100 || (actor && actor.length > 100)) {
    return res.status(400).json({ error: 'INVALID_TENANT', message: 'Provide x-tenant-id (1-100 characters).' });
  }
  req.tenantId = tenantId.trim() === 'demo-tenant' ? '79000000-0000-4000-8000-000000000079' : tenantId.trim(); req.actor = actor; next();
}
module.exports = { resolveTenant };
