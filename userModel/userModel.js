const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt=require('jsonwebtoken')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
  address: [{ type: String }],
  password: {
    type: String,
    required: true, 
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  profileImage: { type: String },
  messages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  }],
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

//Generate Token
userSchema.methods.generateAuthToken = async function () {
  try {
    const token = jwt.sign({ _id: this._id.toString() }, process.env.SECRET_KEY, {
      expiresIn: '24h'  
    });

   
    this.tokens = this.tokens || [];
    this.tokens = this.tokens.concat({ token });

    await this.save();
    return token;
  } catch (error) {
    console.error('JWT Error:', error);
    throw new Error('Token generation failed');
  }
};

const User = mongoose.model('User', userSchema);
module.exports = User;
