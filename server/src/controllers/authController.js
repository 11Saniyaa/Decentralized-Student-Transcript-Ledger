// Simple auth controller - no password validation
export const login = async (req, res) => {
  try {
    const { role, identifier, password } = req.body;

    if (!role || !identifier) {
      return res.status(400).json({
        success: false,
        message: 'Role and identifier are required',
      });
    }

    // No password validation - accept any password
    // Just return success with role and identifier
    res.json({
      success: true,
      role,
      identifier,
      message: 'Login successful',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

