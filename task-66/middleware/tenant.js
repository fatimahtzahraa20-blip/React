// Demo tenant header. Production must populate req.auth from verified authentication
// and remove this header fallback before exposing the service.
function resolveTenant(req, res, next) {
  const tenantId = req.auth?.tenantId || req.get('x-tenant-id');
  if (typeof tenantId !== 'string' || !tenantId.trim() || tenantId.length > 200) {
    return res.status(401).json({ error: 'TENANT_REQUIRED' });
  }
  req.tenantId = tenantId;
  next();
}
module.exports = { resolveTenant };
