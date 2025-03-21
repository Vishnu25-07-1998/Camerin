const mongoose = require("mongoose");

const DatabaseConnectionSchema = new mongoose.Schema({
    datasource: {
        type: String,
        required: [true, "Please provide a datasource!"],
        trim: true,
    },
    dbtechnology: {
        type: String,
        required: [true, "Please provide a dbtechnology!"],
        trim: true,
    },
    database: {
        type: String,
        required: [true, "Please provide a database name!"],
        trim: true,
    },
    hostname: {
        type: String,
        required: [true, "Please provide a hostname!"],
        trim: true,
    },
    port: {
        type: Number,
        required: [true, "Please provide a port!"],
    },
    username: {
        type: String,
        required: [true, "Please provide a username!"],
        trim: true,
    },
    dbpassword: {
        type: String,
        required: [true, "Please provide a database password!"],
    },
    user: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
});

const DatabaseConnection = mongoose.model('DatabaseConnection', DatabaseConnectionSchema);

module.exports = DatabaseConnection;