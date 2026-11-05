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
  console.log('Connecting to PostgreSQL database...');

  // 1. Alter table to add new columns
  await pool.query(`
    ALTER TABLE attendance 
    ADD COLUMN IF NOT EXISTS paid_day_equivalent VARCHAR(20) DEFAULT '1.0',
    ADD COLUMN IF NOT EXISTS late_flag VARCHAR(10) DEFAULT 'No',
    ADD COLUMN IF NOT EXISTS overtime_value VARCHAR(30) DEFAULT '₹ 0',
    ADD COLUMN IF NOT EXISTS remarks VARCHAR(150) DEFAULT '-';
  `);
  console.log('Columns added successfully.');

  // 2. Fetch all records to update them dynamically
  const { rows } = await pool.query('SELECT * FROM attendance ORDER BY id ASC');
  console.log(`Updating ${rows.length} attendance rows in database...`);

  // Target overrides for the first 10 rows (ATT-001248 to ATT-001239)
  const top10Exact = {
    'ATT-001248': {
      attendance_date: '31 Oct 2026',
      employee_id: 'EMP-001',
      employee_name: 'Amit Sharma',
      avatar_initials: 'AS',
      avatar_color: 'blue',
      status: 'Present',
      check_in: '09:05 AM',
      check_out: '06:30 PM',
      work_hours: '8h 25m',
      overtime_hours: '1h 00m',
      work_minutes: 505,
      overtime_minutes: 60,
      day_type: 'Working Day',
      paid_day_equivalent: '1.0',
      late_flag: 'No',
      is_late: false,
      overtime_value: '₹ 750',
      remarks: '-',
    },
    'ATT-001247': {
      attendance_date: '31 Oct 2026',
      employee_id: 'EMP-004',
      employee_name: 'Sneha Nair',
      avatar_initials: 'SN',
      avatar_color: 'purple',
      status: 'Present',
      check_in: '09:12 AM',
      check_out: '06:10 PM',
      work_hours: '7h 58m',
      overtime_hours: '0h 30m',
      work_minutes: 478,
      overtime_minutes: 30,
      day_type: 'Working Day',
      paid_day_equivalent: '1.0',
      late_flag: 'Yes',
      is_late: true,
      overtime_value: '₹ 375',
      remarks: 'Late 12 mins',
    },
    'ATT-001246': {
      attendance_date: '31 Oct 2026',
      employee_id: 'EMP-006',
      employee_name: 'Ananya Rao',
      avatar_initials: 'AN',
      avatar_color: 'amber',
      status: 'Leave',
      check_in: '-',
      check_out: '-',
      work_hours: '0h 0m',
      overtime_hours: '0h 0m',
      work_minutes: 0,
      overtime_minutes: 0,
      day_type: 'Leave',
      paid_day_equivalent: '0.0',
      late_flag: 'No',
      is_late: false,
      overtime_value: '₹ 0',
      remarks: 'Personal leave',
    },
    'ATT-001245': {
      attendance_date: '31 Oct 2026',
      employee_id: 'EMP-002',
      employee_name: 'Priya Kapoor',
      avatar_initials: 'PK',
      avatar_color: 'pink',
      status: 'Present',
      check_in: '09:00 AM',
      check_out: '07:15 PM',
      work_hours: '8h 45m',
      overtime_hours: '1h 45m',
      work_minutes: 525,
      overtime_minutes: 105,
      day_type: 'Working Day',
      paid_day_equivalent: '1.0',
      late_flag: 'No',
      is_late: false,
      overtime_value: '₹ 1,312',
      remarks: '-',
    },
    'ATT-001244': {
      attendance_date: '30 Oct 2026',
      employee_id: 'EMP-003',
      employee_name: 'Rohan Kumar',
      avatar_initials: 'RK',
      avatar_color: 'rose',
      status: 'Half Day',
      check_in: '09:10 AM',
      check_out: '01:30 PM',
      work_hours: '4h 20m',
      overtime_hours: '0h 0m',
      work_minutes: 260,
      overtime_minutes: 0,
      day_type: 'Working Day',
      paid_day_equivalent: '0.5',
      late_flag: 'Yes',
      is_late: true,
      overtime_value: '₹ 0',
      remarks: 'Left early',
    },
    'ATT-001243': {
      attendance_date: '30 Oct 2026',
      employee_id: 'EMP-007',
      employee_name: 'Karthik R',
      avatar_initials: 'KS',
      avatar_color: 'orange',
      status: 'Present',
      check_in: '08:55 AM',
      check_out: '06:40 PM',
      work_hours: '8h 45m',
      overtime_hours: '1h 15m',
      work_minutes: 525,
      overtime_minutes: 75,
      day_type: 'Working Day',
      paid_day_equivalent: '1.0',
      late_flag: 'No',
      is_late: false,
      overtime_value: '₹ 937',
      remarks: '-',
    },
    'ATT-001242': {
      attendance_date: '30 Oct 2026',
      employee_id: 'EMP-008',
      employee_name: 'Divya Patel',
      avatar_initials: 'DP',
      avatar_color: 'teal',
      status: 'Absent',
      check_in: '-',
      check_out: '-',
      work_hours: '0h 0m',
      overtime_hours: '0h 0m',
      work_minutes: 0,
      overtime_minutes: 0,
      day_type: 'Working Day',
      paid_day_equivalent: '0.0',
      late_flag: 'No',
      is_late: false,
      overtime_value: '₹ 0',
      remarks: 'Absent',
    },
    'ATT-001241': {
      attendance_date: '29 Oct 2026',
      employee_id: 'EMP-005',
      employee_name: 'Vikram Shah',
      avatar_initials: 'VK',
      avatar_color: 'emerald',
      status: 'Present',
      check_in: '09:08 AM',
      check_out: '06:05 PM',
      work_hours: '7h 57m',
      overtime_hours: '0h 25m',
      work_minutes: 477,
      overtime_minutes: 25,
      day_type: 'Working Day',
      paid_day_equivalent: '1.0',
      late_flag: 'Yes',
      is_late: true,
      overtime_value: '₹ 312',
      remarks: 'Late 8 mins',
    },
    'ATT-001240': {
      attendance_date: '29 Oct 2026',
      employee_id: 'EMP-001',
      employee_name: 'Amit Sharma',
      avatar_initials: 'AS',
      avatar_color: 'blue',
      status: 'Present',
      check_in: '09:02 AM',
      check_out: '06:20 PM',
      work_hours: '8h 18m',
      overtime_hours: '0h 50m',
      work_minutes: 498,
      overtime_minutes: 50,
      day_type: 'Working Day',
      paid_day_equivalent: '1.0',
      late_flag: 'No',
      is_late: false,
      overtime_value: '₹ 625',
      remarks: '-',
    },
    'ATT-001239': {
      attendance_date: '29 Oct 2026',
      employee_id: 'EMP-004',
      employee_name: 'Sneha Nair',
      avatar_initials: 'SN',
      avatar_color: 'purple',
      status: 'Holiday',
      check_in: '-',
      check_out: '-',
      work_hours: '0h 0m',
      overtime_hours: '0h 0m',
      work_minutes: 0,
      overtime_minutes: 0,
      day_type: 'Holiday',
      paid_day_equivalent: '0.0',
      late_flag: 'No',
      is_late: false,
      overtime_value: '₹ 0',
      remarks: 'Company holiday',
    },
  };

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const r of rows) {
      if (top10Exact[r.id]) {
        const top = top10Exact[r.id];
        await client.query(
          `UPDATE attendance SET 
             attendance_date = $1,
             employee_id = $2,
             employee_name = $3,
             avatar_initials = $4,
             avatar_color = $5,
             status = $6,
             check_in = $7,
             check_out = $8,
             work_hours = $9,
             overtime_hours = $10,
             work_minutes = $11,
             overtime_minutes = $12,
             day_type = $13,
             paid_day_equivalent = $14,
             late_flag = $15,
             is_late = $16,
             overtime_value = $17,
             remarks = $18
           WHERE id = $19`,
          [
            top.attendance_date,
            top.employee_id,
            top.employee_name,
            top.avatar_initials,
            top.avatar_color,
            top.status,
            top.check_in,
            top.check_out,
            top.work_hours,
            top.overtime_hours,
            top.work_minutes,
            top.overtime_minutes,
            top.day_type,
            top.paid_day_equivalent,
            top.late_flag,
            top.is_late,
            top.overtime_value,
            top.remarks,
            r.id,
          ]
        );
      } else {
        // Calculate dynamic values for all remaining 1238 rows
        const status = r.status || 'Present';
        let paidEq = '1.0';
        if (status === 'Half Day') paidEq = '0.5';
        else if (status === 'Leave' || status === 'Absent' || status === 'Holiday') paidEq = '0.0';

        const isLate = Boolean(r.is_late);
        const lateFlag = isLate ? 'Yes' : 'No';

        const otMinutes = r.overtime_minutes || 0;
        const otVal = otMinutes > 0 ? `₹ ${Math.round(otMinutes * 12.5).toLocaleString('en-IN')}` : '₹ 0';

        let remarks = '-';
        if (isLate) {
          const lateMins = Math.floor(Math.random() * 20) + 5;
          remarks = `Late ${lateMins} mins`;
        } else if (status === 'Half Day') {
          remarks = 'Left early';
        } else if (status === 'Leave') {
          remarks = 'Personal leave';
        } else if (status === 'Absent') {
          remarks = 'Absent';
        } else if (status === 'Holiday') {
          remarks = 'Company holiday';
        }

        // Standardize Day Type to "Working Day" unless Leave or Holiday
        let dayType = r.day_type || 'Working Day';
        if (status === 'Leave') dayType = 'Leave';
        else if (status === 'Holiday') dayType = 'Holiday';
        else if (dayType === 'Regular') dayType = 'Working Day';

        await client.query(
          `UPDATE attendance SET 
             day_type = $1,
             paid_day_equivalent = $2,
             late_flag = $3,
             overtime_value = $4,
             remarks = $5
           WHERE id = $6`,
          [dayType, paidEq, lateFlag, otVal, remarks, r.id]
        );
      }
    }

    await client.query('COMMIT');
    console.log('Successfully upgraded all 1,248 attendance rows in PostgreSQL!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error during upgrade:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
