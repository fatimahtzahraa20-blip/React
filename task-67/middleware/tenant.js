// Demo only: this header is a namespace, not authentication.
function resolveTenant(req, res, next) {
  const tenantId = req.auth?.tenantId || req.get('x-tenant-id');
  if (typeof tenantId !== 'string' || !tenantId.trim() || tenantId.length > 100) {
    return res.status(401).json({ error: 'TENANT_REQUIRED', message: 'Provide x-tenant-id (demo namespace).' });
  }
  req.tenantId = tenantId;
  next();
}
module.exports = { resolveTenant };

