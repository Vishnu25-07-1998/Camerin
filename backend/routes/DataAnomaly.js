const express = require('express');
const authMiddleware = require('../controller/AuthMiddleware');
const path = require('path');
const fsPromises = require('fs').promises;
const fs = require('fs');
const csv = require('csv-parser');
const multer = require('multer');
const { spawn } = require('child_process');
const xlsx = require('xlsx');
const PreSave = require('../models/PreSave');


const getUploadDirs = (uploadType) => {
    const base = path.join(__dirname, '..', 'uploads', 'modules');
    switch (uploadType) {
        case 'dbScan':
            return {
                left: path.join(base, 'dataAnomaly', 'DB_Scan', 'Inputs'),
                output: path.join(base, 'dataAnomaly', 'DB_Scan', 'Outputs')
            }
        default:
            throw new Error(`Unknown uploadType: ${uploadType}`);
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        try {
            const { left } = getUploadDirs(req.uploadType);
            const dest = left;
            cb(null, dest);
        } catch (err) {
            cb(err);
        }
    },
    filename: (req, file, cb) => {
        const originalName = file.originalname;
        cb(null, originalName);
    }
});

const upload = multer({ storage });

require('dotenv').config();
const router = express.Router();


const setUploadType = (type) => {
    return (req, res, next) => {
        req.uploadType = type;
        next();
    };
};

const writeSettings = async (script) => {
    const folderMain = path.join(__dirname, '..', 'uploads', 'modules');
    try {
        const data = fs.readFileSync(script, "utf8");
        const updatedContent = data
            .replace(/(folder_main_path\s*=\s*)["'].*?["']/, `$1"${folderMain.replace(/\\/g, '\\\\')}"`)
        // .replace(/(folder_path_t1\s*=\s*)["'].*?["']/, `$1"${inputPath.replace(/\\/g, "/")}/"`)
        // .replace(/(folder_path_t\s*=\s*)r?["'].*?["']/, `$1r'${inputPath}'`);
        fs.writeFileSync(script, updatedContent, "utf8");
        console.log("Settings updated successfully.");
    } catch (error) {
        console.error("An error occurred while processing settings:", error);
    }
};

// Remove old files from input and output dir
const removeOldFiles = async (req, res, next) => {
    try {
        const { left, right, output } = getUploadDirs(req.uploadType);
        const clearDirectory = async (dir) => {
            if (!dir) return;
            const files = await fsPromises.readdir(dir);
            for (const file of files) {
                await fsPromises.unlink(path.join(dir, file));
            }
        };
        await Promise.all([clearDirectory(left), clearDirectory(right), clearDirectory(output)]);
        next();
    } catch (err) {
        res.status(500).json({ message: 'Error clearing old files', error: err.message });
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
        const stream = fs.createReadStream(filePath);

        // Handle file access errors like EBUSY or ENOENT
        stream.on('error', (err) => {
            reject(err);
        });

        stream
            .pipe(csv())
            .on("data", (data) => results.push(data))
            .on("end", () => resolve(results))
            .on("error", (err) => reject(err));
    });
};

router.post('/uploadEntities', authMiddleware, setUploadType('etlSheet'), upload.array("files"), async (req, res) => {
    res.status(200).json({ message: "Upload successful" });
})

const moduleDirectories = {
    "DB Scan": 'DB_Scan',
};

async function readOutputFiles(outputDirectory) {
    const files = fs.readdirSync(outputDirectory);
    const jsonData = [];

    for (const file of files) {
        const filePath = path.join(outputDirectory, file);

        if (file.endsWith('.csv')) {
            const data = await parseCsv(filePath);
            jsonData.push({ fileName: file, data });
        } else if (file.endsWith('.xlsx')) {
            const workbook = xlsx.readFile(filePath);
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const data = xlsx.utils.sheet_to_json(sheet);
            jsonData.push({ fileName: file, data });
        }
    }

    return jsonData;
}

router.post('/dbOuts', authMiddleware, async (req, res) => {
    try {
        const { selectedModule } = req.body;
        const moduleFolder = moduleDirectories[selectedModule];
        if (!moduleFolder) {
            return res.status(400).json({ message: 'Invalid module selected.' });
        }
        const outputDirectory = path.join(__dirname, '..', 'uploads', 'modules', 'dataAnomaly', moduleFolder, 'Outputs');
        const data = await readOutputFiles(outputDirectory);
        return res.status(200).json({ success: true, Output: data });
    } catch (error) {
        console.error('Error in /dbOuts:', error);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

router.post('/prevs', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { projectDetails } = req.body;
        const prevDatas = await PreSave.find({
            user: userId,
            projectName: projectDetails.projectName,
            groupName: projectDetails.groupName,
            moduleName: projectDetails.moduleName,
            subModule: projectDetails.subModule,
        });

        if (!prevDatas || prevDatas.length === 0) {
            return 
        }

        const moduleFolder = moduleDirectories[projectDetails.subModule];

        let outputData = [];

        if (projectDetails.moduleName === prevDatas[0].moduleName && prevDatas[0].subModule === projectDetails.subModule) {
            const outputFilenames = prevDatas[0].outputFiles;
            const moduleOutputDir = path.join(__dirname, '..', 'uploads', 'modules', 'dataAnomaly', moduleFolder, 'Outputs');
            const globalOutputDir = path.join(__dirname, '..', 'uploads', 'Outputs');

            await Promise.all(outputFilenames.map(file => {
                const src = path.join(globalOutputDir, file);
                const dest = path.join(moduleOutputDir, file);
                return fsPromises.copyFile(src, dest);
            }));

            outputData = await readOutputFiles(moduleOutputDir);
        }

        res.status(200).json({
            message: 'Successfully fetched.',
            prevDatas,
            output: outputData
        });

    } catch (error) {
        console.error("Error in /prevs:", error);
        res.status(500).json({ message: 'Server error while fetching previous data.' });
    }
});

const copyFiles = async (srcDir, destDir) => {
    const files = fs.readdirSync(srcDir);
    await Promise.all(files.map(file => {
        const src = path.join(srcDir, file);
        const dest = path.join(destDir, file);
        return fsPromises.copyFile(src, dest);
    }));
};


router.post('/dbScan', authMiddleware, setUploadType('dbScan'), removeOldFiles, upload.array("files"), async (req, res) => {
    try {
        const files = req.files;
        // Define paths
        const baseModulePath = path.join(__dirname, '..', 'uploads', 'modules', 'dataAnomaly', 'DB_Scan');
        const srcInput = path.join(baseModulePath, 'Inputs');
        const trgInput = path.join(__dirname, '..', 'uploads', 'Inputs');
        const outputPath = path.join(baseModulePath, 'Outputs');
        const trgOutput = path.join(__dirname, '..', 'uploads', 'Outputs');
        const scriptPath = path.join(baseModulePath, 'Scripts', 'DBSCAN_Anomaly_v1.py');
        // const settingsPath = path.join(baseModulePath, 'Scripts', 'Settings_Component_1.py');

        // Copy input files to global Inputs directory
        if (files?.length) {
            await copyFiles(srcInput, trgInput);
        }

        // Run script
        // await writeSettings(settingsPath);
        await executeScript(scriptPath);

        // Read processed output
        const outputData = await readOutputFiles(outputPath);

        res.status(200).json({ message: "success", outputData });

    } catch (error) {
        console.error("Basic Details Error:", error);
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
});



module.exports = router;