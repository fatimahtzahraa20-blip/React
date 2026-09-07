function applyVisibility(query, scope = 'live') {
  if (scope === 'live') return query.is('deleted_at', null);
  if (scope === 'trash') return query.not('deleted_at', 'is', null);
  if (scope === 'all') return query;
  throw new Error('Invalid visibility scope');
}
module.exports = { applyVisibility };
