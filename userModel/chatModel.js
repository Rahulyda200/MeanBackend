// const mongoose = require('mongoose');

// // Define a schema for the chat message
// const messageSchema = new mongoose.Schema({
//     sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     message: { type: String, required: true },
//   });
  
// // Define a schema for the chat room (optional, if you plan to use chat rooms)
// const chatRoomSchema = new mongoose.Schema({
//   users: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//   }],
//   lastMessage: {
//     type: mongoose.Schema.Types.ObjectId, 
//     ref: 'Message',
//     required: false,
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// const Message = mongoose.model('Message', messageSchema);
// const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);

// module.exports = {
//   Message,
//   ChatRoom,
// };
