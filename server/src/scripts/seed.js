import dotenv from 'dotenv';
import { connectDB } from '../config/database.js';
import Student from '../models/Student.js';
import Transcript from '../models/Transcript.js';
import Request from '../models/Request.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Student.deleteMany({});
    await Transcript.deleteMany({});
    await Request.deleteMany({});

    console.log('Cleared existing data...');

    // Create sample students with realistic names
    const students = [
      {
        name: 'Saniya Sharma',
        prn: 'STU2024001',
        walletId: '0x1234567890123456789012345678901234567890',
        branch: 'Computer Science and Engineering',
      },
      {
        name: 'Raj Patel',
        prn: 'STU2024002',
        walletId: '0x0987654321098765432109876543210987654321',
        branch: 'Electrical Engineering',
      },
      {
        name: 'Priya Singh',
        prn: 'STU2024003',
        walletId: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        branch: 'Mechanical Engineering',
      },
      {
        name: 'Aryan Kumar',
        prn: 'STU2024004',
        walletId: '0x111122223333444455556666777788889999aaaa',
        branch: 'Information Technology',
      },
      {
        name: 'Ananya Reddy',
        prn: 'STU2024005',
        walletId: '0xbbbbccccddddeeeeffff00001111222233334444',
        branch: 'Electronics and Communication',
      },
      {
        name: 'Vikram Desai',
        prn: 'STU2024006',
        walletId: '0x55556666777788889999aaaabbbbccccddddeeee',
        branch: 'Civil Engineering',
      },
      {
        name: 'Meera Joshi',
        prn: 'STU2024007',
        walletId: '0xffff000011112222333344445555666677778888',
        branch: 'Computer Science and Engineering',
      },
      {
        name: 'Arjun Mehta',
        prn: 'STU2024008',
        walletId: '0x9999aaaabbbbccccddddeeeeffff000011112222',
        branch: 'Mechanical Engineering',
      },
    ];

    const createdStudents = await Student.insertMany(students);
    console.log(`Created ${createdStudents.length} students`);

    // Create sample transcripts with realistic data
    const transcripts = [
      {
        studentPrn: 'STU2024001',
        studentName: 'Saniya Sharma',
        walletId: '0x1234567890123456789012345678901234567890',
        branch: 'Computer Science and Engineering',
        filename: 'Saniya_Sharma_Transcript_2024.pdf',
        ipfsHash: 'QmSampleHash1ForDemoPurposesOnly',
        ipfsUrl: 'https://gateway.pinata.cloud/ipfs/QmSampleHash1ForDemoPurposesOnly',
        status: 'Verified',
        verifiedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        verifiedBy: 'Tech University',
        uploadedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      },
      {
        studentPrn: 'STU2024001',
        studentName: 'Saniya Sharma',
        walletId: '0x1234567890123456789012345678901234567890',
        branch: 'Computer Science and Engineering',
        filename: 'Saniya_Sharma_Degree_Certificate.pdf',
        ipfsHash: 'QmSampleHash2ForDemoPurposesOnly',
        ipfsUrl: 'https://gateway.pinata.cloud/ipfs/QmSampleHash2ForDemoPurposesOnly',
        status: 'Verified',
        verifiedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        verifiedBy: 'Tech University',
        uploadedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      },
      {
        studentPrn: 'STU2024002',
        studentName: 'Raj Patel',
        walletId: '0x0987654321098765432109876543210987654321',
        branch: 'Electrical Engineering',
        filename: 'Raj_Patel_Transcript_2024.pdf',
        ipfsHash: 'QmSampleHash3ForDemoPurposesOnly',
        ipfsUrl: 'https://gateway.pinata.cloud/ipfs/QmSampleHash3ForDemoPurposesOnly',
        status: 'Verified',
        verifiedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        verifiedBy: 'Tech University',
        uploadedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      },
      {
        studentPrn: 'STU2024003',
        studentName: 'Priya Singh',
        walletId: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        branch: 'Mechanical Engineering',
        filename: 'Priya_Singh_Transcript_2024.pdf',
        ipfsHash: 'QmSampleHash4ForDemoPurposesOnly',
        ipfsUrl: 'https://gateway.pinata.cloud/ipfs/QmSampleHash4ForDemoPurposesOnly',
        status: 'Verified',
        verifiedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        verifiedBy: 'Tech University',
        uploadedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
      },
      {
        studentPrn: 'STU2024004',
        studentName: 'Aryan Kumar',
        walletId: '0x111122223333444455556666777788889999aaaa',
        branch: 'Information Technology',
        filename: 'Aryan_Kumar_Transcript_2024.pdf',
        ipfsHash: 'QmSampleHash5ForDemoPurposesOnly',
        ipfsUrl: 'https://gateway.pinata.cloud/ipfs/QmSampleHash5ForDemoPurposesOnly',
        status: 'Pending',
        uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        studentPrn: 'STU2024005',
        studentName: 'Ananya Reddy',
        walletId: '0xbbbbccccddddeeeeffff00001111222233334444',
        branch: 'Electronics and Communication',
        filename: 'Ananya_Reddy_Transcript_2024.pdf',
        ipfsHash: 'QmSampleHash6ForDemoPurposesOnly',
        ipfsUrl: 'https://gateway.pinata.cloud/ipfs/QmSampleHash6ForDemoPurposesOnly',
        status: 'Verified',
        verifiedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        verifiedBy: 'Tech University',
        uploadedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      },
      {
        studentPrn: 'STU2024006',
        studentName: 'Vikram Desai',
        walletId: '0x55556666777788889999aaaabbbbccccddddeeee',
        branch: 'Civil Engineering',
        filename: 'Vikram_Desai_Transcript_2024.pdf',
        ipfsHash: 'QmSampleHash7ForDemoPurposesOnly',
        ipfsUrl: 'https://gateway.pinata.cloud/ipfs/QmSampleHash7ForDemoPurposesOnly',
        status: 'Pending',
        uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        studentPrn: 'STU2024007',
        studentName: 'Meera Joshi',
        walletId: '0xffff000011112222333344445555666677778888',
        branch: 'Computer Science and Engineering',
        filename: 'Meera_Joshi_Transcript_2024.pdf',
        ipfsHash: 'QmSampleHash8ForDemoPurposesOnly',
        ipfsUrl: 'https://gateway.pinata.cloud/ipfs/QmSampleHash8ForDemoPurposesOnly',
        status: 'Verified',
        verifiedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        verifiedBy: 'Tech University',
        uploadedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      },
    ];

    const createdTranscripts = await Transcript.insertMany(transcripts);
    console.log(`Created ${createdTranscripts.length} transcripts`);

    // Create sample requests with realistic messages
    const requests = [
      {
        studentPrn: 'STU2024003',
        message: 'Please upload my transcript for the academic year 2024. I need it for job applications.',
        requestType: 'Transcript Request',
        status: 'Pending',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        studentPrn: 'STU2024001',
        message: 'Request for verification of degree certificate. Required for higher studies admission.',
        requestType: 'Verification Request',
        status: 'Processed',
        processedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        processedBy: 'Tech University',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        studentPrn: 'STU2024004',
        message: 'I need an updated transcript showing my latest semester results.',
        requestType: 'Transcript Request',
        status: 'Pending',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        studentPrn: 'STU2024006',
        message: 'Please verify my academic transcript for internship application.',
        requestType: 'Verification Request',
        status: 'Pending',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        studentPrn: 'STU2024008',
        message: 'Request for official transcript to be sent to my employer.',
        requestType: 'Transcript Request',
        status: 'Processed',
        processedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        processedBy: 'Tech University',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    ];

    const createdRequests = await Request.insertMany(requests);
    console.log(`Created ${createdRequests.length} requests`);

    console.log('\n✅ Seed data created successfully!');
    console.log('\n📚 Sample Students Created:');
    console.log('1. Saniya Sharma - PRN: STU2024001 - CSE - 2 Verified Transcripts');
    console.log('2. Raj Patel - PRN: STU2024002 - EE - 1 Verified Transcript');
    console.log('3. Priya Singh - PRN: STU2024003 - ME - 1 Verified Transcript');
    console.log('4. Aryan Kumar - PRN: STU2024004 - IT - 1 Pending Transcript');
    console.log('5. Ananya Reddy - PRN: STU2024005 - ECE - 1 Verified Transcript');
    console.log('6. Vikram Desai - PRN: STU2024006 - CE - 1 Pending Transcript');
    console.log('7. Meera Joshi - PRN: STU2024007 - CSE - 1 Verified Transcript');
    console.log('8. Arjun Mehta - PRN: STU2024008 - ME - No Transcripts');
    console.log('\n🔑 Quick Login Demo:');
    console.log('Student Login: Use PRN (e.g., STU2024001) - Any password works');
    console.log('Institution Login: Use any name (e.g., Tech University) - Any password works');
    console.log('\n💡 Tip: Login as STU2024001 (Saniya Sharma) to see 2 verified transcripts!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

