"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Messages = exports.Conversations = exports.Users = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    name: String,
    email: String,
    Phone_Number: Number,
    password: String,
    token: String
});
const conversationSchema = new mongoose_1.default.Schema({
    members: {
        type: Array,
        required: true
    }
});
const messageSchema = new mongoose_1.default.Schema({
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
exports.Users = mongoose_1.default.model("Users", userSchema);
exports.Conversations = mongoose_1.default.model("Conversations", conversationSchema);
exports.Messages = mongoose_1.default.model("Message", messageSchema);
