import bcrypt from "bcryptjs";
import User from "../models/User.model.js";
import { generate_token } from "../libs/util.js";

export const signup = async (req, res) => {
  try {
    const { name, email, password, role, patientId } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "This mail already exists" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedpassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedpassword,
      role,
      patientId,
    });

    await newUser.save();

    // generate_token should return the token instead of directly setting cookie
    const token = await generate_token(newUser._id, res);

    return res.status(201).json({
      message: "Sign up Sucessful!!",
      user: {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        patientId: newUser.patientId,
        createdAt: newUser.createdAt,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "invalid user data provided" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be atleast 8 charcters " });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "Invalid email login-check your credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(404)
        .json({ message: "Invalid login-check your password" });
    }

    const token = await generate_token(user._id, res);
    return res.status(200).json({
      message: "Welcome back ",
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        patientId: user.patientId,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).json({ message: "invalid user data " });
  }
};

export const logout = (req, res) => {
  try {
    res.clearCookie("jwt", { maxAge: 0, httpOnly: true, secure: true });
    console.log("user logged out");
    return res.status(200).json({ message: "user logged out" });
  } catch (error) {
    console.log("error in logging out:", error.message);
    return res
      .status(404)
      .json({ message: "server error cannot log out Try again" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    return res.status(200).json({ user });
  } catch (error) {
    console.log("error in getting user data:", error.message);
    return res
      .status(404)
      .json({ message: "server error cannot get user data Try again" });
  }
};
