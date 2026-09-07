function serialize(row) {
  return {
    id: row.id, title: row.title, body: row.body, version: row.version,
    lastEditedBy: row.last_edited_by, updatedAt: row.updated_at,
  };
}

function createDocumentStore(db) {
  return {
    async get(tenantId, id) {
      const { data, error } = await db.from('documents').select('*')
        .eq('tenant_id', tenantId).eq('id', id).maybeSingle();
      if (error) throw error;
      return data ? serialize(data) : null;
    },
    async create(tenantId, input) {
      const { data, error } = await db.from('documents').insert({
        tenant_id: tenantId, title: input.title, body: input.body ?? '',
        last_edited_by: input.editedBy ?? null,
      }).select().single();
      if (error) throw error;
      return serialize(data);
    },
    async update(tenantId, id, input) {
      const changes = {};
      for (const key of ['title', 'body', 'editedBy']) {
        if (input[key] !== undefined) changes[key] = input[key];
      }
      const { data, error } = await db.rpc('update_document', {
        p_tenant_id: tenantId, p_id: id,
        p_expected_version: input.version, p_changes: changes,
      });
      if (error) throw error;
      return { status: data.status, current: data.current ? serialize(data.current) : null };
    },
  };
}
module.exports = { createDocumentStore };

