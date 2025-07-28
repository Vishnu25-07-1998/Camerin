const express = require('express');
const authMiddleware = require('../controller/AuthMiddleware');
const path = require('path');
const fsPromises = require('fs').promises;
const fs = require('fs');
const csv = require('csv-parser');
const { spawn } = require('child_process');
const xlsx = require('xlsx');
const multer = require('multer');


const getUploadDirs = (uploadType) => {
    const base = path.join(__dirname, '..', 'uploads', 'modules');
    switch (uploadType) {
        case 'basicDetails':
            return {
                left: path.join(base, 'databaseAnalytics', 'Basic_Details', 'Inputs'),
                output: path.join(base, 'databaseAnalytics', 'Basic_Details', 'Outputs')
            };
        case 'generateReconReport':
            return {
                left: path.join(base, 'reconciliation', 'Generate_Recon_Report', 'Left_Input'),
                right: path.join(base, 'reconciliation', 'Generate_Recon_Report', 'Right_Input'),
                output: path.join(base, 'reconciliation', 'Generate_Recon_Report', 'Outputs')
            };
        default:
            throw new Error(`Unknown uploadType: ${uploadType}`);
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        try {
            const { left, right } = getUploadDirs(req.uploadType);
            const dest = file.fieldname === 'rightFiles' ? right : left;
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

const moduleDirectories = {
    "Generate Recon Report": "Generate_Recon_Report"
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


router.post('/dbOuts', authMiddleware, async (req, res) => {
    try {
        const { selectedModule } = req.body;
        const moduleFolder = moduleDirectories[selectedModule];
        if (!moduleFolder) {
            return res.status(400).json({ message: 'Invalid module selected.' });
        }
        const outputDirectory = path.join(__dirname, '..', 'uploads', 'modules', 'reconciliation', moduleFolder, 'Outputs');
        const data = await readOutputFiles(outputDirectory);
        return res.status(200).json({ success: true, Output: data });
    } catch (error) {
        console.error('Error in /dbOuts:', error);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});

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

const toPythonList = (arr) => `['${arr.join("','")}']`;

router.post('/generateReconReport', authMiddleware, setUploadType('generateReconReport'), removeOldFiles, upload.fields([
    { name: 'leftFiles', maxCount: 1 },
    { name: 'rightFiles', maxCount: 1 },
]), async (req, res) => {
    try {
        // Get uploaded file names
        const input_left = path.join(__dirname, '..', 'uploads', 'modules', 'reconciliation', 'Generate_Recon_Report', 'Left_Input', req.files['leftFiles']?.[0]?.filename || '');
        const input_right = path.join(__dirname, '..', 'uploads', 'modules', 'reconciliation', 'Generate_Recon_Report', 'Right_Input', req.files['rightFiles']?.[0]?.filename || '');
        const selectedHeaders = JSON.parse(req.body.selectedHeaders || '{}');
        const leftHeadersList = toPythonList(selectedHeaders.leftEntity || []);
        const rightHeadersList = toPythonList(selectedHeaders.rightEntity || []);
        const scriptPath = path.join(__dirname, '..', 'uploads', 'modules', 'reconciliation', 'Generate_Recon_Report', 'Scripts', 'Create_recon_report_v1.py');
        const settingsPath = path.join(__dirname, '..', 'uploads', 'modules', 'reconciliation', 'Generate_Recon_Report', 'Scripts', 'Settings_Component_Recon.py');
        const lines = fs.readFileSync(settingsPath, 'utf8').split('\n');
        let updatedLines = [];

        for (let line of lines) {
            if (line.startsWith('input_left')) {
                updatedLines.push(`input_left = r"${input_left}"`);
            } else if (line.startsWith('input_right')) {
                updatedLines.push(`input_right = r"${input_right}"`);
            } else if (line.startsWith('uid_columns')) {
                updatedLines.push(`uid_columns = ${leftHeadersList}`);
            } else if (line.startsWith('columns_to_be_compared_when_value_of_uid_is_same')) {
                updatedLines.push(`columns_to_be_compared_when_value_of_uid_is_same = ${rightHeadersList}`);
            } else {
                updatedLines.push(line);
            }
        }

        fs.writeFileSync(settingsPath, updatedLines.join('\n'), 'utf8');
        console.log("Settings updated successfully.");
        const result = await executeScript(scriptPath);
        return res.status(200).json({ message: "success", result })
    } catch (error) {
        res.status(500).json({ error: error });
    }
})

router.post('/basicDetails', authMiddleware, setUploadType('basicDetails'), removeOldFiles, async (req, res) => {
    try {
        const { selectedEntities } = req.body;
        const sourceDir = path.join(__dirname, '..', 'uploads', 'Entities_1');
        const targetDir = path.join(__dirname, '..', 'uploads', 'modules', 'databaseAnalytics', 'Basic_Details', 'Inputs');
        for (const baseName of selectedEntities) {
            const fileName = `${baseName}.csv`;
            const sourcePath = path.join(sourceDir, fileName);
            const targetPath = path.join(targetDir, fileName);
            if (fs.existsSync(sourcePath)) {
                await fsPromises.copyFile(sourcePath, targetPath);
                console.log(`Moved: ${fileName}`);
            } else {
                console.warn(`File not found: ${fileName}`);
            }
        }
        const scriptPath = path.join(__dirname, '..', 'uploads', 'modules', 'databaseAnalytics', 'Basic_Details', 'Scripts', 'Component_1_Automated_Data_Analysis_v1.py');
        const settingsPath = path.join(__dirname, '..', 'uploads', 'modules', 'databaseAnalytics', 'Basic_Details', 'Scripts', 'Settings_Component_1.py');
        await writeSettings(settingsPath);
        await executeScript(scriptPath);
        const outputDirectory = path.join(__dirname, '..', 'uploads', 'modules', 'databaseAnalytics', 'Basic_Details', 'Outputs');
        console.log('outputDirectory :', outputDirectory);
        const data = await readOutputFiles(outputDirectory);
        return res.status(200).json({ success: true, Output: data });
    } catch (error) {
        res.status(500).json({ error: error });
    }
})


module.exports = router;