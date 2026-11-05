const { Pool } = require('pg');

const pool = new Pool({
  host: 'aws-0-ap-southeast-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.cwjahqpeaxxawpfcbykr',
  password: 'Kalpanaaasoftwaresolu',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  for (const table of ['employee_approvals', 'client_approvals', 'ticket_asset_approvals']) {
    const res = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = '${table}'
    `);
    console.log(`=== ${table} ===`);
    console.log(res.rows);
  }
  await pool.end();
}

main().catch(console.error);
