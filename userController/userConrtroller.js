const bcrypt=require('bcryptjs')
const User = require("../userModel/userModel");


// Register a new user
exports.registerUser = async (req, res) => {
  try {
    const { name, email, phone, address, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({ name, email, phone, address, password });
    await newUser.save();
    const token = await newUser.generateAuthToken();

    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser,token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect password' });

    const token = await user.generateAuthToken();

    // Set cookie and respond with user data
    res.cookie('jwtoken', token, {
      expires: new Date(Date.now() + 25892000000),
      httpOnly: true,
    });

    // Emit login event to the socket server
    res.status(200).json({ message: 'Login successful', user, token, socketId: user._id }); // Include user ID in the response
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Get all users with filtering, sorting, and pagination
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 5, sortBy = 'name', sortOrder = 'asc', filter = '' } = req.query;
    
 
    const skip = (page - 1) * limit;


    const sortCriteria = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

   
    const filterCriteria = {
      $or: [
        { name: new RegExp(filter, 'i') },
        { email: new RegExp(filter, 'i') },
        { phone: new RegExp(filter, 'i') },
      ],
      isDeleted: false, 
    };

   
    const users = await User.find(filterCriteria)
      .sort(sortCriteria)
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    
    const totalUsers = await User.countDocuments(filterCriteria);

    res.status(200).json({
      users,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update a user by ID
exports.updateUser = async (req, res) => {
  try {
    const { name, email, phone, address, password } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, address, password },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Soft delete a user by ID
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ message: "User deleted (soft delete) successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }


};


exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.user._id;

    const newMessage = {
      sender: senderId,
      receiver: receiverId,
      message,
    };

    console.log('New Message:', newMessage); 

    await User.updateOne({ _id: senderId }, { $push: { messages: newMessage } });
    await User.updateOne({ _id: receiverId }, { $push: { messages: newMessage } });

    res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId)
      .populate('messages.sender')  
      .populate('messages.receiver');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const messages = user.messages.map(msg => ({
      sender: {
        name: msg.sender.name,
        profileImage: msg.sender.profileImage,
      },
      message: msg.message,
      timestamp: msg.timestamp
    }));

    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
  


