import mongoose from "mongoose";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

 

export const register = async (req, res, next) => {

    let { name, password, email, role } = req.body;

    try {
        console.log("Mongo Ready State:", mongoose.connection.readyState);
        console.log("Register attempt for email:", email);
        console.log("Password Length:", password?.length ?? 0);

        email = email.toLowerCase();
        const exists = await User.findOne({ email });

        if (exists) return res.status(400).json({ message: 'Email already in use' });

        const user = await User.create({ name, password, email, role });

        generateToken(user._id)

        res.status(201).json({ "success": true, message: "User registered successfully" })

    } catch (err) {
        console.error("REGISTER ERROR:", err.message);
        console.error("STACK:", err.stack);
        next(err)
    }
}

export const login = async (req, res, next) => {

    let { email, password } = req.body;

    try {

        email = email.toLowerCase();

        const user = await User.findOne({ email });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: "Invalid email or password" })
        }

        const token = generateToken(user._id);

        user.password = undefined

        res.json({ token, user })

    } catch (err) {
        next(err)
    }
}