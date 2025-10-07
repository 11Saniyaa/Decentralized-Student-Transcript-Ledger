const hre = require("hardhat");

async function main() {
  console.log("🎓 Student Transcript Ledger - Interactive Demo\n");

  // Load deployment info
  const fs = require('fs');
  const path = require('path');
  const deploymentFile = path.join(__dirname, '..', 'deployments', `${hre.network.name}-deployment.json`);
  
  let deploymentInfo;
  try {
    deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  } catch (error) {
    console.log("❌ No deployment found. Please run deployment first:");
    console.log("npx hardhat run scripts/deploy.js --network localhost");
    return;
  }

  console.log("📋 Using deployed contract:");
  console.log("Contract Address:", deploymentInfo.contractAddress);
  console.log("Network:", deploymentInfo.network);
  console.log("Deployed at:", deploymentInfo.deploymentTime, "\n");

  // Get signers
  const [admin, institution1, institution2, verifier, student1, student2] = await hre.ethers.getSigners();
  
  // Connect to deployed contract
  const StudentTranscriptLedger = await hre.ethers.getContractFactory("StudentTranscriptLedger");
  const contract = StudentTranscriptLedger.attach(deploymentInfo.contractAddress);

  console.log("👥 Demo Participants:");
  console.log(`Admin: ${admin.address}`);
  console.log(`Institution 1 (MIT): ${institution1.address}`);
  console.log(`Institution 2 (Stanford): ${institution2.address}`);
  console.log(`Verifier: ${verifier.address}`);
  console.log(`Student 1 (Alice): ${student1.address}`);
  console.log(`Student 2 (Bob): ${student2.address}\n`);

  try {
    // Register institutions
    console.log("ℹ️ Registering institutions...");
    await contract.connect(admin).registerInstitution(institution1.address, "MIT", "MIT-001");
    await contract.connect(admin).registerInstitution(institution2.address, "Stanford University", "STAN-001");
    console.log("✅ Institutions registered\n");

    // Register students
    console.log("ℹ️ Registering students...");
    await contract.connect(admin).registerStudent(student1.address, "Alice Smith", "ALICE001");
    await contract.connect(admin).registerStudent(student2.address, "Bob Smith", "BOB001");
    console.log("✅ Students registered\n");

    // Demo 1: View existing transcript (create sample if none)
    console.log("📄 Demo 1: Viewing Existing Transcript");
    console.log("=".repeat(50));

    let sampleTranscriptId = deploymentInfo.sampleTranscriptId;
    let transcriptExists = false;
    if (!sampleTranscriptId) {
      console.log("ℹ️ No sample transcript found, creating one for demo...");
      const tx = await contract.connect(institution1).createTranscript(
        student1.address,
        "Bachelor of Science",
        "Computer Science",
        "QmSampleTranscriptIPFS123..."
      );
      const receipt = await tx.wait();
      const event = receipt.events.find(e => e.event === 'TranscriptCreated');
      sampleTranscriptId = event.args.transcriptId;
      transcriptExists = true;
    }

    const transcript = await contract.getTranscript(sampleTranscriptId);
    const courses = await contract.getTranscriptCourses(sampleTranscriptId);
    const gpa = await contract.calculateGPA(sampleTranscriptId);
    const institution = await contract.getInstitution(transcript.institutionId);

    console.log(`📋 Transcript ID: ${sampleTranscriptId}`);
    console.log(`🎓 Degree: ${transcript.degree} in ${transcript.major}`);
    console.log(`🏫 Institution: ${institution.name}`);
    console.log(`👨‍🎓 Student: ${transcript.studentAddress}`);
    console.log(`📊 GPA: ${(Number(gpa) / 100).toFixed(2)}`);
    console.log(`✅ Verified: ${transcript.isVerified ? 'Yes' : 'No'}`);
    console.log(`📚 Total Courses: ${courses.length}\n`);

    // Demo 2: Create new transcript for Bob
    console.log("\n🆕 Demo 2: Creating New Transcript for Bob");
    console.log("=".repeat(50));

    const tx1 = await contract.connect(institution2).createTranscript(
      student2.address,
      "Master of Science",
      "Artificial Intelligence",
      "QmNewTranscriptIPFS456..."
    );
    const receipt1 = await tx1.wait();
    const transcriptCreatedEvent = receipt1.events.find(e => e.event === 'TranscriptCreated');
    const newTranscriptId = transcriptCreatedEvent.args.transcriptId;

    console.log(`✅ New transcript created with ID: ${newTranscriptId}`);
    console.log(`🏫 Institution: Stanford University`);
    console.log(`👨‍🎓 Student: Bob Smith (${student2.address})`);

    // Demo 3: Add courses to Bob's transcript
    console.log("\n📚 Demo 3: Adding Courses to Bob's Transcript");
    console.log("=".repeat(50));

    const aiCourses = [
      { code: "AI601", name: "Machine Learning Fundamentals", credits: 4, grade: "A" },
      { code: "AI602", name: "Deep Learning", credits: 3, grade: "A-" },
      { code: "AI603", name: "Natural Language Processing", credits: 3, grade: "B+" },
      { code: "AI604", name: "Computer Vision", credits: 4, grade: "A" },
      { code: "STAT501", name: "Advanced Statistics", credits: 3, grade: "B" }
    ];

    for (const course of aiCourses) {
      const completionDate = Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 180 * 24 * 3600);
      const tx = await contract.connect(institution2).addCourse(
        newTranscriptId,
        course.code,
        course.name,
        course.credits,
        course.grade,
        completionDate
      );
      await tx.wait();
      console.log(`  ✅ Added ${course.code}: ${course.name} (${course.credits} credits, Grade: ${course.grade})`);
    }

    // Set graduation date
    const futureGraduation = Math.floor(new Date("2025-12-15").getTime() / 1000);
    const tx2 = await contract.connect(institution2).setGraduationDate(newTranscriptId, futureGraduation);
    await tx2.wait();
    console.log("🎓 Graduation date set to December 15, 2025");

    // Calculate GPA
    const bobGPA = await contract.calculateGPA(newTranscriptId);
    console.log(`📊 Calculated GPA: ${(Number(bobGPA) / 100).toFixed(2)}`);

    console.log("\n🎉 Demo Completed Successfully!");

  } catch (error) {
    console.error("❌ Demo failed:");
    console.error(error);
    process.exit(1);
  }
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = main;
