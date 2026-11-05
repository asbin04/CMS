async function main() {
  const res = await fetch('http://localhost:5173/api/v1/attendance');
  const list = await res.json();
  console.log('Total fetched:', list.length);
  const sample = list.slice(0, 10).map((r) => ({
    id: r.id,
    date: r.attendanceDate,
    empId: r.employeeId,
    name: r.employeeName,
    status: r.status,
    in: r.checkIn,
    out: r.checkOut,
    work: r.workHours,
    ot: r.overtimeHours,
    dayType: r.dayType,
    paidEq: r.paidDayEquivalent,
    lateFlag: r.lateFlag,
    otVal: r.overtimeValue,
    remarks: r.remarks,
  }));
  console.table(sample);
}

main().catch(console.error);
