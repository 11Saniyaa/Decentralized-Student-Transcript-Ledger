const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("StudentTranscriptLedger", function () {
  let transcriptLedger;
  let admin, institution1, institution2, student1, student2, verifier1;
  let INSTITUTION_ROLE, VERIFIER_ROLE;

  beforeEach(async function () {
    [admin, institution1, institution2, student1, student2, verifier1] = await ethers.getSigners();

    const StudentTranscriptLedger = await ethers.getContractFactory("StudentTranscriptLedger");
    transcriptLedger = await StudentTranscriptLedger.deploy();
    await transcriptLedger.waitForDeployment();

    INSTITUTION_ROLE = await transcriptLedger.INSTITUTION_ROLE();
    VERIFIER_ROLE = await transcriptLedger.VERIFIER_ROLE();

    // Register institutions
    await transcriptLedger.registerInstitution("Test University 1", "TU1-ACC-2024", institution1.address);
    await transcriptLedger.registerInstitution("Test University 2", "TU2-ACC-2024", institution2.address);

    // Grant verifier role
    await transcriptLedger.grantRole(VERIFIER_ROLE, verifier1.address);

    // Register students
    await transcriptLedger.connect(student1).registerStudent("Alice Johnson", "ST001");
    await transcriptLedger.connect(student2).registerStudent("Bob Smith", "ST002");
  });

  describe("Contract Deployment", function () {
    it("Should deploy with correct admin role", async function () {
      const DEFAULT_ADMIN_ROLE = await transcriptLedger.DEFAULT_ADMIN_ROLE();
      expect(await transcriptLedger.hasRole(DEFAULT_ADMIN_ROLE, admin.address)).to.be.true;
    });

    it("Should have correct contract address", async function () {
      const contractAddress = await transcriptLedger.getAddress();
      expect(contractAddress).to.properAddress;
    });
  });

  describe("Institution Management", function () {
    it("Should register institution successfully", async function () {
      const institution = await transcriptLedger.getInstitution(1);
      expect(institution.name).to.equal("Test University 1");
      expect(institution.accreditationNumber).to.equal("TU1-ACC-2024");
      expect(institution.institutionAddress).to.equal(institution1.address);
      expect(institution.isActive).to.be.true;
    });

    it("Should grant institution role on registration", async function () {
      expect(await transcriptLedger.hasRole(INSTITUTION_ROLE, institution1.address)).to.be.true;
    });

    it("Should not allow duplicate institution registration", async function () {
      await expect(
        transcriptLedger.registerInstitution("Duplicate University", "DU-ACC-2024", institution1.address)
      ).to.be.revertedWith("Institution already registered");
    });

    it("Should not allow non-admin to register institution", async function () {
      await expect(
        transcriptLedger.connect(student1).registerInstitution("Unauthorized University", "UU-ACC-2024", student1.address)
      ).to.be.reverted;
    });

    describe("Student Registration", function () {
      it("Should register student successfully", async function () {
        const student = await transcriptLedger.students(student1.address);
        expect(student.name).to.equal("Alice Johnson");
        expect(student.studentId).to.equal("ST001");
        expect(student.isRegistered).to.be.true;
      });

      it("Should not allow duplicate student registration", async function () {
        await expect(
          transcriptLedger.connect(student1).registerStudent("Alice Duplicate", "ST001")
        ).to.be.revertedWith("Student already registered");
      });

      it("Should emit StudentRegistered event", async function () {
        await expect(
          transcriptLedger.connect(verifier1).registerStudent("Charlie Brown", "ST003")
        ).to.emit(transcriptLedger, "StudentRegistered")
          .withArgs(verifier1.address, "Charlie Brown");
      });

      it("Should not allow empty name", async function () {
        await expect(
          transcriptLedger.connect(admin).registerStudent("", "ST004")
        ).to.be.revertedWith("Name cannot be empty");
      });

      it("Should not allow empty student ID", async function () {
        await expect(
          transcriptLedger.connect(admin).registerStudent("Test Student", "")
        ).to.be.revertedWith("Student ID cannot be empty");
      });
    });
  });

  describe("Transcript Management", function () {
    let transcriptId;

    beforeEach(async function () {
      const tx = await transcriptLedger.connect(institution1).createTranscript(
        student1.address,
        "Bachelor of Science",
        "Computer Science",
        "QmTest123..."
      );
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => transcriptLedger.interface.parseLog(log)?.name === 'TranscriptCreated');
      transcriptId = transcriptLedger.interface.parseLog(event).args.transcriptId;
    });

    it("Should create transcript successfully", async function () {
      const transcript = await transcriptLedger.getTranscript(transcriptId);
      expect(transcript.studentAddress).to.equal(student1.address);
      expect(transcript.degree).to.equal("Bachelor of Science");
      expect(transcript.major).to.equal("Computer Science");
      expect(transcript.institutionId).to.equal(1n);
      expect(transcript.isVerified).to.be.false;
    });

    it("Should not allow non-institution to create transcript", async function () {
      await expect(
        transcriptLedger.connect(student1).createTranscript(student1.address, "Master of Science", "Data Science", "")
      ).to.be.reverted;
    });

    it("Should not create transcript for unregistered student", async function () {
      await expect(
        transcriptLedger.connect(institution1).createTranscript(verifier1.address, "Bachelor of Arts", "Philosophy", "")
      ).to.be.revertedWith("Student not registered");
    });

    it("Should add transcript to student's list", async function () {
      const transcriptIds = await transcriptLedger.getStudentTranscripts(student1.address);
      expect(transcriptIds.length).to.equal(1);
      expect(transcriptIds[0]).to.equal(transcriptId);
    });

    it("Should emit TranscriptCreated event", async function () {
      await expect(
        transcriptLedger.connect(institution1).createTranscript(student2.address, "Bachelor of Arts", "History", "")
      ).to.emit(transcriptLedger, "TranscriptCreated");
    });
  });

  describe("Course Management", function () {
    let transcriptId;

    beforeEach(async function () {
      const tx = await transcriptLedger.connect(institution1).createTranscript(
        student1.address,
        "Bachelor of Science",
        "Computer Science",
        ""
      );
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => transcriptLedger.interface.parseLog(log)?.name === 'TranscriptCreated');
      transcriptId = transcriptLedger.interface.parseLog(event).args.transcriptId;
    });

    it("Should add course successfully", async function () {
      await transcriptLedger.connect(institution1).addCourse(
        transcriptId, "CS101", "Introduction to Programming", 3, "A", Math.floor(Date.now() / 1000)
      );

      const courses = await transcriptLedger.getTranscriptCourses(transcriptId);
      expect(courses.length).to.equal(1);
      expect(courses[0].courseCode).to.equal("CS101");
      expect(courses[0].courseName).to.equal("Introduction to Programming");
      expect(courses[0].credits).to.equal(3);
      expect(courses[0].grade).to.equal("A");
    });

    it("Should calculate GPA correctly", async function () {
      await transcriptLedger.connect(institution1).addCourse(
        transcriptId, "CS101", "Programming", 3, "A", Math.floor(Date.now() / 1000)
      );
      await transcriptLedger.connect(institution1).addCourse(
        transcriptId, "MATH101", "Calculus", 3, "B", Math.floor(Date.now() / 1000)
      );

      // GPA ×100 = 3.5 × 100 = 350
      const gpa = await transcriptLedger.calculateGPA(transcriptId);
      expect(gpa).to.equal(35000n);
    });

    it("Should return 0 GPA for transcript with no courses", async function () {
      const gpa = await transcriptLedger.calculateGPA(transcriptId);
      expect(gpa).to.equal(0n);
    });
  });

  describe("Verification System", function () {
    let transcriptId;

    beforeEach(async function () {
      const tx = await transcriptLedger.connect(institution1).createTranscript(
        student1.address,
        "Bachelor of Science",
        "Computer Science",
        ""
      );
      const receipt = await tx.wait();
      const event = receipt.logs.find(log => transcriptLedger.interface.parseLog(log)?.name === 'TranscriptCreated');
      transcriptId = transcriptLedger.interface.parseLog(event).args.transcriptId;
    });

    it("Should verify transcript successfully", async function () {
      await transcriptLedger.connect(verifier1).verifyTranscript(transcriptId);
      const transcript = await transcriptLedger.getTranscript(transcriptId);
      expect(transcript.isVerified).to.be.true;
    });

    it("Should emit TranscriptVerified event", async function () {
      await expect(
        transcriptLedger.connect(verifier1).verifyTranscript(transcriptId)
      ).to.emit(transcriptLedger, "TranscriptVerified")
        .withArgs(transcriptId, verifier1.address);
    });
  });

  describe("Access Control", function () {
    it("Should have correct role hierarchy", async function () {
      const DEFAULT_ADMIN_ROLE = await transcriptLedger.DEFAULT_ADMIN_ROLE();
      expect(await transcriptLedger.hasRole(DEFAULT_ADMIN_ROLE, admin.address)).to.be.true;
      expect(await transcriptLedger.hasRole(INSTITUTION_ROLE, institution1.address)).to.be.true;
      expect(await transcriptLedger.hasRole(VERIFIER_ROLE, verifier1.address)).to.be.true;
      expect(await transcriptLedger.hasRole(INSTITUTION_ROLE, student1.address)).to.be.false;
    });
  });

  describe("Statistics", function () {
    it("Should track total transcripts and institutions", async function () {
      const totalInstitutions = await transcriptLedger.getTotalInstitutions();
      expect(totalInstitutions).to.equal(2n);

      await transcriptLedger.connect(institution1).createTranscript(student1.address, "Master of Science", "Data Science", "");
      const totalTranscripts = await transcriptLedger.getTotalTranscripts();
      expect(totalTranscripts).to.equal(1n);
    });

    it("Should check registration status", async function () {
      expect(await transcriptLedger.isRegisteredStudent(student1.address)).to.be.true;
      expect(await transcriptLedger.isRegisteredStudent(admin.address)).to.be.false;
      expect(await transcriptLedger.isRegisteredInstitution(institution1.address)).to.be.true;
      expect(await transcriptLedger.isRegisteredInstitution(student1.address)).to.be.false;
    });
  });

  describe("Edge Cases", function () {
    it("Should handle invalid transcript IDs", async function () {
      await expect(transcriptLedger.getTranscript(999)).to.be.revertedWith("Transcript does not exist");
      await expect(transcriptLedger.connect(verifier1).verifyTranscript(999)).to.be.revertedWith("Transcript does not exist");
    });

    it("Should handle invalid institution IDs", async function () {
      await expect(transcriptLedger.getInstitution(999)).to.be.revertedWith("Institution does not exist");
    });
  });
});
