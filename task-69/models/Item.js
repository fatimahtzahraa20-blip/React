const { applyVisibility } = require('../plugins/softDelete');
class ItemRepository {
  constructor(client, tenantId, scope = 'live') {
    if (!tenantId) throw new Error('Tenant is required');
    this.client = client; this.tenantId = tenantId; this.scope = scope;
  }
  withDeleted() { return new ItemRepository(this.client, this.tenantId, 'all'); }
  onlyDeleted() { return new ItemRepository(this.client, this.tenantId, 'trash'); }
  query() {
    return applyVisibility(this.client.from('items').select('*').eq('tenant_id', this.tenantId), this.scope);
  }
  async list(offset = 0, limit = 100) {
    return this.result(await this.query().order('created_at', { ascending: false }).order('id').range(offset, offset + limit - 1));
  }
  async create({ name, sku }) {
    return this.result(await this.client.from('items').insert({ name, sku, tenant_id: this.tenantId }).select().single());
  }
  async softDelete(id, actor) {
    return this.result(await this.client.from('items')
      .update({ deleted_at: new Date().toISOString(), deleted_by: actor })
      .eq('tenant_id', this.tenantId).eq('id', id).is('deleted_at', null).select().maybeSingle());
  }
  async restore(id) {
    return this.result(await this.client.from('items')
      .update({ deleted_at: null, deleted_by: null })
      .eq('tenant_id', this.tenantId).eq('id', id).not('deleted_at', 'is', null).select().maybeSingle(), true);
  }
  result({ data, error }, restoring = false) {
    if (!error) return data;
    if (error.code === '23505') {
      const err = new Error(restoring ? 'Another live item uses this SKU. Delete it before restoring this item.' : 'A live item already uses this SKU.');
      err.status = 409; err.code = restoring ? 'RESTORE_CONFLICT' : 'SKU_CONFLICT';
      throw err;
    }
    throw error;
  }
}
module.exports = { ItemRepository };
