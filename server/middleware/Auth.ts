export const secretKey: string = "RIPUBEREATS";
import {Request, Response, NextFunction} from "express";
import jwt from "jsonwebtoken"

export const Authenticate = (req : Request, res : Response, next : NextFunction) => {
        console.log(req.headers)
        if (!req.headers.authorization) { // return res.status(403).json({message: "please login top again"})
            return res.status(401).json({message: "Login to chat"})
        }
        // console.log(req.headers.authorization)
        const token = req.headers.authorization ?. split(' ')[1]

        if (token !== undefined && token !== null) {
            jwt.verify(token, secretKey, (err, data : any) => { // console.log(data)
                if (data) {
                    req.headers["email"] = data.email;
                    next();
                }
                if (err || !data || typeof(data) === "string") {
                    return res.status(401).json({message: "please login xyz again", error: err})
                }
            })
        }
}
