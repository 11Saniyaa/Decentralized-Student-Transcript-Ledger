// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title StudentTranscriptLedger
 * @dev Decentralized system for managing academic transcripts and credentials
 * @author Student Transcript Ledger Team
 */
contract StudentTranscriptLedger is AccessControl, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    // Roles
    bytes32 public constant INSTITUTION_ROLE = keccak256("INSTITUTION_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    
    // Counters
    Counters.Counter private _transcriptIds;
    Counters.Counter private _institutionIds;
    
    // Structs
    struct Institution {
        uint256 id;
        string name;
        string accreditationNumber;
        address institutionAddress;
        bool isActive;
        uint256 createdAt;
    }
    
    struct Course {
        string courseCode;
        string courseName;
        uint8 credits;
        string grade;
        uint256 completionDate;
    }
    
    struct Transcript {
        uint256 id;
        address studentAddress;
        uint256 institutionId;
        string degree;
        string major;
        string semester;
        Course[] courses;
        uint256 graduationDate;
        string ipfsHash; // For storing additional documents
        bool isVerified;
        uint256 createdAt;
        uint256 updatedAt;
    }
    
    struct Student {
        address studentAddress;
        string name;
        string studentId;
        string branch;
        string contact;
        uint256[] transcriptIds;
        bool isRegistered;
        uint256 registrationDate;
    }
    
    // Mappings
    mapping(uint256 => Institution) public institutions;
    mapping(address => uint256) public institutionAddressToId;
    mapping(uint256 => Transcript) public transcripts;
    mapping(address => Student) public students;
    address[] private studentAddresses;
    mapping(string => address) private studentIdToAddress;
    mapping(bytes32 => bool) public usedSignatures;
    
    // Events
    event InstitutionRegistered(uint256 indexed institutionId, string name, address institutionAddress);
    event StudentRegistered(address indexed studentAddress, string name);
    event TranscriptCreated(uint256 indexed transcriptId, address indexed studentAddress, uint256 indexed institutionId);
    event TranscriptVerified(uint256 indexed transcriptId, address indexed verifier);
    event CourseAdded(uint256 indexed transcriptId, string courseCode, string grade);
    event GraduationDateSet(uint256 indexed transcriptId, uint256 graduationDate);
    
    /**
     * @dev Constructor sets up initial roles
     */
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }
    
    // Institution Management
    
    /**
     * @dev Register a new educational institution
     */
    function registerInstitution(
        string memory _name,
        string memory _accreditationNumber,
        address _institutionAddress
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_institutionAddress != address(0), "Invalid institution address");
        require(institutionAddressToId[_institutionAddress] == 0, "Institution already registered");
        require(bytes(_name).length > 0, "Institution name required");
        require(bytes(_accreditationNumber).length > 0, "Accreditation number required");
        
        _institutionIds.increment();
        uint256 institutionId = _institutionIds.current();
        
        institutions[institutionId] = Institution({
            id: institutionId,
            name: _name,
            accreditationNumber: _accreditationNumber,
            institutionAddress: _institutionAddress,
            isActive: true,
            createdAt: block.timestamp
        });
        
        institutionAddressToId[_institutionAddress] = institutionId;
        _grantRole(INSTITUTION_ROLE, _institutionAddress);
        
        emit InstitutionRegistered(institutionId, _name, _institutionAddress);
    }
    
    /**
     * @dev Deactivate an institution
     */
    function deactivateInstitution(uint256 _institutionId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_institutionId > 0 && _institutionId <= _institutionIds.current(), "Invalid institution ID");
        institutions[_institutionId].isActive = false;
    }
    
    // Student Management
    
    /**
     * @dev Register a new student
     */
    function registerStudent(string memory _name, string memory _studentId, string memory _branch, string memory _contact) external {
        require(!students[msg.sender].isRegistered, "Student already registered");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_studentId).length > 0, "Student ID cannot be empty");
        require(studentIdToAddress[_studentId] == address(0), "Student ID already used");
        require(bytes(_branch).length > 0, "Branch required");
        require(bytes(_contact).length > 0, "Contact required");
        
        students[msg.sender] = Student({
            studentAddress: msg.sender,
            name: _name,
            studentId: _studentId,
            branch: _branch,
            contact: _contact,
            transcriptIds: new uint256[](0),
            isRegistered: true,
            registrationDate: block.timestamp
        });
        studentIdToAddress[_studentId] = msg.sender;
        studentAddresses.push(msg.sender);
        
        emit StudentRegistered(msg.sender, _name);
    }
    
    // Transcript Management
    
    /**
     * @dev Create a new academic transcript
     */
    function createTranscript(
        address _studentAddress,
        string memory _degree,
        string memory _major,
        string memory _semester,
        string memory _ipfsHash
    ) external onlyRole(INSTITUTION_ROLE) nonReentrant returns (uint256) {
        require(students[_studentAddress].isRegistered, "Student not registered");
        require(bytes(_degree).length > 0, "Degree cannot be empty");
        require(bytes(_major).length > 0, "Major cannot be empty");
        require(bytes(_semester).length > 0, "Semester cannot be empty");
        
        uint256 institutionId = institutionAddressToId[msg.sender];
        require(institutions[institutionId].isActive, "Institution not active");
        
        _transcriptIds.increment();
        uint256 transcriptId = _transcriptIds.current();
        
        // Create transcript with empty courses array
        transcripts[transcriptId] = Transcript({
            id: transcriptId,
            studentAddress: _studentAddress,
            institutionId: institutionId,
            degree: _degree,
            major: _major,
            semester: _semester,
            courses: new Course[](0),
            graduationDate: 0,
            ipfsHash: _ipfsHash,
            isVerified: false,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });
        
        // Add to student's transcript list
        students[_studentAddress].transcriptIds.push(transcriptId);
        
        emit TranscriptCreated(transcriptId, _studentAddress, institutionId);
        return transcriptId;
    }
    
    /**
     * @dev Add a course to an existing transcript
     */
    function addCourse(
        uint256 _transcriptId,
        string memory _courseCode,
        string memory _courseName,
        uint8 _credits,
        string memory _grade,
        uint256 _completionDate
    ) external onlyRole(INSTITUTION_ROLE) {
        require(_transcriptId > 0 && _transcriptId <= _transcriptIds.current(), "Transcript does not exist");
        require(transcripts[_transcriptId].institutionId == institutionAddressToId[msg.sender], "Unauthorized");
        require(bytes(_courseCode).length > 0, "Course code required");
        require(bytes(_courseName).length > 0, "Course name required");
        require(_credits > 0, "Credits must be positive");
        require(bytes(_grade).length > 0, "Grade required");
        require(_completionDate > 0, "Valid completion date required");
        
        Course memory newCourse = Course({
            courseCode: _courseCode,
            courseName: _courseName,
            credits: _credits,
            grade: _grade,
            completionDate: _completionDate
        });
        
        transcripts[_transcriptId].courses.push(newCourse);
        transcripts[_transcriptId].updatedAt = block.timestamp;
        
        emit CourseAdded(_transcriptId, _courseCode, _grade);
    }
    
    /**
     * @dev Set graduation date for a transcript
     */
    function setGraduationDate(uint256 _transcriptId, uint256 _graduationDate) 
        external onlyRole(INSTITUTION_ROLE) {
        require(_transcriptId > 0 && _transcriptId <= _transcriptIds.current(), "Transcript does not exist");
        require(transcripts[_transcriptId].institutionId == institutionAddressToId[msg.sender], "Unauthorized");
        require(_graduationDate > 0, "Valid graduation date required");
        
        transcripts[_transcriptId].graduationDate = _graduationDate;
        transcripts[_transcriptId].updatedAt = block.timestamp;
        
        emit GraduationDateSet(_transcriptId, _graduationDate);
    }
    
    /**
     * @dev Verify a transcript's authenticity
     */
    function verifyTranscript(uint256 _transcriptId) external onlyRole(VERIFIER_ROLE) {
        require(_transcriptId > 0 && _transcriptId <= _transcriptIds.current(), "Transcript does not exist");
        
        transcripts[_transcriptId].isVerified = true;
        transcripts[_transcriptId].updatedAt = block.timestamp;
        
        emit TranscriptVerified(_transcriptId, msg.sender);
    }
    
    // View Functions
    
    /**
     * @dev Get complete transcript information
     */
    function getTranscript(uint256 _transcriptId) external view returns (Transcript memory) {
        require(_transcriptId > 0 && _transcriptId <= _transcriptIds.current(), "Transcript does not exist");
        return transcripts[_transcriptId];
    }
    
    /**
     * @dev Get all transcript IDs for a student
     */
    function getStudentTranscripts(address _studentAddress) external view returns (uint256[] memory) {
        return students[_studentAddress].transcriptIds;
    }

    function getStudentAddressById(string memory _studentId) external view returns (address) {
        return studentIdToAddress[_studentId];
    }

    function getStudentById(string memory _studentId) external view returns (Student memory) {
        address addr = studentIdToAddress[_studentId];
        return students[addr];
    }

    function getStudentByAddress(address _studentAddress) external view returns (Student memory) {
        return students[_studentAddress];
    }

    function getTotalStudents() external view returns (uint256) {
        return studentAddresses.length;
    }

    function getStudentAt(uint256 index) external view returns (Student memory) {
        require(index < studentAddresses.length, "Index out of bounds");
        return students[studentAddresses[index]];
    }
    
    /**
     * @dev Get all courses for a specific transcript
     */
    function getTranscriptCourses(uint256 _transcriptId) external view returns (Course[] memory) {
        require(_transcriptId > 0 && _transcriptId <= _transcriptIds.current(), "Transcript does not exist");
        return transcripts[_transcriptId].courses;
    }
    
    /**
     * @dev Get institution information
     */
    function getInstitution(uint256 _institutionId) external view returns (Institution memory) {
        require(_institutionId > 0 && _institutionId <= _institutionIds.current(), "Institution does not exist");
        return institutions[_institutionId];
    }
    
    /**
     * @dev Calculate GPA for a transcript
     */
    function calculateGPA(uint256 _transcriptId) external view returns (uint256) {
        require(_transcriptId > 0 && _transcriptId <= _transcriptIds.current(), "Transcript does not exist");
        
        Course[] memory courses = transcripts[_transcriptId].courses;
        if (courses.length == 0) return 0;
        
        uint256 totalPoints = 0;
        uint256 totalCredits = 0;
        
        for (uint i = 0; i < courses.length; i++) {
            uint256 gradePoint = convertGradeToPoints(courses[i].grade);
            totalPoints += gradePoint * courses[i].credits;
            totalCredits += courses[i].credits;
        }
        
        return totalCredits > 0 ? (totalPoints * 100) / totalCredits : 0;
    }
    
    /**
     * @dev Convert letter grade to grade points
     */
    function convertGradeToPoints(string memory _grade) internal pure returns (uint256) {
        bytes32 gradeHash = keccak256(abi.encodePacked(_grade));
        
        if (gradeHash == keccak256(abi.encodePacked("A+"))) return 400;
        if (gradeHash == keccak256(abi.encodePacked("A"))) return 400;
        if (gradeHash == keccak256(abi.encodePacked("A-"))) return 367;
        if (gradeHash == keccak256(abi.encodePacked("B+"))) return 333;
        if (gradeHash == keccak256(abi.encodePacked("B"))) return 300;
        if (gradeHash == keccak256(abi.encodePacked("B-"))) return 267;
        if (gradeHash == keccak256(abi.encodePacked("C+"))) return 233;
        if (gradeHash == keccak256(abi.encodePacked("C"))) return 200;
        if (gradeHash == keccak256(abi.encodePacked("C-"))) return 167;
        if (gradeHash == keccak256(abi.encodePacked("D+"))) return 133;
        if (gradeHash == keccak256(abi.encodePacked("D"))) return 100;
        if (gradeHash == keccak256(abi.encodePacked("D-"))) return 67;
        if (gradeHash == keccak256(abi.encodePacked("F"))) return 0;
        
        return 0; // Default for unknown grades
    }
    
    // Statistics Functions
    
    function getTotalTranscripts() external view returns (uint256) {
        return _transcriptIds.current();
    }
    
    function getTotalInstitutions() external view returns (uint256) {
        return _institutionIds.current();
    }
    
    function isRegisteredStudent(address _studentAddress) external view returns (bool) {
        return students[_studentAddress].isRegistered;
    }
    
    function isRegisteredInstitution(address _institutionAddress) external view returns (bool) {
        uint256 institutionId = institutionAddressToId[_institutionAddress];
        return institutionId > 0 && institutions[institutionId].isActive;
    }
}