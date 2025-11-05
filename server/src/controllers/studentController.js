import Student from '../models/Student.js';
import Transcript from '../models/Transcript.js';

// Create a new student
export const createStudent = async (req, res) => {
  try {
    const { name, prn, walletId, branch } = req.body;

    if (!name || !prn || !walletId) {
      return res.status(400).json({
        success: false,
        message: 'Name, PRN, and walletId are required',
      });
    }

    // Check if student already exists
    const existingStudent = await Student.findOne({ prn: prn.toUpperCase() });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student with this PRN already exists',
      });
    }

    const student = new Student({
      name,
      prn: prn.toUpperCase(),
      walletId,
      branch,
    });

    await student.save();

    res.status(201).json({
      success: true,
      data: student,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Student with this PRN already exists',
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get student by PRN
export const getStudentByPRN = async (req, res) => {
  try {
    const { prn } = req.params;

    const student = await Student.findOne({ prn: prn.toUpperCase() });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Get transcripts for this student
    const transcripts = await Transcript.find({ studentPrn: prn.toUpperCase() })
      .sort({ uploadedAt: -1 });

    res.json({
      success: true,
      data: {
        ...student.toObject(),
        transcripts,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get student by wallet ID
export const getStudentByWallet = async (req, res) => {
  try {
    const { walletId } = req.query;

    if (!walletId) {
      return res.status(400).json({
        success: false,
        message: 'walletId query parameter is required',
      });
    }

    const student = await Student.findOne({ walletId });
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Get transcripts for this student
    const transcripts = await Transcript.find({ walletId })
      .sort({ uploadedAt: -1 });

    res.json({
      success: true,
      data: {
        ...student.toObject(),
        transcripts,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all students (for admin/search)
export const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

