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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db/db");
const zod_1 = require("zod");
const Auth_1 = require("../middleware/Auth");
const router = express_1.default.Router();
const signupValidate = zod_1.z.object({
    name: zod_1.z.string().min(1),
    email: zod_1.z.string().min(1),
    phone_number: zod_1.z.string().min(1),
    password: zod_1.z.string().min(8)
    //   token: z.string().min(1)
});
const loginValidate = zod_1.z.object({
    email: zod_1.z.string().min(1),
    password: zod_1.z.string().min(8)
    //   token: z.string().min(1)
});
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, phone_number, password } = req.body;
    const parsedInput = signupValidate.safeParse(req.body);
    if (!parsedInput.success) {
        return res.json({ message: parsedInput.error });
    }
    const isPresent = yield db_1.Users.findOne({ email: email });
    if (isPresent) {
        return res.status(400).json({ message: "Email is already in use" });
    }
    const token = jsonwebtoken_1.default.sign({
        email,
        role: "user"
    }, Auth_1.secretKey, { expiresIn: "1h" });
    const user = new db_1.Users({
        name: name,
        email: email,
        Phone_Number: phone_number,
        password: password,
        token: token
    });
    yield user.save();
    res.json({ message: "user is registered", token });
}));
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.headers;
        const parsedInput = loginValidate.safeParse(req.headers);
        // console.log(email, password);
        if (!parsedInput.success) {
            // console.log(parsedInput.error);
            return res.json({ message: parsedInput.error });
        }
        const isPresent = yield db_1.Users.findOne({ email: email, password: password });
        // console.log(isPresent);
        if (isPresent) {
            const newToken = jsonwebtoken_1.default.sign({
                email,
                role: "user"
            }, Auth_1.secretKey, { expiresIn: "1h" });
            yield db_1.Users.updateOne({ email: email }, {
                $set: { token: newToken }
            });
            return res.json({
                message: "welcome",
                userName: isPresent.name,
                userId: isPresent._id,
                token: newToken
            });
        }
        res.json();
    }
    catch (error) {
        console.log(error);
    }
}));
router.get("/me", Auth_1.Authenticate, (req, res) => {
    if (req.headers.email) {
        // console.log(req.headers.email);
        res.json({ email: req.headers.email });
    }
});
router.get('/api/ping', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.status(200).json({ message: 'Server Pinging is working successfully' });
    }
    catch (error) {
        console.log(res.status, error);
    }
}));
router.get("/api/users/:userId", Auth_1.Authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.userId;
        const users = yield db_1.Users.find({ _id: { $ne: userId } });
        const userData = Promise.all(users.map((user) => __awaiter(void 0, void 0, void 0, function* () {
            return { user: { email: user.email, fullName: user.name, userId: user._id }, userId: user._id };
        })));
        res.status(200).json(yield userData);
    }
    catch (error) {
        res.status(401).json(error);
    }
}));
router.post("/api/conversation", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // console.log(req.body);
        const { senderId, receiverId } = req.body;
        if (Object.keys(req.body).length === 0) {
            res.status(404).send("bhsdk puri info de");
        }
        if (!senderId || !receiverId || (senderId && receiverId !== "")) {
            const NewConversation = new db_1.Conversations({
                members: [senderId, receiverId]
            });
            yield NewConversation.save();
            res.status(200).send("ban gayi hai conversation");
        }
    }
    catch (error) {
        console.log(error);
    }
}));
router.get("/api/conversations/:userId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.userId;
        // Yeh uppar wali userId khud ki hai
        const conversations = yield db_1.Conversations.find({ members: { $in: [userId] } });
        const conversationUserData = Promise.all(conversations.map((conversation) => __awaiter(void 0, void 0, void 0, function* () {
            const receiverId = conversation.members.find((member) => member !== userId);
            const user = yield db_1.Users.findById(receiverId);
            return { user: { email: user.email, fullName: user.name, userId: user._id }, conversationId: conversation._id };
        })));
        res.status(200).json(yield conversationUserData);
    }
    catch (error) {
        console.log(error);
    }
}));
router.post('/api/message', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { conversationId, senderId, message, receiverId } = req.body;
        // console.log("MESSAGE AAYA ISS INFO KE BAAD",req.body);
        if (!senderId || !message)
            return res.status(400).send('message cannot be empty');
        if (conversationId === 'new' && receiverId) {
            // console.log('Message in New Conversation has been received')
            const newConversation = new db_1.Conversations({ members: [senderId, receiverId] });
            yield newConversation.save();
            const newMessage = new db_1.Messages({ conversationId: newConversation._id, senderId: senderId, message });
            yield newMessage.save();
            return res.status(200).send('Message sent sucessfully');
        }
        else if (!conversationId && !receiverId) {
            return res.status(400).send('Please fill all required fields');
        }
        const newMessage = new db_1.Messages({ conversationId, senderId, message });
        yield newMessage.save();
        res.status(200).send('Message sent successfully');
        // console.log(newMessage)
    }
    catch (error) {
        console.log(error);
    }
}));
router.get('/api/message/:conversationId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const checkMessages = (conversationId) => __awaiter(void 0, void 0, void 0, function* () {
            const messages = yield db_1.Messages.find({ conversationId });
            const messageUserData = Promise.all(messages.map((message) => __awaiter(void 0, void 0, void 0, function* () {
                const user = yield db_1.Users.findById(message.senderId);
                return { user: { id: user === null || user === void 0 ? void 0 : user._id, email: user === null || user === void 0 ? void 0 : user.email, fullName: user === null || user === void 0 ? void 0 : user.name }, message: message.message, messageId: message._id };
            })));
            res.status(200).json({ conversationId, messageUserData: yield messageUserData });
        });
        const conversationId = req.params.conversationId;
        if (conversationId === 'new') {
            // console.log('NEW CONVERSATION DETECTED');
            // console.log(req.query)
            const checkConversation = yield db_1.Conversations.find({ members: { $all: [req.query.senderId, req.query.receiverId] } });
            // console.log("CHECKED CONVERSATION", checkConversation)
            if (checkConversation.length > 0) {
                checkMessages(checkConversation[0]._id);
            }
            else {
                const newConversation = new db_1.Conversations({ members: [req.query.senderId, req.query.receiverId] });
                yield newConversation.save();
                return res.status(200).json({ conversationId: newConversation._id, messageUserData: [] });
            }
        }
        else {
            checkMessages(conversationId);
        }
    }
    catch (error) {
        console.log(error);
    }
}));
router.delete('/api/message-delete/:messageId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { messageId } = req.params;
        const message = yield db_1.Messages.findOneAndDelete({ _id: messageId });
        res.send("Message deleted");
    }
    catch (error) {
        console.log(error);
    }
}));
exports.default = router;
