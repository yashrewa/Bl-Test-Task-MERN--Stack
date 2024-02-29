"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const user_1 = __importDefault(require("./routes/user"));
const mongoose_1 = __importDefault(require("mongoose"));
const db_1 = require("./db/db");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const expressServer = http_1.default.createServer(app);
const socketServer = http_1.default.createServer();
const io = new socket_io_1.Server(socketServer, {
    cors: {
        origin: "*"
    }
});
app.use("/user", user_1.default);
mongoose_1.default.connect(`mongodb+srv://yashrewa00:21Savage@cluster0.fngj58u.mongodb.net/TEST-TASK-?retryWrites=true&w=majority`);
let users = [];
io.on("connection", (socket) => {
    console.log("SOCKET CONNECTION ESTABLISHED", socket.id);
    socket.on("addUser", (userId) => {
        const isUserExist = users.find((user) => user.userId === userId);
        if (!isUserExist) {
            const user = { userId, socketId: socket.id };
            users.push(user);
            io.emit("getUser", users);
        }
    });
    socket.on('sendMessage', ({ conversationId, senderId, message, receiverId }) => __awaiter(void 0, void 0, void 0, function* () {
        const receiver = users.find(user => user.userId === receiverId);
        const sender = users.find(user => user.userId === senderId);
        const user = yield db_1.Users.findById(senderId);
        console.log('USER JO ABHI FETCH KIYA HAI', user);
        if (receiver) {
            io.to(receiver.socketId).to(sender.socketId).emit('getMessage', {
                conversationId,
                senderId,
                message,
                receiverId,
                user: { id: user === null || user === void 0 ? void 0 : user._id, fullName: user === null || user === void 0 ? void 0 : user.name, email: user === null || user === void 0 ? void 0 : user.email }
            });
        }
    }));
    socket.on('updatedConversation', ({ updatedConversation, ReceiverId }) => {
        const receiver = users.find(user => user.userId === ReceiverId);
        io.to(receiver.socketId).emit('updateTheConversation', {
            updatedConversation
        });
    });
    socket === null || socket === void 0 ? void 0 : socket.on("disconnect", () => {
        users = users.filter((user) => user.socketId !== socket.id);
        io.emit("getUser", users);
    });
    // io.emit('getUsers', socket.userId)
});
const expressPort = process.env.EXPRESS_PORT || 3000;
const socketPort = process.env.SOCKET_PORT || 8000;
expressServer.listen(expressPort, () => {
    console.log(`Server is running on port ${expressPort}`);
});
socketServer.listen(socketPort, () => {
    console.log(`Server is running on port ${socketPort}`);
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
