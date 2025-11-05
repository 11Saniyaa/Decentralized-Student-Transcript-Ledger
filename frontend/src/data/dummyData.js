// Dummy data for the application

export const dummyStudents = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@university.edu',
    studentId: 'STU2024001',
    institution: 'Tech University',
    department: 'Computer Science',
    degree: 'Bachelor of Science',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@university.edu',
    studentId: 'STU2024002',
    institution: 'Tech University',
    department: 'Electrical Engineering',
    degree: 'Bachelor of Engineering',
  },
];

export const dummyInstitutions = [
  {
    id: '1',
    name: 'Tech University',
    email: 'admin@techuniversity.edu',
    address: '123 University Ave, Tech City',
    type: 'University',
  },
  {
    id: '2',
    name: 'State College',
    email: 'admin@statecollege.edu',
    address: '456 College Blvd, State City',
    type: 'College',
  },
];

export const generateDummyDocuments = (studentId) => {
  return [
    {
      id: `doc-${Date.now()}-1`,
      studentId,
      name: 'Academic Transcript 2024',
      type: 'Transcript',
      uploadDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      ipfsHash: `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      blockchainHash: `0x${Math.random().toString(16).substring(2, 18)}${Math.random().toString(16).substring(2, 18)}`,
      status: 'Verified',
      verifiedBy: 'Tech University',
      verifiedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: `doc-${Date.now()}-2`,
      studentId,
      name: 'Degree Certificate',
      type: 'Certificate',
      uploadDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      ipfsHash: `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      blockchainHash: `0x${Math.random().toString(16).substring(2, 18)}${Math.random().toString(16).substring(2, 18)}`,
      status: 'Pending',
      verifiedBy: null,
      verifiedDate: null,
    },
    {
      id: `doc-${Date.now()}-3`,
      studentId,
      name: 'Course Completion Certificate',
      type: 'Certificate',
      uploadDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      ipfsHash: `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      blockchainHash: `0x${Math.random().toString(16).substring(2, 18)}${Math.random().toString(16).substring(2, 18)}`,
      status: 'Pending',
      verifiedBy: null,
      verifiedDate: null,
    },
  ];
};

export const generateDummyTransactions = () => {
  const transactions = [];
  for (let i = 0; i < 10; i++) {
    transactions.push({
      id: `tx-${Date.now()}-${i}`,
      hash: `0x${Math.random().toString(16).substring(2, 18)}${Math.random().toString(16).substring(2, 18)}${Math.random().toString(16).substring(2, 18)}`,
      type: ['Upload', 'Verify', 'Update'][Math.floor(Math.random() * 3)],
      timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      from: `0x${Math.random().toString(16).substring(2, 18)}${Math.random().toString(16).substring(2, 18)}`,
      to: `0x${Math.random().toString(16).substring(2, 18)}${Math.random().toString(16).substring(2, 18)}`,
      status: ['Confirmed', 'Pending'][Math.floor(Math.random() * 2)],
      blockNumber: Math.floor(Math.random() * 1000000) + 1000000,
    });
  }
  return transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
};

export const generateDummyVerificationRequests = () => {
  return [
    {
      id: 'req-1',
      studentId: 'STU2024001',
      studentName: 'John Doe',
      documentName: 'Academic Transcript 2024',
      documentType: 'Transcript',
      ipfsHash: `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      requestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'Pending',
    },
    {
      id: 'req-2',
      studentId: 'STU2024002',
      studentName: 'Jane Smith',
      documentName: 'Degree Certificate',
      documentType: 'Certificate',
      ipfsHash: `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      requestDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'Pending',
    },
    {
      id: 'req-3',
      studentId: 'STU2024001',
      studentName: 'John Doe',
      documentName: 'Course Completion Certificate',
      documentType: 'Certificate',
      ipfsHash: `Qm${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      requestDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'Verified',
    },
  ];
};

