import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  Phone_Number: Number,
  password: String,
  token: String
});

const conversationSchema = new mongoose.Schema({
  members: {
    type: Array,
    required: true
  }
});

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: String,
    },
    senderId: {
        type: String
    },
    message: {
        type: String
    },
});

export const Users = mongoose.model("Users", userSchema);
export const Conversations = mongoose.model("Conversations",conversationSchema);
export const Messages = mongoose.model("Message", messageSchema);
