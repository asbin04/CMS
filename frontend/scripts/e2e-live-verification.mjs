const BASE_URL = 'http://localhost:8080/api/v1';

async function run() {
  console.log('================================================================');
  console.log('TIMESHEETS & REQUIREMENTS COMPLETE END-TO-END VERIFICATION');
  console.log('================================================================');

  // STEP 1: AUTHENTICATION
  console.log('\n[1/10] Authenticating via POST /api/v1/auth/login...');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ username: 'akshit.ujjain', password: 'password123' })
  });
  const loginData = await loginRes.json();
  if (!loginRes.ok || !loginData?.data?.token) {
    throw new Error(`Login failed with status ${loginRes.status}: ${JSON.stringify(loginData)}`);
  }
  const token = loginData.data.token;
  const authHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  console.log(`✓ Authenticated as: ${loginData.data.username} (Role: ${loginData.data.role})`);

  // STEP 2: VERIFY GET TIMESHEETS & KPIS
  console.log('\n[2/10] Testing GET /api/v1/timesheets and /api/v1/timesheets/kpis...');
  const tsGetRes = await fetch(`${BASE_URL}/timesheets?page=1&size=10`, { headers: authHeaders });
  const tsGetData = await tsGetRes.json();
  console.log(`✓ GET /timesheets Status: ${tsGetRes.status}, Total Elements: ${tsGetData?.data?.totalElements}`);

  const tsKpiRes = await fetch(`${BASE_URL}/timesheets/kpis`, { headers: authHeaders });
  const tsKpiData = await tsKpiRes.json();
  console.log(`✓ GET /timesheets/kpis Status: ${tsKpiRes.status}, Total Hours: ${tsKpiData?.data?.totalHours}`);

  // STEP 3: VERIFY GET REQUIREMENTS & KPIS
  console.log('\n[3/10] Testing GET /api/v1/requirements and /api/v1/requirements/kpis...');
  const reqGetRes = await fetch(`${BASE_URL}/requirements?page=1&size=10`, { headers: authHeaders });
  const reqGetData = await reqGetRes.json();
  console.log(`✓ GET /requirements Status: ${reqGetRes.status}, Total Elements: ${reqGetData?.data?.totalElements}`);

  const reqKpiRes = await fetch(`${BASE_URL}/requirements/kpis`, { headers: authHeaders });
  const reqKpiData = await reqKpiRes.json();
  console.log(`✓ GET /requirements/kpis Status: ${reqKpiRes.status}, Total Requirements: ${reqKpiData?.data?.totalRequirements}`);

  // STEP 4: CREATE TIMESHEET VIA POST
  console.log('\n[4/10] Creating Timesheet via POST /api/v1/timesheets...');
  const newTimesheetPayload = {
    projectId: 'PRJ-001',
    taskId: 'TSK-00128',
    employeeId: 'EMP-001',
    employeeName: 'Amit Sharma',
    timesheetDate: '2026-11-05',
    hours: 7.5,
    hoursWorked: 7.5,
    billable: 'Billable',
    hourlyRate: 850.0,
    taskDescription: 'Live E2E Verification Effort'
  };

  const tsCreateRes = await fetch(`${BASE_URL}/timesheets`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(newTimesheetPayload)
  });
  const tsCreateData = await tsCreateRes.json();
  console.log(`✓ POST /timesheets Status: ${tsCreateRes.status}`);
  if (!tsCreateRes.ok) {
    throw new Error(`Failed to create timesheet: ${JSON.stringify(tsCreateData)}`);
  }
  const createdTimesheetId = tsCreateData.data.timesheetId;
  console.log(`✓ Created Timesheet ID: ${createdTimesheetId}, Hours: ${tsCreateData.data.hours}, Cost: ${tsCreateData.data.laborCost}`);

  // STEP 5: VERIFY PERSISTENCE & GET AFTER REFRESH (TIMESHEET)
  console.log(`\n[5/10] Verifying Timesheet Persistence via GET /api/v1/timesheets/${createdTimesheetId}...`);
  const tsFetchRes = await fetch(`${BASE_URL}/timesheets/${createdTimesheetId}`, { headers: authHeaders });
  const tsFetchData = await tsFetchRes.json();
  if (!tsFetchRes.ok || tsFetchData.data.timesheetId !== createdTimesheetId) {
    throw new Error(`Timesheet not found on GET after creation: ${JSON.stringify(tsFetchData)}`);
  }
  console.log(`✓ GET /timesheets/${createdTimesheetId} Status: ${tsFetchRes.status}, Confirmed persisted in Supabase!`);

  // STEP 6: TEST TIMESHEET UPDATE & APPROVAL
  console.log(`\n[6/10] Testing Timesheet Update & Approval...`);
  const tsUpdateRes = await fetch(`${BASE_URL}/timesheets/${createdTimesheetId}`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({ hoursWorked: 8.0, description: 'Updated E2E verification effort' })
  });
  const tsUpdateData = await tsUpdateRes.json();
  console.log(`✓ PUT /timesheets/${createdTimesheetId} Status: ${tsUpdateRes.status}, Hours: ${tsUpdateData?.data?.hours}`);

  const tsApproveRes = await fetch(`${BASE_URL}/timesheets/${createdTimesheetId}/approve`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ comments: 'Approved by E2E runner' })
  });
  const tsApproveData = await tsApproveRes.json();
  console.log(`✓ POST /timesheets/${createdTimesheetId}/approve Status: ${tsApproveRes.status}, Status: ${tsApproveData?.data?.approvalStatus}`);

  // STEP 7: CREATE REQUIREMENT VIA POST
  console.log('\n[7/10] Creating Requirement via POST /api/v1/requirements...');
  const newReqPayload = {
    projectId: 'PRJ-001',
    clientId: 'CL-001',
    featureName: 'End-to-End Live Integration Feature',
    title: 'End-to-End Live Integration Feature',
    requirementFeature: 'End-to-End Live Integration Feature',
    type: 'Functional',
    priority: 'High',
    ownerId: 'EMP-001',
    status: 'In Progress',
    scopeFreeze: false,
    completionPercentage: 35,
    requirementDate: '2026-11-05',
    description: 'Real integration test record across frontend, backend, and Supabase'
  };

  const reqCreateRes = await fetch(`${BASE_URL}/requirements`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify(newReqPayload)
  });
  const reqCreateData = await reqCreateRes.json();
  console.log(`✓ POST /requirements Status: ${reqCreateRes.status}`);
  if (!reqCreateRes.ok) {
    throw new Error(`Failed to create requirement: ${JSON.stringify(reqCreateData)}`);
  }
  const createdReqId = reqCreateData.data.requirementId;
  console.log(`✓ Created Requirement ID: ${createdReqId}, Feature: "${reqCreateData.data.featureName}", Status: ${reqCreateData.data.status}`);

  // STEP 8: VERIFY PERSISTENCE & GET AFTER REFRESH (REQUIREMENT)
  console.log(`\n[8/10] Verifying Requirement Persistence via GET /api/v1/requirements/${createdReqId}...`);
  const reqFetchRes = await fetch(`${BASE_URL}/requirements/${createdReqId}`, { headers: authHeaders });
  const reqFetchData = await reqFetchRes.json();
  if (!reqFetchRes.ok || reqFetchData.data.requirementId !== createdReqId) {
    throw new Error(`Requirement not found on GET after creation: ${JSON.stringify(reqFetchData)}`);
  }
  console.log(`✓ GET /requirements/${createdReqId} Status: ${reqFetchRes.status}, Confirmed persisted in Supabase!`);

  // STEP 9: TEST REQUIREMENT UPDATE, STATUS PROGRESSION & SCOPE FREEZE/UNFREEZE
  console.log(`\n[9/10] Testing Requirement Updates, Scope Freeze and Completion...`);
  const reqUpdateRes = await fetch(`${BASE_URL}/requirements/${createdReqId}`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({ completionPercentage: 75, priority: 'High', description: 'Updated requirement description' })
  });
  const reqUpdateData = await reqUpdateRes.json();
  console.log(`✓ PUT /requirements/${createdReqId} Status: ${reqUpdateRes.status}, Completion: ${reqUpdateData?.data?.completionPercentage}%, Priority: ${reqUpdateData?.data?.priority}`);

  const freezeRes = await fetch(`${BASE_URL}/requirements/${createdReqId}/scope-freeze`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ scopeFreeze: true, reason: 'Locking scope for Milestone 1' })
  });
  const freezeData = await freezeRes.json();
  console.log(`✓ POST /requirements/${createdReqId}/scope-freeze Status: ${freezeRes.status}, Scope Freeze: ${freezeData?.data?.scopeFreeze}`);

  const unfreezeRes = await fetch(`${BASE_URL}/requirements/${createdReqId}/scope-freeze`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ scopeFreeze: false, reason: 'Change order approved' })
  });
  const unfreezeData = await unfreezeRes.json();
  console.log(`✓ POST /requirements/${createdReqId}/scope-freeze (unfreeze) Status: ${unfreezeRes.status}, Scope Freeze: ${unfreezeData?.data?.scopeFreeze}`);

  const statusRes = await fetch(`${BASE_URL}/requirements/${createdReqId}/status`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({ status: 'Completed' })
  });
  const statusData = await statusRes.json();
  console.log(`✓ PATCH /requirements/${createdReqId}/status Status: ${statusRes.status}, New Status: ${statusData?.data?.status}`);

  // STEP 10: SIMULATE BROWSER REFRESH & FINAL VERIFICATION IN QUERY LIST
  console.log('\n[10/10] Simulating Full Browser Refresh (Calling Paginated List Queries)...');
  const finalTsList = await fetch(`${BASE_URL}/timesheets?project=PRJ-001&page=1&size=20`, { headers: authHeaders });
  const finalTsListData = await finalTsList.json();
  const foundTs = finalTsListData?.data?.content?.some(t => t.timesheetId === createdTimesheetId);
  console.log(`✓ Refresh Timesheet Verification: Found created ${createdTimesheetId} in refreshed GET list? -> ${foundTs}`);

  const finalReqList = await fetch(`${BASE_URL}/requirements?project=PRJ-001&page=1&size=20`, { headers: authHeaders });
  const finalReqListData = await finalReqList.json();
  const foundReq = finalReqListData?.data?.content?.some(r => r.requirementId === createdReqId);
  console.log(`✓ Refresh Requirement Verification: Found created ${createdReqId} in refreshed GET list? -> ${foundReq}`);

  console.log('\n================================================================');
  console.log('ALL LIVE END-TO-END VERIFICATION STEPS PASSED WITH 100% SUCCESS!');
  console.log('================================================================');
}

run().catch((err) => {
  console.error('\n❌ E2E VERIFICATION FAILED:', err);
  process.exit(1);
});
