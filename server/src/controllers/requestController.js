import Request from '../models/Request.js';

// Create a request
export const createRequest = async (req, res) => {
  try {
    const { studentPrn, requestType, message, requestedFor } = req.body;

    if (!studentPrn) {
      return res.status(400).json({
        success: false,
        message: 'studentPrn is required',
      });
    }

    const request = new Request({
      studentPrn: studentPrn.toUpperCase(),
      requestType: requestType || 'Transcript Request',
      message,
      requestedFor,
      status: 'Pending',
    });

    await request.save();

    res.status(201).json({
      success: true,
      data: request,
      message: 'Request created successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all requests
export const getAllRequests = async (req, res) => {
  try {
    const { status } = req.query;
    
    const query = status ? { status } : {};
    const requests = await Request.find(query)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get requests by student PRN
export const getRequestsByStudent = async (req, res) => {
  try {
    const { prn } = req.params;

    const requests = await Request.find({ studentPrn: prn.toUpperCase() })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update request status
export const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, processedBy } = req.body;

    if (!['Pending', 'Processed', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be Pending, Processed, or Rejected',
      });
    }

    const request = await Request.findById(id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    request.status = status;
    request.processedAt = new Date();
    request.processedBy = processedBy || 'Institution';

    await request.save();

    res.json({
      success: true,
      data: request,
      message: 'Request updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


