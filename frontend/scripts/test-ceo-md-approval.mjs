// Live verification of CEO and MD approval workflow
const API_URL = 'http://localhost:8080/api/v1';

async function run() {
  console.log('--- 1. Login as CEO (akshit.ujjain) ---');
  const ceoRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'akshit.ujjain', password: '' }),
  });
  const ceoData = await ceoRes.json();
  const ceoToken = ceoData.data.token;
  console.log(`CEO login OK: ${ceoData.data.name} (Role: ${ceoData.data.role})`);

  console.log('\n--- 2. Login as MD (gaurav.tripathy) ---');
  const mdRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'gaurav.tripathy', password: '' }),
  });
  const mdData = await mdRes.json();
  const mdToken = mdData.data.token;
  console.log(`MD login OK: ${mdData.data.name} (Role: ${mdData.data.role})`);

  console.log('\n--- 3. Login as Regular User (EMP-004) ---');
  const userRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'EMP-004', password: '' }),
  });
  const userData = await userRes.json();
  const userToken = userData.data.token;
  console.log(`User login OK: ${userData.data.name} (Role: ${userData.data.role})`);

  console.log('\n--- 4. Create Requirement with MD assignedApprover ---');
  const createReqRes = await fetch(`${API_URL}/requirements`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userToken}`,
    },
    body: JSON.stringify({
      projectId: 'PRJ-001',
      clientId: 'CL-001',
      featureName: 'Live MD Multi-Approver Feature Test',
      requirementType: 'Feature',
      priority: 'High',
      ownerId: 'EMP-004',
      status: 'In Progress',
      scopeFreeze: false,
      completionPercentage: 40,
      assignedApprover: 'MD – Gaurav Tripathy',
      requirementDate: '2026-11-06',
    }),
  });
  const createdReq = await createReqRes.json();
  if (!createdReq.success) {
    throw new Error(`Failed to create requirement: ${JSON.stringify(createdReq)}`);
  }
  const reqId = createdReq.data.requirementId;
  console.log(`Created Requirement: ${reqId}`);
  console.log(`Assigned Approver: ${createdReq.data.assignedApprover}`);
  console.log(`Approved By: ${createdReq.data.approvedBy ?? '-'}`);
  console.log(`Approval Date: ${createdReq.data.approvalDate ?? '-'}`);

  if (createdReq.data.assignedApprover !== 'MD – Gaurav Tripathy') {
    throw new Error('Assigned approver mismatch!');
  }
  if (createdReq.data.approvedBy != null || createdReq.data.approvalDate != null) {
    throw new Error('Approved By and Approval Date should be null prior to approval!');
  }

  console.log('\n--- 5. Unauthorized User Attempting Approval (should fail) ---');
  const unauthApproveRes = await fetch(`${API_URL}/requirements/${reqId}/approve`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${userToken}` },
  });
  console.log(`Unauthorized approval status: ${unauthApproveRes.status} (Expected 403)`);
  if (unauthApproveRes.status !== 403) {
    throw new Error(`Expected 403, got ${unauthApproveRes.status}`);
  }

  console.log('\n--- 6. MD Approving Requirement ---');
  const mdApproveRes = await fetch(`${API_URL}/requirements/${reqId}/approve`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${mdToken}` },
  });
  const mdApproveData = await mdApproveRes.json();
  console.log(`MD approve response status: ${mdApproveRes.status}`);
  console.log(`Approved Requirement status: ${mdApproveData.data.status}`);
  console.log(`Approved By: ${mdApproveData.data.approvedBy}`);
  console.log(`Approval Date: ${mdApproveData.data.approvalDate}`);

  if (mdApproveData.data.approvedBy !== 'Gaurav Tripathy') {
    throw new Error(`Expected approvedBy to be Gaurav Tripathy, got ${mdApproveData.data.approvedBy}`);
  }

  console.log('\n--- 7. Query GET API to verify persistence across sessions ---');
  const getRes = await fetch(`${API_URL}/requirements?search=${reqId}`, {
    headers: { Authorization: `Bearer ${ceoToken}` },
  });
  const getData = await getRes.json();
  const fetched = getData.data.content[0];
  console.log(`GET fetched requirement: ${fetched.requirementId}`);
  console.log(`GET assignedApprover: ${fetched.assignedApprover}`);
  console.log(`GET approvedBy: ${fetched.approvedBy}`);
  console.log(`GET approvalDate: ${fetched.approvalDate}`);

  if (fetched.approvedBy !== 'Gaurav Tripathy') {
    throw new Error(`GET API did not return Gaurav Tripathy: ${fetched.approvedBy}`);
  }

  console.log('\n--- 8. Create Requirement with CEO assignedApprover & Approve as CEO ---');
  const createCeoReqRes = await fetch(`${API_URL}/requirements`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userToken}`,
    },
    body: JSON.stringify({
      projectId: 'PRJ-001',
      clientId: 'CL-001',
      featureName: 'Live CEO Multi-Approver Feature Test',
      requirementType: 'Feature',
      priority: 'Critical',
      ownerId: 'EMP-004',
      status: 'Pending Approval',
      scopeFreeze: false,
      completionPercentage: 80,
      assignedApprover: 'CEO – Akshit Ujjain',
      requirementDate: '2026-11-06',
    }),
  });
  const createdCeoReq = await createCeoReqRes.json();
  const ceoReqId = createdCeoReq.data.requirementId;
  console.log(`Created CEO requirement: ${ceoReqId}`);

  const ceoApproveRes = await fetch(`${API_URL}/requirements/${ceoReqId}/approve`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${ceoToken}` },
  });
  const ceoApproveData = await ceoApproveRes.json();
  console.log(`CEO approve response: Approved By: ${ceoApproveData.data.approvedBy}, Date: ${ceoApproveData.data.approvalDate}`);

  if (ceoApproveData.data.approvedBy !== 'Akshit Ujjain') {
    throw new Error(`Expected approvedBy to be Akshit Ujjain, got ${ceoApproveData.data.approvedBy}`);
  }

  console.log('\n--- 9. Revoke Approval and Verify Metadata is Cleared ---');
  const revokeRes = await fetch(`${API_URL}/requirements/${ceoReqId}/revoke`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${ceoToken}` },
  });
  const revokeData = await revokeRes.json();
  console.log(`Revoke response: status=${revokeData.data.status}, approvedBy=${revokeData.data.approvedBy ?? '-'}, approvalDate=${revokeData.data.approvalDate ?? '-'}`);

  if (revokeData.data.approvedBy != null || revokeData.data.approvalDate != null) {
    throw new Error('Revoking approval should clear approvedBy and approvalDate!');
  }

  console.log('\n✅ ALL LIVE VERIFICATION CHECKS PASSED SUCCESSFULLY!');
}

run().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});

