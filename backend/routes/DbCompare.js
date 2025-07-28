const express = require('express');
const authMiddleware = require('../controller/AuthMiddleware');
const path = require('path');
const fsPromises = require('fs').promises;
const fs = require('fs');
const { parse } = require('json2csv');
const csv = require('csv-parser')
const multer = require('multer');
const { spawn } = require('child_process');
const xlsx = require('xlsx');


const getUploadDirs = (uploadType) => {
    const base = path.join(__dirname, '..', 'uploads', 'modules');
    switch (uploadType) {
        case 'correlationBetweenDbData':
            return {
                left: path.join(base, 'dbCompare', 'Correlation_Between_DB_Data', 'Left', 'Inputs'),
                right: path.join(base, 'dbCompare', 'Correlation_Between_DB_Data', 'Right', 'Inputs'),
                output: path.join(base, 'dbCompare', 'Correlation_Between_DB_Data', 'Outputs')
            };
        case 'spearmanComparison':
            return {
                left: path.join(base, 'dbCompare', 'Spearman_comparison', 'Left', 'Inputs'),
                right: path.join(base, 'dbCompare', 'Spearman_comparison', 'Right', 'Inputs'),
                output: path.join(base, 'dbCompare', 'Spearman_comparison', 'Outputs')
            };
        case 'quickRatioComparison':
            return {
                left: path.join(base, 'dbCompare', 'QuickRatioComparisonBetweenSourceColumns', 'Left', 'Inputs'),
                right: path.join(base, 'dbCompare', 'QuickRatioComparisonBetweenSourceColumns', 'Right', 'Inputs'),
                output: path.join(base, 'dbCompare', 'QuickRatioComparisonBetweenSourceColumns', 'Outputs')
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
    "Correlation Between DB Data": 'Correlation_Between_DB_Data',
    "Quick Ratio Comparison Between Source Columns": 'QuickRatioComparisonBetweenSourceColumns',
    "Spearman Comparison Between Source Columns": "Spearman_comparison",
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


router.post('/dbOuts', authMiddleware, async (req, res) => {
    try {
        const { selectedModule } = req.body;
        const moduleFolder = moduleDirectories[selectedModule];
        if (!moduleFolder) {
            return res.status(400).json({ message: 'Invalid module selected.' });
        }
        const outputDirectory = path.join(__dirname, '..', 'uploads', 'modules', 'dbCompare', moduleFolder, 'Outputs');
        const data = await readOutputFiles(outputDirectory);
        return res.status(200).json({ success: true, Output: data });
    } catch (error) {
        console.error('Error in /dbOuts:', error);
        return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
});


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

// Correlation Between DB Data 
router.post('/correlationBetweenDbData', authMiddleware, setUploadType('correlationBetweenDbData'), removeOldFiles, upload.fields([
    { name: 'leftFiles', maxCount: 10 },
    { name: 'rightFiles', maxCount: 10 },
]), async (req, res) => {
    try {
        const scriptPath = path.join(__dirname, '..', 'uploads', 'modules', 'dbCompare', 'Correlation_Between_DB_Data', 'Scripts', 'Correlation_between_DB_Data_v5.py');
        const settingsPath = path.join(__dirname, '..', 'uploads', 'modules', 'dbCompare', 'Correlation_Between_DB_Data', 'Scripts', 'Settings_Component_Correlation_DB.py');
        await writeSettings(settingsPath);
        await executeScript(scriptPath);
        return res.status(200).json({ message: "success" })
    } catch (error) {
        res.status(500).json({ error: error });
    }
})


// Spearman Comparison Between Source Columns 
router.post('/spearmanComparison', authMiddleware, setUploadType('spearmanComparison'), removeOldFiles, upload.fields([
    { name: 'leftFiles', maxCount: 10 },
    { name: 'rightFiles', maxCount: 10 },
]), async (req, res) => {
    try {
        const scriptPath = path.join(__dirname, '..', 'uploads', 'modules', 'dbCompare', 'Spearman_comparison', 'Scripts', 'Spearman_Comparison_between_Source_Columns_v2.py');
        const settingsPath = path.join(__dirname, '..', 'uploads', 'modules', 'dbCompare', 'Spearman_comparison', 'Scripts', 'Settings_Component_Spearman_ColumnNames.py');
        await writeSettings(settingsPath);
        await executeScript(scriptPath);
        return res.status(200).json({ message: "success" })
    } catch (error) {
        res.status(500).json({ error: error });
    }
})


// QuickRatio Comparison Between Source Columns 
router.post('/quickRatioComparison', authMiddleware, setUploadType('quickRatioComparison'), removeOldFiles, upload.fields([
    { name: 'leftFiles', maxCount: 10 },
    { name: 'rightFiles', maxCount: 10 },
]), async (req, res) => {
    try {
        const scriptPath = path.join(__dirname, '..', 'uploads', 'modules', 'dbCompare', 'QuickRatioComparisonBetweenSourceColumns', 'Scripts', 'QuickRatio_Comparison_between_Source_Columns_v2.py');
        const settingsPath = path.join(__dirname, '..', 'uploads', 'modules', 'dbCompare', 'QuickRatioComparisonBetweenSourceColumns', 'Scripts', 'Settings_Component_QuickRatio_ColumnNames.py');
        await writeSettings(settingsPath);
        await executeScript(scriptPath);
        return res.status(200).json({ message: "success" })
    } catch (error) {
        res.status(500).json({ error: error });
    }
})

module.exports = router;