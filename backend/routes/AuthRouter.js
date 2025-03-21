const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const router = express.Router();


router.post('/register', async (req, res) => {
    const { username, password, email } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        
        if (existingUser) {
            return res.status(409).json({ message: "User already taken" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, username, password: hashedPassword });
        console.log("New user : ", newUser);
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error("Registration error: ", error);
        res.status(500).json({ error, message: 'Error registering user' });
    }
});


router.post('/login', async (req, res) => {
    const { password, email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }
        const payload = { id: user.id, email: user.email, username: user.username };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error(error);
        // res.status(500).json({ message: 'Error logging in' });
        throw new Error(error);
    }
})

module.exports = router;
