const { loadEnv, ModulesSdkUtils } = require('@medusajs/framework/utils');

loadEnv(process.env.NODE_ENV || 'development', process.cwd());

// Runs before init-backend, which migrates on every boot, and does nothing
// unless it finds a database left by Medusa 2.19 with the Search Module enabled.
//
// Medusa 2.20 moved search index state into a new search_index_version table.
// Its migration (Migration20260903085616 in @medusajs/search) renames
// search_index_sync.search_index_id to search_index_version_id and adds a
// foreign key to the new table, but never converts the existing values. They
// still hold search_index ids, so on any store whose catalogue was indexed on
// 2.19 the foreign key fails and the whole migration aborts:
//
//   Key (search_index_version_id)=(srhidx_...) is not present in table
//   "search_index_version".
//
// Every main-template deploy on 2.19 has such a row, because MeiliSearch is
// on. Those rows are only bookkeeping for finished seed jobs. The Search Module
// rebuilds the index after the migration anyway (the plugin's index
// declaration changed in 2.3.0), so clearing them loses nothing.
//
// Only the exact pre-2.20 shape is touched: the sync table exists, still has
// the old column, and the version table does not exist yet. A fresh install,
// a store without search, and every run after the first are all no-ops.
//
// This works around a Medusa bug, so it lives here and not in
// medusajs-launch-utils. Delete it once Medusa fixes the migration upstream.
const main = async () => {
  const knex = ModulesSdkUtils.createPgConnection({
    clientUrl: process.env.DATABASE_URL,
    schema: 'public'
  });

  try {
    const { rows } = await knex.raw(`
      select
        to_regclass('search_index_sync') is not null as has_sync,
        to_regclass('search_index_version') is not null as has_version,
        exists (
          select 1 from information_schema.columns
          where table_schema = current_schema()
            and table_name = 'search_index_sync'
            and column_name = 'search_index_id'
        ) as has_old_column
    `);
    const { has_sync, has_version, has_old_column } = rows[0];

    if (has_sync && has_old_column && !has_version) {
      const result = await knex.raw('delete from search_index_sync');
      console.log(
        `Cleared ${result.rowCount} search sync record(s) left by Medusa 2.19 so the 2.20 search migration can run. ` +
        'The search index is rebuilt automatically after migrating.'
      );
    }
  } finally {
    await knex.destroy();
  }
};

main().catch((error) => {
  console.error('prepare-migrations failed:', error.message);
  process.exit(1);
});
