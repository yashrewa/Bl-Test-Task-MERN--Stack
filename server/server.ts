import express from "express";
import cors from "cors";
import {createServer} from "http";
import { Server, Socket } from "socket.io";
import userRoutes from "./routes/user";
import mongoose, { disconnect } from "mongoose";
import { Users } from "./db/db";

interface CustomSocket extends Socket {
  userId?: string;
}

const app = express();
app.use(express.json());

app.use(cors());
const httpServer = createServer(app);

const io = new Server(httpServer, {
 cors: {
  origin: "http://localhost:5173"
 }
});

app.use("/user", userRoutes);

mongoose.connect(
  `mongodb+srv://yashrewa00:21Savage@cluster0.fngj58u.mongodb.net/TEST-TASK-?retryWrites=true&w=majority`
);


let users: { userId: string; socketId: string }[] = [];

io.on("connection", (socket: CustomSocket) => {
  console.log("SOCKET CONNECTION ESTABLISHED", socket.id);
  socket.on("addUser", (userId) => {
    const isUserExist = users.find((user) => user.userId === userId);
    if (!isUserExist) {
      const user = { userId, socketId: socket.id };
      users.push(user);
      io.emit("getUser", users);
    }
  });

  socket.on('sendMessage', async ({ conversationId, senderId, message, receiverId }) => {
    const receiver = users.find(user => user.userId === receiverId);
    const sender: { userId: string; socketId: string } = users.find(user => user.userId === senderId) as { userId: string; socketId: string }
    const user = await Users.findById(senderId)

    console.log('RECEIVER', receiver)

    if (sender) {
      if (receiver) {
        console.log('USER JO ABHI FETCH KIYA HAI AUR RECEIVER BHI PRESENT HAI', user)
        io.to(receiver.socketId).to(sender.socketId).emit('getMessage', {
          conversationId,
          senderId,
          message,
          receiverId,
          user: { id: user?._id, fullName: user?.name, email: user?.email }
        })
        return 
      }
      if(!receiver) {
        console.log('USER OFFLINE HAI FIR BHI MESSAGE JAA RHA HAI BLOCK');
        
        io.to(sender.socketId).emit('getMessage', {
          conversationId,
          senderId,
          message,
          receiverId,
          user: { id: user?._id, fullName: user?.name, email: user?.email }
        })
      }
    }

  })

  socket.on('updatedConversation', ({ updatedConversation, ReceiverId }) => {
    const receiver: any = users.find(user => user.userId === ReceiverId);
    io.to(receiver.socketId).emit('updateTheConversation', {
      updatedConversation
    })
  })


  socket?.on("disconnect", () => {
    users = users.filter((user) => user.socketId !== socket.id);
    io.emit("getUser", users);
  });
  // io.emit('getUsers', socket.userId)
});

const port = process.env.PORT || 3000;

httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// const io = new Server(server, {
//   cors: {
//     origin: "*"
//   }
// });

// io.on("connection", (socket) => {
//   socket.on("message", (data: any) => {
//     console.log({ ...data, userId: socket.id });
//     socket.broadcast.emit("response", { ...data, userId: socket.id });
//   });

// io.use((socket, next) => {
//   const newToken = socket.handshake.headers.token;
//   if (newToken !== undefined && newToken !== "") {
//     console.log(newToken);
//     next();
//   } else {
//     next(new Error("please login to the server first"));
//   }
// });

//   socket.on("userRegister", ({ userName, userId }) => {
//     socket.broadcast.emit("joinedResponse", { userName });
//     console.log("userId sent from client" + userId, userName);
//   });
// });
