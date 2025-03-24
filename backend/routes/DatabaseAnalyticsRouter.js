const express = require('express');
const User = require('../models/User');
const DatabaseConnection = require('../models/DatabaseConnection');
const authMiddleware = require('../controller/AuthMiddleware');
const path = require('path');
const fsPromises = require('fs').promises;
const fs = require('fs');
const { parse } = require('json2csv');
const csv = require('csv-parser')
const multer = require('multer');
const { spawn } = require('child_process');

const Entities_1 = path.join(__dirname, '..', 'uploads', 'Entities_1');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, Entities_1);
    },
    filename: (req, file, cb) => {
        const originalName = file.originalname;
        cb(null, originalName);
    }
});
const upload = multer({ storage });

require('dotenv').config();
const router = express.Router();

const OUTPUT_DIR = path.join(__dirname, "..", "uploads", "Reports");


const writeSettings = async (script) => {
    const inputPath = path.join(__dirname, '..', 'uploads', 'Entities_1');
    const folderMain = path.join(__dirname, '..', 'uploads');
    try {
        const data = fs.readFileSync(script, "utf8");
        const updatedContent = data
            .replace(/(folder_main_path\s*=\s*)["'].*?["']/, `$1"${folderMain.replace(/\\/g, '\\\\')}"`)
            .replace(/(folder_path_t1\s*=\s*)["'].*?["']/, `$1"${inputPath.replace(/\\/g, "/")}/"`)
            .replace(/(folder_path_t\s*=\s*)r?["'].*?["']/, `$1r'${inputPath}'`);
        fs.writeFileSync(script, updatedContent, "utf8");
        console.log("Settings updated successfully.");
    } catch (error) {
        console.error("An error occurred while processing settings:", error);
    }
};

// Remove old files from input and output dir
const removeOldFiles = async (req, res, next) => {
    try {
        const clearDirectory = async (directory) => {
            try {
                const files = await fsPromises.readdir(directory);
                for (const file of files) {
                    const filePath = path.join(directory, file);
                    await fsPromises.unlink(filePath);
                }
                console.log(`Cleared: ${directory}`);
            } catch (err) {
                console.error(`Error clearing directory ${directory}:`, err);
            }
        };

        await clearDirectory(Entities_1);
        await clearDirectory(OUTPUT_DIR);

        next();
    } catch (err) {
        console.error("Error removing files:", err);
        return res.status(500).json({ message: "Error removing files", error: err });
    }
};


const executeScript = async (script) => {
    return new Promise((resolve, reject) => {
        const py = spawn("python", [script]);
        let output = "";
        let errorOutput = "";

        // Collect stdout data
        py.stdout.on('data', (data) => {
            output += data.toString();
            console.log(`[python] Output: ${data.toString()}`);
        });

        // Collect stderr data
        py.stderr.on('data', (data) => {
            errorOutput += data.toString();
            console.error(`[python] Error: ${data.toString()}`);
        });

        // Handle script exit
        py.on('exit', (code) => {
            if (code === 0) {
                console.log(`Code exited with ${code}`);
                resolve(output);
            } else {
                reject(new Error(`Script exited with code ${code}. ${errorOutput}`));
            }
        });

        // Handle errors in spawning the process
        py.on('error', (err) => {
            reject(new Error(`Failed to start process: ${err.message}`));
        });
    });
};

// convert csv to json for render in frontend table
const parseCsv = (filePath) => {
    return new Promise((resolve, reject) => {
        let results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (data) => results.push(data))
            .on("end", () => resolve(results))
            .on("error", (err) => reject(err));
    });
}

// Basic details
router.post('/basicDetails', authMiddleware, removeOldFiles, upload.array("files"), async (req, res) => {
    try {
        const outputDirectory = path.join(__dirname, '..', 'uploads', 'Reports');
        const scriptPath = path.join(__dirname, '..', 'uploads', 'scripts', 'Basic Details', 'Component_1_Automated_Data_Analysis_v1.py');
        const settingsPath = path.join(__dirname, '..', 'uploads', 'scripts', 'Basic Details', 'Settings_Component_1.py');
        await writeSettings(settingsPath);
        await executeScript(scriptPath);
        const files = fs.readdirSync(outputDirectory);
        let jsonData = [];
        for (const file of files) {
            if (file.endsWith(".csv")) {
                const filePath = path.join(outputDirectory, file);
                const data = await parseCsv(filePath);
                jsonData.push({ fileName: file, data });
            }
        }
        console.log("executed script");
        res.status(200).json({ output: jsonData });
    } catch (error) {
        res.status(500).json({ error: error });
    }
})


module.exports = router;