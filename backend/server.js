const express = require("express");
const cors = require("cors");
const authRouter = require('./routes/AuthRouter');
const path = require('path');
const fetchDatasource = require('./routes/FetchDatasources');
const mongoose = require('mongoose');
const authMiddleware = require('./controller/AuthMiddleware');
// const databaseAnalytics = require('./routes/DatabaseAnalyticsRouter');
// const etlRouter = require('./routes/ETLRouter');
require('dotenv').config();


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(
    {
        origin: process.env.CORS_ORIGIN || ["http://localhost:4000"],
        methods: ["POST", "GET", "DELETE", "PUT"],
        credentials: true
    }
));
app.use('/api/auth', authRouter);
app.use('/api/datasourceroute', fetchDatasource);
// app.use('/api/databaseAnalyticsRoute', databaseAnalytics);
// app.use('api/etlRoute', etlRouter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.get('/api/protected', authMiddleware, (req, res) => {
    res.status(200).json({ message: "Welcome to dbms!", user: req.user });
});

mongoose.connect(process.env.DATABASE_URL)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
