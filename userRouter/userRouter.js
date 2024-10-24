const express = require('express');
const userRouter = express.Router();
const userController=require('../userController/userConrtroller')
const authMiddleware = require('../middleware/authMiddleware')
const chatRoomController = require('../userController/chatRoomController')



userRouter.post('/register', userController.registerUser);
userRouter.post('/login', userController.login);

// Create chat room
// userRouter.post('/chat/room', authMiddleware, chatRoomController.createChatRoom);

// // Get messages for a chat room
// userRouter.get('/chat/messages/:roomId', authMiddleware, chatRoomController.getMessagesForRoom);

// Message routes
userRouter.post('/messages', authMiddleware, userController.sendMessage); // Send a message
userRouter.get('/messages', authMiddleware, userController.getMessages);

userRouter.get('/', authMiddleware, userController.getAllUsers);



userRouter.get('/:id', userController.getUserById);


// userRouter.get('/', authMiddleware, userController.getAllUsers);
userRouter.put('/:id', authMiddleware, userController.updateUser);
userRouter.delete('/:id', authMiddleware, userController.deleteUser);


module.exports = userRouter;
