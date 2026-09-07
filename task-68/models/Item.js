const { getTenantContext } = require('../middleware/tenant');
const columns = 'id,tenant_id,name,sku,created_at';
async function result(query) {
  const { data, error } = await query;
  if (error) throw error;
  return data;
}
module.exports = {
  list() {
    const { client, tenantId } = getTenantContext();
    return result(client.from('items').select(columns).eq('tenant_id', tenantId).order('created_at'));
  },
  create({ name, sku }) {
    const { client, tenantId } = getTenantContext();
    return result(client.from('items').insert({ tenant_id: tenantId, name, sku }).select(columns).single());
  },
  update(id, { name, sku }) {
    const { client, tenantId } = getTenantContext();
    return result(client.from('items').update({ name, sku }).eq('tenant_id', tenantId).eq('id', id).select(columns).maybeSingle());
  },
  remove(id) {
    const { client, tenantId } = getTenantContext();
    return result(client.from('items').delete().eq('tenant_id', tenantId).eq('id', id).select('id').maybeSingle());
  },
};
