const hre = require("hardhat");

async function main() {
  console.log("🎓 Deploying Student Transcript Ledger...\n");

  // Get signers
  const [deployer, institution1, institution2, verifier, student1, student2] = await hre.ethers.getSigners();
  
  console.log("📋 Deployment Details:");
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH");
  console.log("Network:", hre.network.name);
  console.log("Chain ID:", (await hre.ethers.provider.getNetwork()).chainId.toString());

  // Deploy the contract
  console.log("\n🚀 Deploying contract...");
  const StudentTranscriptLedger = await hre.ethers.getContractFactory("StudentTranscriptLedger");
  const transcriptLedger = await StudentTranscriptLedger.deploy();
  
  await transcriptLedger.waitForDeployment();
  const contractAddress = await transcriptLedger.getAddress();
  
  console.log("✅ StudentTranscriptLedger deployed to:", contractAddress);

  // Wait for block confirmations on testnets/mainnet
  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
    console.log("⏳ Waiting for block confirmations...");
    await transcriptLedger.deploymentTransaction().wait(5);
  }

  console.log("\n🏫 Setting up test institutions...");
  
  try {
    // Register MIT
    const tx1 = await transcriptLedger.registerInstitution(
      "Massachusetts Institute of Technology",
      "MIT-ACC-2024-001",
      institution1.address
    );
    await tx1.wait();
    console.log("✅ MIT registered with address:", institution1.address);

    // Register Stanford
    const tx2 = await transcriptLedger.registerInstitution(
      "Stanford University", 
      "STAN-ACC-2024-002",
      institution2.address
    );
    await tx2.wait();
    console.log("✅ Stanford registered with address:", institution2.address);

    // Grant verifier role
    console.log("\n🔍 Setting up verifiers...");
    const VERIFIER_ROLE = await transcriptLedger.VERIFIER_ROLE();
    const tx3 = await transcriptLedger.grantRole(VERIFIER_ROLE, verifier.address);
    await tx3.wait();
    console.log("✅ Verifier role granted to:", verifier.address);

    // Register test students
    console.log("\n👨‍🎓 Registering test students...");
    const tx4 = await transcriptLedger.connect(student1).registerStudent(
      "Alice Johnson", 
      "ST2024001",
      "Computer Science",
      "alice@example.com"
    );
    await tx4.wait();
    console.log("✅ Student Alice Johnson registered:", student1.address);

    const tx5 = await transcriptLedger.connect(student2).registerStudent(
      "Bob Smith", 
      "ST2024002",
      "Electrical",
      "+1-555-0102"
    );
    await tx5.wait();
    console.log("✅ Student Bob Smith registered:", student2.address);

    // Create sample transcript
    console.log("\n📄 Creating sample transcript...");
    const tx6 = await transcriptLedger.connect(institution1).createTranscript(
      student1.address,
      "Bachelor of Science",
      "Computer Science",
      "Sem 8",
      "QmbmvmYmPtyFtUL8DxvfGyBjBBWryf4fgH8eYcVSJDooMc"
    );
    const receipt6 = await tx6.wait();
    
    // Extract transcript ID from event
    const transcriptCreatedEvent = receipt6.logs.find(
      log => {
        try {
          const parsedLog = transcriptLedger.interface.parseLog(log);
          return parsedLog && parsedLog.name === 'TranscriptCreated';
        } catch {
          return false;
        }
      }
    );
    
    if (!transcriptCreatedEvent) {
      throw new Error("TranscriptCreated event not found");
    }
    
    const transcriptId = transcriptLedger.interface.parseLog(transcriptCreatedEvent).args.transcriptId;
    console.log("✅ Sample transcript created with ID:", transcriptId.toString());

    // Add sample courses
    console.log("\n📚 Adding sample courses...");
    const courses = [
      { code: "CS101", name: "Introduction to Programming", credits: 3, grade: "A" },
      { code: "MATH201", name: "Calculus II", credits: 4, grade: "B+" },
      { code: "CS201", name: "Data Structures", credits: 3, grade: "A-" },
      { code: "ENG101", name: "English Composition", credits: 3, grade: "B" }
    ];

    for (const course of courses) {
      const tx = await transcriptLedger.connect(institution1).addCourse(
        transcriptId,
        course.code,
        course.name,
        course.credits,
        course.grade,
        Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 365 * 24 * 3600) // Random past date
      );
      await tx.wait();
      console.log(`  ✅ Added ${course.code}: ${course.name} (Grade: ${course.grade})`);
    }

    // Set graduation date
    const graduationDate = Math.floor(new Date("2024-05-15").getTime() / 1000);
    const tx7 = await transcriptLedger.connect(institution1).setGraduationDate(
      transcriptId, 
      graduationDate
    );
    await tx7.wait();
    console.log("✅ Graduation date set to May 15, 2024");

    // Calculate GPA
    const gpa = await transcriptLedger.calculateGPA(transcriptId);
    console.log("📊 Calculated GPA:", (Number(gpa) / 100).toFixed(2));

    // Verify transcript
    const tx8 = await transcriptLedger.connect(verifier).verifyTranscript(transcriptId);
    await tx8.wait();
    console.log("✅ Transcript verified by:", verifier.address);

    // Display final statistics
    console.log("\n📊 Final Statistics:");
    const totalTranscripts = await transcriptLedger.getTotalTranscripts();
    const totalInstitutions = await transcriptLedger.getTotalInstitutions();
    
    console.log("Total Transcripts:", totalTranscripts.toString());
    console.log("Total Institutions:", totalInstitutions.toString());

    console.log("\n🎉 Deployment completed successfully!");
    
    // Save deployment info
    const deploymentInfo = {
      network: hre.network.name,
      contractAddress: contractAddress,
      deployer: deployer.address,
      institution1: institution1.address,
      institution2: institution2.address,
      verifier: verifier.address,
      student1: student1.address,
      student2: student2.address,
      sampleTranscriptId: transcriptId.toString(),
      deploymentTime: new Date().toISOString(),
      blockNumber: await hre.ethers.provider.getBlockNumber()
    };

    console.log("\n📋 Deployment Summary:");
    console.log(JSON.stringify(deploymentInfo, null, 2));

    // Write deployment info to file
    const fs = require('fs');
    const path = require('path');
    
    const deploymentsDir = path.join(__dirname, '..', 'deployments');
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    const deploymentFile = path.join(deploymentsDir, `${hre.network.name}-deployment.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log(`\n💾 Deployment info saved to: ${deploymentFile}`);

    return deploymentInfo;

  } catch (error) {
    console.error("❌ Error during setup:", error.message);
    console.log("✅ Contract deployed successfully, but setup incomplete");
    console.log("Contract address:", contractAddress);
    
    // Still save basic deployment info
    const basicDeploymentInfo = {
      network: hre.network.name,
      contractAddress: contractAddress,
      deployer: deployer.address,
      deploymentTime: new Date().toISOString(),
      blockNumber: await hre.ethers.provider.getBlockNumber(),
      setupComplete: false
    };

    const fs = require('fs');
    const path = require('path');
    const deploymentsDir = path.join(__dirname, '..', 'deployments');
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    const deploymentFile = path.join(deploymentsDir, `${hre.network.name}-deployment.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(basicDeploymentInfo, null, 2));

    return basicDeploymentInfo;
  }
}

// Handle both direct execution and module import
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Deployment failed:");
      console.error(error);
      process.exit(1);
    });
}

module.exports = main;