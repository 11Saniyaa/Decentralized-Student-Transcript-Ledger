const hre = require("hardhat");

async function main() {
  console.log("🔧 Setting up deployed contract...\n");

  // Load deployment info
  const fs = require('fs');
  const path = require('path');
  const deploymentFile = path.join(__dirname, '..', 'deployments', `${hre.network.name}-deployment.json`);
  
  let deploymentInfo;
  try {
    deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  } catch (error) {
    console.log("❌ No deployment found. Please run deployment first.");
    return;
  }

  console.log("📋 Contract Address:", deploymentInfo.contractAddress);

  // Get signers
  const [admin, institution1, institution2, verifier, student1, student2] = await hre.ethers.getSigners();
  
  // Connect to deployed contract
  const StudentTranscriptLedger = await hre.ethers.getContractFactory("StudentTranscriptLedger");
  const contract = StudentTranscriptLedger.attach(deploymentInfo.contractAddress);

  console.log("👥 Setup Participants:");
  console.log(`Admin: ${admin.address}`);
  console.log(`Institution 1: ${institution1.address}`);
  console.log(`Institution 2: ${institution2.address}`);
  console.log(`Verifier: ${verifier.address}`);
  console.log(`Student 1: ${student1.address}`);
  console.log(`Student 2: ${student2.address}\n`);

  try {
    // Step 1: Register institutions
    console.log("🏫 Step 1: Registering institutions...");
    
    try {
      const tx1 = await contract.registerInstitution(
        "Massachusetts Institute of Technology",
        "MIT-ACC-2024-001",
        institution1.address,
        { gasLimit: 250000 }
      );
      await tx1.wait();
      console.log("✅ MIT registered");
    } catch (error) {
      console.log("⚠️  MIT might already be registered:", error.message);
    }

    try {
      const tx2 = await contract.registerInstitution(
        "Stanford University",
        "STAN-ACC-2024-002",
        institution2.address,
        { gasLimit: 250000 }
      );
      await tx2.wait();
      console.log("✅ Stanford registered");
    } catch (error) {
      console.log("⚠️  Stanford might already be registered:", error.message);
    }

    // Step 2: Grant verifier role
    console.log("\n🔍 Step 2: Setting up verifier...");
    try {
      const VERIFIER_ROLE = await contract.VERIFIER_ROLE();
      const tx3 = await contract.grantRole(VERIFIER_ROLE, verifier.address, {
        gasLimit: 100000
      });
      await tx3.wait();
      console.log("✅ Verifier role granted");
    } catch (error) {
      console.log("⚠️  Verifier might already have role:", error.message);
    }

    // Step 3: Register students
    console.log("\n👨‍🎓 Step 3: Registering students...");
    
    try {
      const tx4 = await contract.connect(student1).registerStudent(
        "Alice Johnson",
        "ST2024001",
        { gasLimit: 150000 }
      );
      await tx4.wait();
      console.log("✅ Alice registered");
    } catch (error) {
      console.log("⚠️  Alice might already be registered:", error.message);
    }

    try {
      const tx5 = await contract.connect(student2).registerStudent(
        "Bob Smith",
        "ST2024002",
        { gasLimit: 150000 }
      );
      await tx5.wait();
      console.log("✅ Bob registered");
    } catch (error) {
      console.log("⚠️  Bob might already be registered:", error.message);
    }

    // Step 4: Create sample transcript
    console.log("\n📄 Step 4: Creating sample transcript...");
    let transcriptId;
    
    try {
      const tx6 = await contract.connect(institution1).createTranscript(
        student1.address,
        "Bachelor of Science",
        "Computer Science",
        "QmSampleIPFSHash123...",
        { gasLimit: 300000 }
      );
      const receipt6 = await tx6.wait();
      
      // Extract transcript ID from event
      const transcriptCreatedEvent = receipt6.logs.find(log => {
        try {
          const parsedLog = contract.interface.parseLog(log);
          return parsedLog && parsedLog.name === 'TranscriptCreated';
        } catch {
          return false;
        }
      });
      
      if (transcriptCreatedEvent) {
        transcriptId = contract.interface.parseLog(transcriptCreatedEvent).args.transcriptId;
        console.log("✅ Sample transcript created with ID:", transcriptId.toString());
      } else {
        console.log("⚠️  Could not extract transcript ID from event");
        // Try to get the latest transcript ID
        const totalTranscripts = await contract.getTotalTranscripts();
        transcriptId = totalTranscripts;
        console.log("🔍 Using transcript ID:", transcriptId.toString());
      }
    } catch (error) {
      console.log("❌ Failed to create transcript:", error.message);
      return;
    }

    // Step 5: Add courses (one by one to avoid gas issues)
    console.log("\n📚 Step 5: Adding courses...");
    const courses = [
      { code: "CS101", name: "Introduction to Programming", credits: 3, grade: "A" },
      { code: "MATH201", name: "Calculus II", credits: 4, grade: "B+" },
      { code: "CS201", name: "Data Structures", credits: 3, grade: "A-" },
      { code: "ENG101", name: "English Composition", credits: 3, grade: "B" }
    ];

    for (let i = 0; i < courses.length; i++) {
      const course = courses[i];
      try {
        console.log(`  Adding course ${i + 1}/${courses.length}: ${course.code}...`);
        
        const tx = await contract.connect(institution1).addCourse(
          transcriptId,
          course.code,
          course.name,
          course.credits,
          course.grade,
          Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 365 * 24 * 3600),
          { gasLimit: 250000 }
        );
        await tx.wait();
        console.log(`  ✅ Added ${course.code}: ${course.name} (Grade: ${course.grade})`);
        
        // Small delay to avoid nonce issues
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.log(`  ❌ Failed to add ${course.code}:`, error.message);
      }
    }

    // Step 6: Set graduation date
    console.log("\n🎓 Step 6: Setting graduation date...");
    try {
      const graduationDate = Math.floor(new Date("2024-05-15").getTime() / 1000);
      const tx7 = await contract.connect(institution1).setGraduationDate(
        transcriptId,
        graduationDate,
        { gasLimit: 100000 }
      );
      await tx7.wait();
      console.log("✅ Graduation date set to May 15, 2024");
    } catch (error) {
      console.log("❌ Failed to set graduation date:", error.message);
    }

    // Step 7: Calculate GPA
    console.log("\n📊 Step 7: Calculating GPA...");
    try {
      const gpa = await contract.calculateGPA(transcriptId);
      console.log("📊 Calculated GPA:", (Number(gpa) / 100).toFixed(2));
    } catch (error) {
      console.log("❌ Failed to calculate GPA:", error.message);
    }

    // Step 8: Verify transcript
    console.log("\n✅ Step 8: Verifying transcript...");
    try {
      const tx8 = await contract.connect(verifier).verifyTranscript(
        transcriptId,
        { gasLimit: 100000 }
      );
      await tx8.wait();
      console.log("✅ Transcript verified");
    } catch (error) {
      console.log("❌ Failed to verify transcript:", error.message);
    }

    // Final statistics
    console.log("\n📊 Final Statistics:");
    try {
      const totalTranscripts = await contract.getTotalTranscripts();
      const totalInstitutions = await contract.getTotalInstitutions();
      
      console.log("Total Transcripts:", totalTranscripts.toString());
      console.log("Total Institutions:", totalInstitutions.toString());
    } catch (error) {
      console.log("❌ Failed to get statistics:", error.message);
    }

    // Update deployment info
    const updatedDeploymentInfo = {
      ...deploymentInfo,
      institution1: institution1.address,
      institution2: institution2.address,
      verifier: verifier.address,
      student1: student1.address,
      student2: student2.address,
      sampleTranscriptId: transcriptId ? transcriptId.toString() : "unknown",
      setupComplete: true,
      setupTime: new Date().toISOString()
    };

    fs.writeFileSync(deploymentFile, JSON.stringify(updatedDeploymentInfo, null, 2));
    console.log("\n💾 Deployment info updated");
    console.log("\n🎉 Setup completed successfully!");

  } catch (error) {
    console.error("❌ Setup failed:", error);
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