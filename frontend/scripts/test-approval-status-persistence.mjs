const BASE_URL = 'http://localhost:8080/api/v1';

async function run() {
  console.log('================================================================');
  console.log('TESTING APPROVAL STATUS PERSISTENCE LIFECYCLE IN TIMESHEETS');
  console.log('================================================================');

  // STEP 1: AUTHENTICATION
  console.log('\n[1/6] Authenticating as manager/admin/CEO...');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'akshit.ujjain', password: 'password123' })
  });
  const auth = await loginRes.json();
  const token = auth.data.token;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  console.log(`✓ Authenticated as: ${auth.data.username}`);

  const targetId = 'TS-202611-020';

  // Ensure initial status is Pending
  console.log(`\nPreparing target timesheet ${targetId} into 'Pending' state...`);
  await fetch(`${BASE_URL}/timesheets/${targetId}/status`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status: 'Pending' })
  });

  const checkInitial = await (await fetch(`${BASE_URL}/timesheets/${targetId}`, { headers })).json();
  console.log(`✓ Initial status in Supabase: ${checkInitial.data.approvalStatus}`);
  if (checkInitial.data.approvalStatus !== 'Pending') {
    throw new Error(`Expected Pending, got ${checkInitial.data.approvalStatus}`);
  }

  // STEP 2: CHANGE PENDING -> APPROVED
  console.log(`\n[2/6] Action: Change Pending -> Approved for ${targetId}...`);
  const approveRes = await fetch(`${BASE_URL}/timesheets/${targetId}/approve`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ comments: 'Approved via table status dropdown' })
  });
  const approveData = await approveRes.json();
  console.log(`✓ POST /timesheets/${targetId}/approve Status: ${approveRes.status}`);
  console.log(`  Returned status: ${approveData?.data?.approvalStatus}, ApprovedBy: ${approveData?.data?.approvedBy}`);
  if (approveRes.status !== 200 || approveData?.data?.approvalStatus !== 'Approved') {
    throw new Error(`Approve failed: ${JSON.stringify(approveData)}`);
  }

  // STEP 3: REFRESH BROWSER (GET API) & VERIFY APPROVED PERSISTENCE
  console.log(`\n[3/6] Simulating Browser Refresh: Querying GET /timesheets/${targetId} and list API...`);
  const getApproveSingle = await (await fetch(`${BASE_URL}/timesheets/${targetId}`, { headers })).json();
  const getApproveList = await (await fetch(`${BASE_URL}/timesheets?page=1&size=20`, { headers })).json();
  const itemApprove = getApproveList.data.content.find(x => x.timesheetId === targetId);

  console.log(`✓ Single GET verified: ${getApproveSingle.data.approvalStatus}`);
  console.log(`✓ List GET verified: ${itemApprove?.approvalStatus}`);
  if (getApproveSingle.data.approvalStatus !== 'Approved' || itemApprove?.approvalStatus !== 'Approved') {
    throw new Error('Approved status did not persist in Supabase after refresh!');
  }

  // STEP 4: CHANGE APPROVED -> REJECTED
  console.log(`\n[4/6] Action: Change Approved -> Rejected for ${targetId}...`);
  const rejectRes = await fetch(`${BASE_URL}/timesheets/${targetId}/reject`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ reason: 'Effort allocation exceeded limit' })
  });
  const rejectData = await rejectRes.json();
  console.log(`✓ POST /timesheets/${targetId}/reject Status: ${rejectRes.status}`);
  console.log(`  Returned status: ${rejectData?.data?.approvalStatus}, RejectionReason: ${rejectData?.data?.rejectionReason}`);
  if (rejectRes.status !== 200 || rejectData?.data?.approvalStatus !== 'Rejected') {
    throw new Error(`Reject failed: ${JSON.stringify(rejectData)}`);
  }

  // STEP 5: REFRESH BROWSER (GET API) & VERIFY REJECTED PERSISTENCE
  console.log(`\n[5/6] Simulating Browser Refresh: Querying GET /timesheets/${targetId} and list API...`);
  const getRejectSingle = await (await fetch(`${BASE_URL}/timesheets/${targetId}`, { headers })).json();
  const getRejectList = await (await fetch(`${BASE_URL}/timesheets?page=1&size=20`, { headers })).json();
  const itemReject = getRejectList.data.content.find(x => x.timesheetId === targetId);

  console.log(`✓ Single GET verified: ${getRejectSingle.data.approvalStatus}`);
  console.log(`✓ List GET verified: ${itemReject?.approvalStatus}`);
  if (getRejectSingle.data.approvalStatus !== 'Rejected' || itemReject?.approvalStatus !== 'Rejected') {
    throw new Error('Rejected status did not persist in Supabase after refresh!');
  }

  // STEP 6: CHANGE REJECTED -> PENDING (RESTORE TO ORIGINAL STATE)
  console.log(`\n[6/6] Action: Change Rejected -> Pending for ${targetId}...`);
  const submitRes = await fetch(`${BASE_URL}/timesheets/${targetId}/submit`, {
    method: 'POST',
    headers
  });
  const submitData = await submitRes.json();
  console.log(`✓ POST /timesheets/${targetId}/submit Status: ${submitRes.status}`);
  console.log(`  Returned status: ${submitData?.data?.approvalStatus}`);
  if (submitRes.status !== 200 || submitData?.data?.approvalStatus !== 'Pending') {
    throw new Error(`Submit failed: ${JSON.stringify(submitData)}`);
  }

  const finalCheck = await (await fetch(`${BASE_URL}/timesheets/${targetId}`, { headers })).json();
  console.log(`✓ Final Supabase Verification: ${finalCheck.data.approvalStatus} (Restored cleanly)`);

  console.log('\n================================================================');
  console.log('✓ ALL STATUS TRANSITIONS PERSISTED IN SUPABASE ACROSS REFRESHES!');
  console.log('================================================================');
}

run().catch(err => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});

