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
  const tablesRes = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name
  `);
  
  console.log('=== PUBLIC TABLES & ROW COUNTS ===');
  for (const row of tablesRes.rows) {
    try {
      const countRes = await pool.query(`SELECT COUNT(*) as count FROM "${row.table_name}"`);
      console.log(`- ${row.table_name}: ${countRes.rows[0].count} rows`);
    } catch (e) {
      console.log(`- ${row.table_name}: error reading count (${e.message})`);
    }
  }

  await pool.end();
}

main().catch(console.error);
