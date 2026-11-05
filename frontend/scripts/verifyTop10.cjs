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
  const { rows } = await pool.query(`
    SELECT id, attendance_date, employee_id, employee_name, status, check_in, check_out, 
           work_hours, overtime_hours, day_type, paid_day_equivalent, late_flag, overtime_value, remarks 
    FROM attendance 
    ORDER BY id DESC 
    LIMIT 10
  `);
  console.table(rows);
  await pool.end();
}

main().catch(console.error);
