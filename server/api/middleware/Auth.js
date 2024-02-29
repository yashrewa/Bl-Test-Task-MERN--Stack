"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Authenticate = exports.secretKey = void 0;
exports.secretKey = "RIPUBEREATS";
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Authenticate = (req, res, next) => {
    var _a;
    console.log(req.headers);
    if (!req.headers.authorization) { // return res.status(403).json({message: "please login top again"})
        return res.status(401).json({ message: "Login to chat" });
    }
    // console.log(req.headers.authorization)
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    if (token !== undefined && token !== null) {
        jsonwebtoken_1.default.verify(token, exports.secretKey, (err, data) => {
            if (data) {
                req.headers["email"] = data.email;
                next();
            }
            if (err || !data || typeof (data) === "string") {
                return res.status(401).json({ message: "please login xyz again", error: err });
            }
        });
    }
};
exports.Authenticate = Authenticate;
