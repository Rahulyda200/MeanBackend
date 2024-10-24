// const { Message, ChatRoom } = require('../userModel/chatModel')

// // Create a new chat room
// exports.createChatRoom = async (req, res) => {
//   try {
//     const { userIds } = req.body; 
//     const chatRoom = new ChatRoom({ users: userIds });
//     await chatRoom.save();
//     res.status(201).json(chatRoom);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// // Get messages for a chat room
// exports.getMessagesForRoom = async (req, res) => {
//   try {
//     const messages = await Message.find({ chatRoomId: req.params.roomId })
//       .populate('sender', 'name email')
//       .sort({ timestamp: -1 }); 

//     res.status(200).json(messages);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };
