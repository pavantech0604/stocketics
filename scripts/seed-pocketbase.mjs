// scripts/seed-pocketbase.mjs
import PocketBase from 'pocketbase';

const PB_URL = process.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';
const pb = new PocketBase(PB_URL);
pb.autoCancellation(false);

const ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || 'admin@stocketics.com';
const ADMIN_PASS = process.env.PB_ADMIN_PASS || 'Stocketics@2026';

console.log(`Connecting to PocketBase at: ${PB_URL}...`);

async function main() {
  try {
    const health = await pb.health.check();
    console.log(`PocketBase health check passed (code: ${health.code})`);
  } catch (err) {
    console.error(`ERROR: Cannot connect to PocketBase at ${PB_URL}.`);
    console.error('Please make sure PocketBase is running:');
    console.error('  npm run backend');
    console.error('  or backend\\start-backend.bat');
    process.exit(1);
  }

  // Attempt Admin Auth or creation
  let isAdminAuthenticated = false;

  // Method A: Check superusers collection (PocketBase v0.23+)
  try {
    const superusers = await pb.collection('_superusers').authWithPassword(ADMIN_EMAIL, ADMIN_PASS);
    console.log(`Authenticated as Superuser: ${ADMIN_EMAIL}`);
    isAdminAuthenticated = true;
  } catch (err) {
    // If not found, try creating initial superuser
    try {
      await pb.collection('_superusers').create({
        email: ADMIN_EMAIL,
        password: ADMIN_PASS,
        passwordConfirm: ADMIN_PASS
      });
      await pb.collection('_superusers').authWithPassword(ADMIN_EMAIL, ADMIN_PASS);
      console.log(`Created new Superuser: ${ADMIN_EMAIL}`);
      isAdminAuthenticated = true;
    } catch (createErr) {
      // Fallback: try legacy admins API
      try {
        await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASS);
        console.log(`Authenticated via legacy admins API`);
        isAdminAuthenticated = true;
      } catch (legacyErr) {
        try {
          await pb.admins.create({ email: ADMIN_EMAIL, password: ADMIN_PASS, passwordConfirm: ADMIN_PASS });
          await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASS);
          console.log(`Created initial admin via legacy admins API`);
          isAdminAuthenticated = true;
        } catch (legacyCreateErr) {
          console.log(`Note: Proceeding without admin authentication (collections may already exist).`);
        }
      }
    }
  }

  // Define Schema / Collections with open API rules for CRM client
  const collectionsToSetup = [
    {
      name: 'employees',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'email', type: 'email' },
        { name: 'phone', type: 'text' },
        { name: 'role', type: 'text' },
        { name: 'department', type: 'text' },
        { name: 'title', type: 'text' },
        { name: 'avatar', type: 'text' },
        { name: 'joinDate', type: 'text' },
        { name: 'status', type: 'text' },
        { name: 'salary', type: 'number' },
        { name: 'leaveBalance', type: 'json' }
      ]
    },
    {
      name: 'leaves',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        { name: 'employeeId', type: 'text', required: true },
        { name: 'employeeName', type: 'text' },
        { name: 'department', type: 'text' },
        { name: 'avatar', type: 'text' },
        { name: 'type', type: 'text' },
        { name: 'startDate', type: 'text' },
        { name: 'endDate', type: 'text' },
        { name: 'daysCount', type: 'number' },
        { name: 'reason', type: 'text' },
        { name: 'status', type: 'text' },
        { name: 'appliedAt', type: 'text' },
        { name: 'approvedBy', type: 'text' },
        { name: 'managerNote', type: 'text' }
      ]
    },
    {
      name: 'attendance',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        { name: 'employeeId', type: 'text', required: true },
        { name: 'employeeName', type: 'text' },
        { name: 'avatar', type: 'text' },
        { name: 'department', type: 'text' },
        { name: 'date', type: 'text' },
        { name: 'punchIn', type: 'text' },
        { name: 'punchOut', type: 'text' },
        { name: 'totalHours', type: 'number' },
        { name: 'status', type: 'text' },
        { name: 'ipAddress', type: 'text' },
        { name: 'location', type: 'text' },
        { name: 'isOnBreak', type: 'bool' }
      ]
    },
    {
      name: 'leads',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        { name: 'clientName', type: 'text', required: true },
        { name: 'phone', type: 'text' },
        { name: 'email', type: 'text' },
        { name: 'serviceType', type: 'text' },
        { name: 'investmentBracket', type: 'text' },
        { name: 'status', type: 'text' },
        { name: 'assignedToId', type: 'text' },
        { name: 'assignedToName', type: 'text' },
        { name: 'lastContactDate', type: 'text' },
        { name: 'expectedRevenue', type: 'number' },
        { name: 'city', type: 'text' },
        { name: 'source', type: 'text' }
      ]
    },
    {
      name: 'confirmed_payments',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        { name: 'ownerName', type: 'text' },
        { name: 'clientName', type: 'text' },
        { name: 'mobile', type: 'text' },
        { name: 'bank', type: 'text' },
        { name: 'amount', type: 'number' },
        { name: 'status', type: 'text' },
        { name: 'reason', type: 'text' },
        { name: 'description', type: 'text' },
        { name: 'clientStatus', type: 'text' },
        { name: 'date', type: 'text' },
        { name: 'invoiceCreated', type: 'bool' },
        { name: 'invoiceData', type: 'json' }
      ]
    },
    {
      name: 'kyc_records',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        { name: 'customerName', type: 'text' },
        { name: 'panNumber', type: 'text' },
        { name: 'aadhaarNumber', type: 'text' },
        { name: 'dematClientId', type: 'text' },
        { name: 'phone', type: 'text' },
        { name: 'email', type: 'text' },
        { name: 'bankName', type: 'text' },
        { name: 'accountNumber', type: 'text' },
        { name: 'ifscCode', type: 'text' },
        { name: 'status', type: 'text' },
        { name: 'riskProfile', type: 'text' },
        { name: 'submittedAt', type: 'text' },
        { name: 'approvedAt', type: 'text' },
        { name: 'rejectionReason', type: 'text' },
        { name: 'annualIncome', type: 'text' },
        { name: 'tradingExperience', type: 'text' },
        { name: 'assignedAdvisor', type: 'text' }
      ]
    },
    {
      name: 'call_logs',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        { name: 'employeeId', type: 'text' },
        { name: 'employeeName', type: 'text' },
        { name: 'employeeAvatar', type: 'text' },
        { name: 'clientName', type: 'text' },
        { name: 'clientPhone', type: 'text' },
        { name: 'clientCity', type: 'text' },
        { name: 'callDirection', type: 'text' },
        { name: 'durationSeconds', type: 'number' },
        { name: 'timestamp', type: 'text' },
        { name: 'disposition', type: 'text' },
        { name: 'callNotes', type: 'text' },
        { name: 'sentiment', type: 'text' },
        { name: 'recordingDuration', type: 'text' },
        { name: 'managerScore', type: 'number' },
        { name: 'managerNote', type: 'text' }
      ]
    }
  ];

  if (isAdminAuthenticated) {
    for (const col of collectionsToSetup) {
      try {
        const existing = await pb.collections.getOne(col.name);
        console.log(`Collection "${col.name}" already exists.`);
      } catch (e) {
        try {
          await pb.collections.create(col);
          console.log(`Created collection: ${col.name}`);
        } catch (createError) {
          console.warn(`Could not create collection "${col.name}":`, createError.message);
        }
      }
    }
  }

  // Seed Initial Employees
  await seedIfEmpty('employees', [
    {
      name: 'Sindhu H S',
      email: 'sindhu.hs@apexedge.in',
      phone: '+91 98201 45120',
      role: 'HR Director',
      department: 'HR',
      title: 'Head of People & HR Operations',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      status: 'Active',
      joinDate: '15-Mar-2021',
      salary: 185000,
      leaveBalance: { paid: 18, sick: 7, comp: 3 }
    },
    {
      name: 'Vinod Kumar K J',
      email: 'vinod.kumar@apexedge.in',
      phone: '+91 98450 78210',
      role: 'Team Lead / VP',
      department: 'Equity Research',
      title: 'VP, Equity Advisory & Markets',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
      status: 'Active',
      joinDate: '10-Jan-2020',
      salary: 240000,
      leaveBalance: { paid: 14, sick: 6, comp: 4 }
    },
    {
      name: 'Aditya Roy',
      email: 'aditya.roy@apexedge.in',
      phone: '+91 98765 43210',
      role: 'Sr. Advisory Specialist',
      department: 'Advisory Sales',
      title: 'Senior Portfolio Manager',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      status: 'Active',
      joinDate: '01-Feb-2022',
      salary: 95000,
      leaveBalance: { paid: 12, sick: 5, comp: 2 }
    },
    {
      name: 'Sneha Kapur',
      email: 'sneha.kapur@apexedge.in',
      phone: '+91 98111 22334',
      role: 'Advisory Lead',
      department: 'Advisory Sales',
      title: 'Client Relationship Manager',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      status: 'Active',
      joinDate: '15-Jul-2023',
      salary: 82000,
      leaveBalance: { paid: 15, sick: 6, comp: 1 }
    }
  ]);

  // Seed Initial Leaves
  await seedIfEmpty('leaves', [
    {
      employeeId: 'emp-008',
      employeeName: 'Aditya Roy',
      department: 'Advisory Sales',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      type: 'Paid Time Off',
      startDate: '2026-09-15',
      endDate: '2026-09-17',
      daysCount: 3,
      reason: 'Family wedding event in Jaipur',
      status: 'Pending',
      appliedAt: '2026-09-06 14:22'
    },
    {
      employeeId: 'emp-005',
      employeeName: 'Sneha Kapur',
      department: 'Advisory Sales',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      type: 'Sick Leave',
      startDate: '2026-09-08',
      endDate: '2026-09-08',
      daysCount: 1,
      reason: 'Viral fever consultation',
      status: 'Pending',
      appliedAt: '2026-09-07 08:30'
    }
  ]);

  // Seed Initial Leads
  await seedIfEmpty('leads', [
    {
      clientName: 'Rahul Verma',
      phone: '+91 98201 11223',
      email: 'rahul.verma@gmail.com',
      serviceType: 'Options Strategy',
      investmentBracket: '₹15L - ₹25L',
      status: 'In Contact',
      assignedToId: 'emp-008',
      assignedToName: 'Aditya Roy',
      lastContactDate: '07-Sep-2026',
      expectedRevenue: 35000,
      city: 'Mumbai, MH',
      source: 'Direct Website'
    },
    {
      clientName: 'Vikramaditya Mehta',
      phone: '+91 99301 44556',
      email: 'vikram.mehta@investorcorp.in',
      serviceType: 'Equity Premier',
      investmentBracket: '₹50L+',
      status: 'Trial Active',
      assignedToId: 'emp-008',
      assignedToName: 'Aditya Roy',
      lastContactDate: '06-Sep-2026',
      expectedRevenue: 120000,
      city: 'Ahmedabad, GJ',
      source: 'Google Ads'
    },
    {
      clientName: 'Sunita Singhania',
      phone: '+91 97111 88990',
      email: 'sunita.singhania@heritagehni.com',
      serviceType: 'Hedge & PMS',
      investmentBracket: '₹1 Cr+',
      status: 'New Lead',
      assignedToId: 'emp-008',
      assignedToName: 'Aditya Roy',
      lastContactDate: '07-Sep-2026',
      expectedRevenue: 250000,
      city: 'New Delhi, DL',
      source: 'Referral'
    }
  ]);

  // Seed Confirmed Payments
  await seedIfEmpty('confirmed_payments', [
    {
      ownerName: 'Sunil Kumar',
      clientName: 'S Naveen',
      mobile: '9940721833',
      bank: 'IDFC BANK',
      amount: 25000,
      status: 'Approved',
      reason: '10082348123',
      description: 'Done',
      clientStatus: 'Fresh Client',
      date: '2026-09-04',
      invoiceCreated: true,
      invoiceData: {
        invoiceNo: 'INV-09-2026-09529',
        date: '2026-09-04 00:00:00',
        dueDate: '2026-10-03',
        clientName: 'S Naveen',
        fathersName: '',
        dob: '1990-07-22',
        email: 'Naveen62846@gmail.com',
        phone: '9940721833',
        pancard: 'ANKPN7242E',
        streetAddress: 'polur road tiruvannamalai',
        city: 'TIRUVANNAMALAI',
        itemDescription: 'INDEX OPTION',
        subType: 'NORMAL',
        fromDate: '2026-08-17',
        toDate: '2026-09-29',
        grossAmount: 51999,
        netTotal: 51999,
        discount: 26999,
        adjustment: 0,
        netAmount: 21186.44,
        gstAmount: 3813.56,
        paidAmount: 25000,
        dueAmount: 0,
        bankName: 'IDFC BANK',
        paymentMode: 'Online',
        paymentDetail: '.'
      }
    },
    {
      ownerName: 'Sneha Kapur',
      clientName: 'Priya Sharma',
      mobile: '9845129988',
      bank: 'HDFC BANK',
      amount: 45000,
      status: 'Approved',
      reason: '50200088912341',
      description: 'Options Elite Q3',
      clientStatus: 'Fresh Client',
      date: '2026-09-05',
      invoiceCreated: false
    }
  ]);

  console.log('====================================================');
  console.log('PocketBase seeding completed successfully!');
  console.log('Admin Dashboard: http://127.0.0.1:8090/_/');
  console.log('Credentials: admin@stocketics.com / Stocketics@2026');
  console.log('====================================================');
}

async function seedIfEmpty(collectionName, defaultRecords) {
  try {
    const list = await pb.collection(collectionName).getList(1, 1);
    if (list.totalItems > 0) {
      console.log(`Collection "${collectionName}" already contains ${list.totalItems} record(s). Skipping seed.`);
      return;
    }

    console.log(`Seeding initial records into "${collectionName}"...`);
    for (const record of defaultRecords) {
      await pb.collection(collectionName).create(record);
    }
    console.log(`Seeded ${defaultRecords.length} record(s) into "${collectionName}".`);
  } catch (err) {
    console.warn(`Could not seed "${collectionName}":`, err.message);
  }
}

main().catch(console.error);
