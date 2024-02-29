import express, { request } from "express";
import jwt from "jsonwebtoken";
import { Users, Conversations, Messages } from "../db/db";
import mongoose from "mongoose";
import { Request, Response } from "express";
import { z } from "zod";
import { secretKey, Authenticate } from "../middleware/Auth";

const router = express.Router();

const signupValidate = z.object({
    name: z.string().min(1),
    email: z.string().min(1),
    phone_number: z.string().min(1),
    password: z.string().min(8)
    //   token: z.string().min(1)
});
const loginValidate = z.object({
    email: z.string().min(1),
    password: z.string().min(8)
    //   token: z.string().min(1)
});

interface User {
    email: string,
    fullName: string
}

router.post("/signup", async (req: Request, res: Response) => {
    // const { email } = req.body;
    const { name, email, phone_number, password } = req.body;
    const parsedInput = signupValidate.safeParse(req.body);
    // console.log(req.body);
    if (!parsedInput.success) {
        return res.json({ message: parsedInput.error });
    }
    const isPresent = await Users.findOne({ email: email });


    if (isPresent) {
        return res.status(400).json({ message: "Email is already in use" });
    }
    const token = jwt.sign(
        {
            email,
            role: "user"
        },
        secretKey,
        { expiresIn: "1h" }
    );
    const user = new Users({
        name: name,
        email: email,
        Phone_Number: phone_number,
        password: password,
        token: token
    });
    await user.save();
    res.json({ message: "user is registered", token });
});

router.post("/login", async (req: Request, res: Response) => {
    try {
        const { email, password } = req.headers;
        const parsedInput = loginValidate.safeParse(req.headers);
        // console.log(email, password);

        if (!parsedInput.success) {
            // console.log(parsedInput.error);
            return res.json({ message: parsedInput.error });
        }
        const isPresent = await Users.findOne({ email: email, password: password });
        // console.log(isPresent);
        if (isPresent) {
            const newToken = jwt.sign(
                {
                    email,
                    role: "user"
                },
                secretKey,
                { expiresIn: "20s" }
            );
            await Users.updateOne(
                { email: email },
                {
                    $set: { token: newToken }
                }
            );
            return res.json({
                message: "welcome",
                userName: isPresent.name,
                userId: isPresent._id,
                token: newToken
            });
        }
        res.json();
    } catch (error) {
        console.log(error);

    }

});

router.get("/me", Authenticate, (req: Request, res: Response) => {
    if (req.headers.email) {
        // console.log(req.headers.email);
        res.json({ email: req.headers.email });
    }
});

router.get("/api/users/:userId", Authenticate, async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId;
        const users = await Users.find({ _id: { $ne: userId } });
        const userData = Promise.all(users.map(async (user) => {
            return { user: { email: user.email, fullName: user.name, userId: user._id }, userId: user._id }
        }))
        res.status(200).json(await userData)
    } catch (error) {
        res.status(401).json(error)

    }
});

router.post("/api/conversation", async (req: Request, res: Response) => {
    try {
        // console.log(req.body);
        const { senderId, receiverId } = req.body;
        if (Object.keys(req.body).length === 0) {
            res.status(404).send("bhsdk puri info de");
        }
        if (!senderId || !receiverId || (senderId && receiverId !== "")) {
            const NewConversation = new Conversations({
                members: [senderId, receiverId]
            });
            await NewConversation.save();
            res.status(200).send("ban gayi hai conversation");
        }
    } catch (error) {
        console.log(error);
    }
});

router.get("/api/conversations/:userId", async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId;

        // Yeh uppar wali userId khud ki hai

        const conversations = await Conversations.find({ members: { $in: [userId] } });
        const conversationUserData = Promise.all(conversations.map(async (conversation) => {
            const receiverId = conversation.members.find((member) => member !== userId);
            const user: any = await Users.findById(receiverId)
            return { user: { email: user.email, fullName: user.name, userId: user._id }, conversationId: conversation._id }
        }))
        res.status(200).json(await conversationUserData);
    } catch (error) {
        console.log(error);
    }
});

router.post('/api/message', async (req: Request, res: Response) => {
    try {
        const { conversationId, senderId, message, receiverId } = req.body;
        // console.log("MESSAGE AAYA ISS INFO KE BAAD",req.body);

        if (!senderId || !message) return res.status(400).send('message cannot be empty');
        if (conversationId === 'new' && receiverId) {
            console.log('Message in New Conversation has been received')
            const newConversation = new Conversations({ members: [senderId, receiverId] })
            await newConversation.save();
            const newMessage = new Messages({ conversationId: newConversation._id, senderId: senderId, message });
            await newMessage.save();
            return res.status(200).send('Message sent sucessfully')
        } else if (!conversationId && !receiverId) {
            return res.status(400).send('Please fill all required fields')
        }
        const newMessage = new Messages({ conversationId, senderId, message });
        await newMessage.save();
        res.status(200).send('Message sent successfully')
        // console.log(newMessage)

    } catch (error) {
        console.log(error);

    }
})
router.get('/api/message/:conversationId', async (req: Request, res: Response) => {
    try {
        const checkMessages = async (conversationId: any) => {
            const messages = await Messages.find({ conversationId })
            const messageUserData = Promise.all(messages.map(async (message) => {
                const user = await Users.findById(message.senderId);
                return { user: { id: user?._id, email: user?.email, fullName: user?.name }, message: message.message }
            }))
            res.status(200).json({ conversationId, messageUserData: await messageUserData })
        }

        const conversationId = req.params.conversationId


        if (conversationId === 'new') {
            // console.log('NEW CONVERSATION DETECTED');
            // console.log(req.query)
            const checkConversation = await Conversations.find({ members: { $all: [req.query.senderId, req.query.receiverId] } })
            // console.log("CHECKED CONVERSATION", checkConversation)
            if (checkConversation.length > 0) {
                checkMessages(checkConversation[0]._id)
            } else {
                const newConversation = new Conversations({ members: [req.query.senderId, req.query.receiverId] })
                await newConversation.save();
                return res.status(200).json({conversationId: newConversation._id, messageUserData: [] })
            }
        } else {
            checkMessages(conversationId)
        }

    } catch (error) {
        console.log(error);

    }
})



export default router;
