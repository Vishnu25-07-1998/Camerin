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
        case 'basicDetails':
            return {
                left: path.join(base, 'databaseAnalytics', 'Basic_Details', 'Inputs'),
                output: path.join(base, 'databaseAnalytics', 'Basic_Details', 'Outputs')
            }
        case 'cardinality':
            return {
                left: path.join(base, 'databaseAnalytics', 'Cardinality', 'Inputs'),
                output: path.join(base, 'databaseAnalytics', 'Cardinality', 'Outputs')
            }
        case 'distinctColumnLength':
            return {
                left: path.join(base, 'databaseAnalytics', 'Distinct_Column_Length', 'Inputs'),
                output: path.join(base, 'databaseAnalytics', 'Distinct_Column_Length', 'Outputs')
            }
        case 'distinctColumnValues':
            return {
                left: path.join(base, 'databaseAnalytics', 'Distinct_Column_Values', 'Inputs'),
                output: path.join(base, 'databaseAnalytics', 'Distinct_Column_Values', 'Outputs')
            }
        case 'uniqueIndexes':
            return {
                left: path.join(base, 'databaseAnalytics', 'Unique_Indexes', 'Inputs'),
                output: path.join(base, 'databaseAnalytics', 'Unique_Indexes', 'Outputs')
            }
        case 'columnEachCharCount':
            return {
                left: path.join(base, 'databaseAnalytics', 'Column_Each_Char_Count', 'Inputs'),
                output: path.join(base, 'databaseAnalytics', 'Column_Each_Char_Count', 'Outputs')
            }
        case "subsetRelation":
            return {
                left: path.join(base, 'databaseAnalytics', 'Subset_Relations', 'Inputs'),
                output: path.join(base, 'databaseAnalytics', 'Subset_Relations', 'Outputs')
            }
        case 'substrConcatAllEntities':
            return {
                left: path.join(base, 'databaseAnalytics', 'Substr_and_Concat_All_Entities', 'Inputs'),
                output: path.join(base, 'databaseAnalytics', 'Substr_and_Concat_All_Entities', 'Outputs')
            }
        case 'substrConcatColumns':
            return {
                left: path.join(base, 'databaseAnalytics', 'Substr_and_Concat_Columns', 'Inputs'),
                output: path.join(base, 'databaseAnalytics', 'Substr_and_Concat_Columns', 'Outputs')
            }
        case 'equalColumns':
            return {
                left: path.join(base, 'databaseAnalytics', 'Equal_Columns', 'Inputs'),
                output: path.join(base, 'databaseAnalytics', 'Equal_Columns', 'Outputs')
            }
        case 'distinctPOS':
            return {
                left: path.join(base, 'databaseAnalytics', 'Distinct_POS', 'Inputs'),
                output: path.join(base, 'databaseAnalytics', 'Distinct_POS', 'Outputs')
            }
        case 'tableNamesGap':
            return {
                left: path.join(base, 'databaseAnalytics', 'Table_Names_Gap', 'Inputs'),
                output: path.join(base, 'databaseAnalytics', 'Table_Names_Gap', 'Outputs')
            }
        case 'tableNamesMissing':
            return {
                left: path.join(base, 'databaseAnalytics', 'Table_Names_Missing', 'Inputs'),
                output: path.join(base, 'databaseAnalytics', 'Table_Names_Missing', 'Outputs')
            }
        case 'etlSheet':
            return { left: path.join(__dirname, '..', 'uploads', 'Entities_1') }
        default:
            throw new Error(`Unknown uploadType: ${uploadType}`);
    }
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        try {
            const { left, right } = getUploadDirs(req.uploadType);
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
    "Basic Details": 'Basic_Details',
    "Cardinality": 'Cardinality',
    "Distinct Column Values": 'Distinct_Column_Values',
    "Distinct Column Length": 'Distinct_Column_Length',
    "Column Each Char Count": 'Column_Each_Char_Count',
    "Substr and Concat All Entities": 'Substr_and_Concat_All_Entities',
    "Substr and Concat Columns": 'Substr_and_Concat_Columns',
    "Unique Indexes": "Unique_Indexes",
    "Subset Relations": "Subset_Relations",
    "Equal Columns": "Equal_Columns",
    'Distinct POS': 'Distinct_POS',
    'Table Names Gaps Filled': 'Table_Names_Gap',
    'Table Names as is Meaning': 'Table_Names_Missing',
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
        const outputDirectory = path.join(__dirname, '..', 'uploads', 'modules', 'databaseAnalytics', moduleFolder, 'Outputs');
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
            const moduleOutputDir = path.join(__dirname, '..', 'uploads', 'modules', 'databaseAnalytics', moduleFolder, 'Outputs');
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


router.post('/basicDetails', authMiddleware, setUploadType('basicDetails'), removeOldFiles, upload.array("files"), async (req, res) => {
    try {
        const data = JSON.parse(req.body.data);
        const files = req.files;

        // Define paths
        const baseModulePath = path.join(__dirname, '..', 'uploads', 'modules', 'databaseAnalytics', 'Basic_Details');
        const srcInput = path.join(baseModulePath, 'Inputs');
        const trgInput = path.join(__dirname, '..', 'uploads', 'Inputs');
        const outputPath = path.join(baseModulePath, 'Outputs');
        const trgOutput = path.join(__dirname, '..', 'uploads', 'Outputs');
        const scriptPath = path.join(baseModulePath, 'Scripts', 'Component_1_Automated_Data_Analysis_v1.py');
        const settingsPath = path.join(baseModulePath, 'Scripts', 'Settings_Component_1.py');

        // Copy input files to global Inputs directory
        if (files?.length) {
            await copyFiles(srcInput, trgInput);
        }

        if (data.inputFiles?.length) {
            await Promise.all(
                data.inputFiles.map(({ name }) => {
                    const src = path.join(trgInput, name);
                    const dest = path.join(srcInput, name);
                    return fsPromises.copyFile(src, dest);
                })
            );
        }

        // Run script
        await writeSettings(settingsPath);
        await executeScript(scriptPath);

        // Handle output files
        const outFiles = fs.readdirSync(outputPath);
        data.outputFiles = outFiles;

        if (data.projectDetails.projectName && data.projectDetails.groupName) {
            // Save metadata to DB
            await PreSave.findOneAndUpdate(
                {
                    projectName: data.projectDetails.projectName,
                    groupName: data.projectDetails.groupName,
                    moduleName: 'Database Analytics',
                    subModule: 'Basic Details',
                },
                {
                    config: data.config,
                    checkedEntities: data.checkedEntities,
                    inputFiles: data.inputFiles,
                    outputFiles: data.outputFiles,
                    user: req.user.id,
                },
                { new: true, upsert: true }
            );
        }

        // Copy output files to shared output folder
        await copyFiles(outputPath, trgOutput);

        // Read processed output
        const outputData = await readOutputFiles(outputPath);

        res.status(200).json({ message: "success", outputData });

    } catch (error) {
        console.error("Basic Details Error:", error);
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
});



// Cardinality
router.post('/cardinality', authMiddleware, setUploadType('cardinality'), removeOldFiles, upload.array("files"), async (req, res) => {
    try {
        const data = JSON.parse(req.body.data);
        const files = req.files;
        const baseModulePath = path.join(__dirname, '..', 'uploads', 'modules', 'databaseAnalytics', 'Cardinality');
        const srcInput = path.join(baseModulePath, 'Inputs');
        const trgInput = path.join(__dirname, '..', 'uploads', 'Inputs');
        const outputPath = path.join(baseModulePath, 'Outputs');
        const trgOutput = path.join(__dirname, '..', 'uploads', 'Outputs');
        const scriptPath = path.join(__dirname, '..', 'uploads', 'modules', 'databaseAnalytics', 'Cardinality', 'Scripts', 'Component_8_Source_Attributes_cardinality_relation_v1.py');
        const settingsPath = path.join(__dirname, '..', 'uploads', 'modules', 'databaseAnalytics', 'Cardinality', 'Scripts', 'Settings_Component_8.py');
        if (files?.length) {
            await copyFiles(srcInput, trgInput);
        }
        if (data.inputFiles?.length) {
            await Promise.all(
                data.inputFiles.map(({ name }) => {
                    const src = path.join(trgInput, name);
                    const dest = path.join(srcInput, name);
                    return fsPromises.copyFile(src, dest);
                })
            );
        }
        await writeSettings(settingsPath);
        await executeScript(scriptPath);
        const outFiles = fs.readdirSync(outputPath);
        data.outputFiles = outFiles;
        if (data.projectDetails.projectName && data.projectDetails.groupName) {
            await PreSave.findOneAndUpdate(
                {
                    projectName: data.projectDetails.projectName,
                    groupName: data.projectDetails.groupName,
                    moduleName: 'Database Analytics',
                    subModule: 'Cardinality',
                },
                {
                    config: data.config,
                    checkedEntities: data.checkedEntities,
                    inputFiles: data.inputFiles,
                    outputFiles: data.outputFiles,
                    user: req.user.id,
                },
                { new: true, upsert: true }
            );
        }
        // Copy output files to shared output folder
        await copyFiles(outputPath, trgOutput);
        const outputData = await readOutputFiles(outputPath);
        res.status(200).json({ message: "success", outputData });
    } catch (error) {
        res.status(500).json({ error: error });
    }
})

// Unique Indexes
router.post('/uniqueIndexes', authMiddleware, setUploadType('uniqueIndexes'), removeOldFiles, upload.array("files"), async (req, res) => {
    try {
        const data = JSON.parse(req.body.data);
        const files = req.files;
        const baseModulePath = path.join(__dirname, '..', 'uploads', 'modules', 'databaseAnalytics', 'Unique_Indexes');
        const srcInput = path.join(baseModulePath, 'Inputs');
        const trgInput = path.join(__dirname, '..', 'uploads', 'Inputs');
        const outputPath = path.join(baseModulePath, 'Outputs');
        const trgOutput = path.join(__dirname, '..', 'uploads', 'Outputs');
        if (files?.length) {
            await copyFiles(srcInput, trgInput);
        }
        if (data.inputFiles?.length) {
            await Promise.all(
                data.inputFiles.map(({ name }) => {
                    const src = path.join(trgInput, name);
                    const dest = path.join(srcInput, name);
                    return fsPromises.copyFile(src, dest);
                })
            );
        }
        const scriptPath = path.join(__dirname, '..', 'uploads', 'modules', 'databaseAnalytics', 'Unique_Indexes', 'Scripts', 'Component_6_Source_Unique_Keys_v1.py');
        const settingsPath = path.join(__dirname, '..', 'uploads', 'modules', 'databaseAnalytics', 'Unique_Indexes', 'Scripts', 'Settings_Component_6.py');
        const lines = fs.readFileSync(settingsPath, 'utf8').split('\n');
        const folderMain = path.join(__dirname, '..', 'uploads', 'modules');
        let updatedLines = [];

        for (let line of lines) {
            if (line.startsWith('folder_main_path')) {
                updatedLines.push(`folder_main_path = "${folderMain.replace(/\\/g, '\\\\')}"`);
            } else if (line.startsWith('max_no_of_unique_keys_required')) {
                updatedLines.push(`max_no_of_unique_keys_required = ${data.uniqueIndexSettings.max_no_of_unique_keys_required}`);
            } else if (line.startsWith('max_no_of_columns_in_unique_key')) {
                updatedLines.push(`max_no_of_columns_in_unique_key = ${data.uniqueIndexSettings.max_no_of_columns_in_unique_key}`);
            } else if (line.startsWith('max_key_combinations_to_be_checked')) {
                updatedLines.push(`max_key_combinations_to_be_checked = ${data.uniqueIndexSettings.max_key_combinations_to_be_checked}`);
            } else if (line.startsWith('max_key_combinations_identified')) {
                updatedLines.push(`max_key_combinations_identified = ${data.uniqueIndexSettings.max_key_combinations_identified}`);
            } else {
                updatedLines.push(line);
            }
        }
        fs.writeFileSync(settingsPath, updatedLines.join('\n'), 'utf8');
        await executeScript(scriptPath);
        const outFiles = fs.readdirSync(outputPath);
        data.outputFiles = outFiles;
        if (data.projectDetails.projectName && data.projectDetails.groupName) {
            await PreSave.findOneAndUpdate(
                {
                    projectName: data.projectDetails.projectName,
                    groupName: data.projectDetails.groupName,
                    moduleName: 'Database Analytics',
                    subModule: 'Unique Indexes',
                },
                {
                    config: data.config,
                    checkedEntities: data.checkedEntities,
                    inputFiles: data.inputFiles,
                    outputFiles: data.outputFiles,
                    maxUniqueKeys: data.uniqueIndexSettings.max_no_of_unique_keys_required,
                    maxColumnsInKey: data.uniqueIndexSettings.max_no_of_columns_in_unique_key,
                    maxKeyCombosCheck: data.uniqueIndexSettings.max_key_combinations_to_be_checked,
                    maxKeyCombosIdentified: data.uniqueIndexSettings.max_key_combinations_identified,
                    user: req.user.id,
                },
                { new: true, upsert: true }
            );
        }
        // Copy output files to shared output folder
        await copyFiles(outputPath, trgOutput);
        const outputData = await readOutputFiles(outputPath);
        res.status(200).json({ message: "success", outputData });
    } catch (error) {
        res.status(500).json({ error: error });
    }
})

// 
router.post('/distinctColumnLength', setUploadType('distinctColumnLength'), authMiddleware, removeOldFiles, upload.array("files"), async (req, res) => {
    try {
        const data = JSON.parse(req.body.data);
        const files = req.files;
        const baseModulePath = path.join(__dirname, '..', 'uploads', 'modules', 'databaseAnalytics', 'Distinct_Column_Length');
        const srcInput = path.join(baseModulePath, 'Inputs');
        const trgInput = path.join(__dirname, '..', 'uploads', 'Inputs');
        const outputPath = path.join(baseModulePath, 'Outputs');
        if (files?.length) {
            await copyFiles(srcInput, trgInput);
        }
        if (data.inputFiles?.length) {
            await Promise.all(
                data.inputFiles.map(({ name }) => {
                    const src = path.join(trgInput, name);
                    const dest = path.join(srcInput, name);
                    return fsPromises.copyFile(src, dest);
                })
            );
        }
        const trgOutput = path.join(__dirname, '..', 'uploads', 'Outputs');
        const scriptPath = path.join(__dirname, '..', 'uploads', 'modules', 'databaseAnalytics', 'Distinct_Column_Length', 'Scripts', 'Component_3_Source_column_lengths_count_v1.py');
        const settingsPath = path.join(__dirname, '..', 'uploads', 'modules', 'databaseAnalytics', 'Distinct_Column_Length', 'Scripts', 'Settings_Component_3.py');
        const lines = fs.readFileSync(settingsPath, 'utf8').split('\n');
        const folderMain = path.join(__dirname, '..', 'uploads', 'modules');
        let updatedLines = [];

        for (let line of lines) {
            if (line.startsWith('folder_main_path')) {
                updatedLines.push(`folder_main_path = "${folderMain.replace(/\\/g, '\\\\')}"`);
            } else if (line.startsWith('count_of_distinct_values_per_column')) {
                updatedLines.push(`count_of_distinct_values_per_column = ${data.distinctCount}`);
            } else {
                updatedLines.push(line);
            }
        }
        fs.writeFileSync(settingsPath, updatedLines.join('\n'), 'utf8');
        await executeScript(scriptPath);
        const outFiles = fs.readdirSync(outputPath);
        data.outputFiles = outFiles;
        if (data.projectDetails.projectName && data.projectDetails.groupName) {
            await PreSave.findOneAndUpdate(
                {
                    projectName: data.projectDetails.projectName,
                    groupName: data.projectDetails.groupName,
                    moduleName: 'Database Analytics',
                    subModule: 'Distinct Column Length',
                },
                {
                    config: data.config,
                    checkedEntities: data.checkedEntities,
                    inputFiles: data.inputFiles,
                    outputFiles: data.outputFiles,
                    distinctCount: data.distinctCount,
                    user: req.user.id,
                },
                { new: true, upsert: true }
            );
        }
        // Copy output files to shared output folder
        await copyFiles(outputPath, trgOutput);
        const outputData = await readOutputFiles(outputPath);
        res.status(200).json({ message: "success", outputData });
    } catch (error) {
        res.status(500).json({ error: error });
    }
})

router.post('/distinctColumnValues', authMiddleware, setUploadType('distinctColumnValues'), removeOldFiles, upload.array("files"), async (req, res) => {
    try {
        const data = JSON.parse(req.body.data);
        const files = req.files;
        const baseModulePath = path.join(__dirname, '..', 'uploads', 'modules', 'databaseAnalytics', 'Distinct_Column_Values');
        const srcInput = path.join(baseModulePath, 'Inputs');
        const trgInput = path.join(__dirname, '..', 'uploads', 'Inputs');
        const outputPath = path.join(baseModulePath, 'Outputs');
        if (files?.length) {
            await copyFiles(srcInput, trgInput);
        }
        if (data.inputFiles?.length) {
            await Promise.all(
                data.inputFiles.map(({ name }) => {
                    const src = path.join(trgInput, name);
                    const dest = path.join(srcInput, name);
                    return fsPromises.copyFile(src, dest);
                })
            );
        }
        const trgOutput = path.join(__dirname, '..', 'uploads', 'Outputs');
        const scriptPath = path.join(__dirname, '..', 'uploads', 'modules', 'databaseAnalytics', 'Distinct_Column_Values', 'Scripts', 'Component_2_Source_distinct_attribute_values_count_v1.py');
        const settingsPath = path.join(__dirname, '..', 'uploads', 'modules', 'databaseAnalytics', 'Distinct_Column_Values', 'Scripts', 'Settings_Component_2.py');
        const lines = fs.readFileSync(settingsPath, 'utf8').split('\n');
        const folderMain = path.join(__dirname, '..', 'uploads', 'modules');
        let updatedLines = [];

        for (let line of lines) {
            if (line.startsWith('folder_main_path')) {
                updatedLines.push(`folder_main_path = "${folderMain.replace(/\\/g, '\\\\')}"`);
            } else if (line.startsWith('count_of_distinct_values_per_column')) {
                updatedLines.push(`count_of_distinct_values_per_column = ${data.distinctCount}`);
            } else {
                updatedLines.push(line);
            }
        }
        fs.writeFileSync(settingsPath, updatedLines.join('\n'), 'utf8');
        await executeScript(scriptPath);
        const outFiles = fs.readdirSync(outputPath);
        data.outputFiles = outFiles;
        if (data.projectDetails.projectName && data.projectDetails.groupName) {
            await PreSave.findOneAndUpdate(
                {
                    projectName: data.projectDetails.projectName,
                    groupName: data.projectDetails.groupName,
                    moduleName: 'Database Analytics',
                    subModule: 'Distinct Column Values',
                },
                {
                    config: data.config,
                    checkedEntities: data.checkedEntities,
                    inputFiles: data.inputFiles,
                    distinctCount: data.distinctCount,
                    outputFiles: data.outputFiles,
                    user: req.user.id,
                },
                { new: true, upsert: true }
            );
        }
        // Copy output files to shared output folder
        await copyFiles(outputPath, trgOutput);
        const outputData = await readOutputFiles(outputPath);
        res.status(200).json({ message: "success", outputData });
    } catch (error) {
        res.status(500).json({ error: error });
    }
})


router.post('/columnEachCharCount', authMiddleware, setUploadType('columnEachCharCount'), removeOldFiles, upload.array("files"), async (req, res) => {
    try {
        const data = JSON.parse(req.body.data);
        const files = req.files;
        const baseModulePath = path.join(__dirname, '..', 'uploads', 'modules', 'databaseAnalytics', 'Column_Each_Char_Count');
        const srcInput = path.join(baseModulePath, 'Inputs');
        const trgInput = path.join(__dirname, '..', 'uploads', 'Inputs');
        const outputPath = path.join(baseModulePath, 'Outputs');
        if (files?.length) {
            await copyFiles(srcInput, trgInput);
        }
        if (data.inputFiles?.length) {
            await Promise.all(
                data.inputFiles.map(({ name }) => {
                    const src = path.join(trgInput, name);
                    const dest = path.join(srcInput, name);
                    return fsPromises.copyFile(src, dest);
                })
            );
        }
        const trgOutput = path.join(__dirname, '..', 'uploads', 'Outputs');
        const scriptPath = path.join(__dirname, '..', 'uploads', 'modules', 'databaseAnalytics', 'Column_Each_Char_Count', 'Scripts', 'Component_4_Source_Attributes_each_character_value_count_v1.py');
        const settingsPath = path.join(__dirname, '..', 'uploads', 'modules', 'databaseAnalytics', 'Column_Each_Char_Count', 'Scripts', 'Settings_Component_4.py');
        const lines = fs.readFileSync(settingsPath, 'utf8').split('\n');
        const folderMain = path.join(__dirname, '..', 'uploads', 'modules');
        let updatedLines = [];

        for (let line of lines) {
            if (line.startsWith('folder_main_path')) {
                updatedLines.push(`folder_main_path = "${folderMain.replace(/\\/g, '\\\\')}"`);
            } else if (line.startsWith('count_of_distinct_values_per_column')) {
                updatedLines.push(`count_of_distinct_values_per_column = ${data.ColumnCharSettings.distinctCount}`);
            } else if (line.startsWith('max_char_loop_per_columm')) {
                updatedLines.push(`max_char_loop_per_columm = ${data.ColumnCharSettings.maxCharLoop}`);
            } else {
                updatedLines.push(line);
            }
        }
        fs.writeFileSync(settingsPath, updatedLines.join('\n'), 'utf8');
        await executeScript(scriptPath);
        const outFiles = fs.readdirSync(outputPath);
        data.outputFiles = outFiles;
        if (data.projectDetails.projectName && data.projectDetails.groupName) {
            await PreSave.findOneAndUpdate(
                {
                    projectName: data.projectDetails.projectName,
                    groupName: data.projectDetails.groupName,
                    moduleName: 'Database Analytics',
                    subModule: 'Column Each Char Count',
                },
                {
                    config: data.config,
                    checkedEntities: data.checkedEntities,
                    inputFiles: data.inputFiles,
                    distinctCount: data.ColumnCharSettings.distinctCount,
                    maxCharLoop: data.ColumnCharSettings.maxCharLoop,
                    outputFiles: data.outputFiles,
                    user: req.user.id,
                },
                { new: true, upsert: true }
            );
        }
        // Copy output files to shared output folder
        await copyFiles(outputPath, trgOutput);
        const outputData = await readOutputFiles(outputPath);
        console.log("Output Data:", outputData.map(data => data.data));
        res.status(200).json({ message: "success", outputData });
    } catch (error) {
        res.status(500).json({ error: error });
    }
})

// Subset Relations 
router.post('/subsetRelation', setUploadType('subsetRelation'), authMiddleware, removeOldFiles, upload.array("files"), async (req, res) => {
    try {
        const data = JSON.parse(req.body.data);
        const files = req.files;
        const baseModulePath = path.join(__dirname, '..', 'uploads', 'modules', 'databaseAnalytics', 'Subset_Relations');
        const srcInput = path.join(baseModulePath, 'Inputs');
        const trgInput = path.join(__dirname, '..', 'uploads', 'Inputs');
        const outputPath = path.join(baseModulePath, 'Outputs');
        if (files?.length) {
            await copyFiles(srcInput, trgInput);
        }
        if (data.inputFiles?.length) {
            await Promise.all(
                data.inputFiles.map(({ name }) => {
                    const src = path.join(trgInput, name);
                    const dest = path.join(srcInput, name);
                    return fsPromises.copyFile(src, dest);
                })
            );
        }
        const trgOutput = path.join(__dirname, '..', 'uploads', 'Outputs');
        const scriptPath = path.join(__dirname, '..', 'uploads', 'modules', 'databaseAnalytics', 'Subset_Relations', 'Scripts', 'Component_7_Source_Attributes_foreign_keys_and_subset_relation_v1.py');
        const settingsPath = path.join(__dirname, '..', 'uploads', 'modules', 'databaseAnalytics', 'Subset_Relations', 'Scripts', 'Settings_Component_7.py');
        await writeSettings(settingsPath);
        await executeScript(scriptPath, res);
        const outFiles = fs.readdirSync(outputPath);
        data.outputFiles = outFiles;
        if (data.projectDetails.projectName && data.projectDetails.groupName) {
            await PreSave.findOneAndUpdate(
                {
                    projectName: data.projectDetails.projectName,
                    groupName: data.projectDetails.groupName,
                    moduleName: 'Database Analytics',
                    subModule: 'Subset_Relations',
                },
                {
                    config: data.config,
                    checkedEntities: data.checkedEntities,
                    inputFiles: data.inputFiles,
                    outputFiles: data.outputFiles,
                    user: req.user.id,
                },
                { new: true, upsert: true }
            );
        }
        // Copy output files to shared output folder
        await copyFiles(outputPath, trgOutput);
        const outputData = await readOutputFiles(outputPath);
        res.status(200).json({ message: "success", outputData });
    } catch (error) {
        res.status(500).json({ error: error });
    }
})

router.post('/substrConcatAllEntities', authMiddleware, setUploadType('substrConcatAllEntities'), removeOldFiles, upload.array("files"), async (req, res) => {
    try {
        const data = JSON.parse(req.body.data);
        const files = req.files;
        const baseModulePath = path.join(__dirname, '..', 'uploads', 'modules', 'databaseAnalytics', 'Substr_and_Concat_All_Entities');
        const srcInput = path.join(baseModulePath, 'Inputs');
        const trgInput = path.join(__dirname, '..', 'uploads', 'Inputs');
        const outputPath = path.join(baseModulePath, 'Outputs');
        if (files?.length) {
            await copyFiles(srcInput, trgInput);
        }
        if (data.inputFiles?.length) {
            await Promise.all(
                data.inputFiles.map(({ name }) => {
                    const src = path.join(trgInput, name);
                    const dest = path.join(srcInput, name);
                    return fsPromises.copyFile(src, dest);
                })
            );
        }
        const trgOutput = path.join(__dirname, '..', 'uploads', 'Outputs');
        const scriptPath = path.join(__dirname, '..', 'uploads', 'modules', 'databaseAnalytics', 'Substr_and_Concat_All_Entities', 'Scripts', 'Component_14B_Source_Attributes_substring_and_concatenation_dependencies_with_all_other_tables_v1.py');
        const settingsPath = path.join(__dirname, '..', 'uploads', 'modules', 'databaseAnalytics', 'Substr_and_Concat_All_Entities', 'Scripts', 'Settings_Component_14B.py');
        const lines = fs.readFileSync(settingsPath, 'utf8').split('\n');
        const folderMain = path.join(__dirname, '..', 'uploads', 'modules');
        let updatedLines = [];

        for (let line of lines) {
            if (line.startsWith('folder_main_path')) {
                updatedLines.push(`folder_main_path = "${folderMain.replace(/\\/g, '\\\\')}"`);
            } else if (line.startsWith('count_of_distinct_values_per_column')) {
                updatedLines.push(`count_of_distinct_values_per_column = ${data.substrEntitiesSettings.distinctCount}`);
            } else if (line.startsWith('nrows_source_var')) {
                updatedLines.push(`nrows_source_var = ${data.substrEntitiesSettings.nrows_source_var}`);
            } else if (line.startsWith('nrows_other_source_var')) {
                updatedLines.push(`nrows_other_source_var = ${data.substrEntitiesSettings.nrows_other_source_var}`);
            } else {
                updatedLines.push(line);
            }
        }
        fs.writeFileSync(settingsPath, updatedLines.join('\n'), 'utf8');
        await executeScript(scriptPath);
        await executeScript(scriptPath, res);
        const outFiles = fs.readdirSync(outputPath);
        data.outputFiles = outFiles;
        if (data.projectDetails.projectName && data.projectDetails.groupName) {
            await PreSave.findOneAndUpdate(
                {
                    projectName: data.projectDetails.projectName,
                    groupName: data.projectDetails.groupName,
                    moduleName: 'Database Analytics',
                    subModule: 'Substr and Concat All Entities',
                },
                {
                    config: data.config,
                    checkedEntities: data.checkedEntities,
                    inputFiles: data.inputFiles,
                    distinctCount: data.substrEntitiesSettings.distinctCount,
                    nrowsSource: data.substrEntitiesSettings.nrows_source_var,
                    nrowsOtherSource: data.substrEntitiesSettings.nrows_other_source_var,
                    outputFiles: data.outputFiles,
                    user: req.user.id,
                },
                { new: true, upsert: true }
            );
        }
        // Copy output files to shared output folder
        await copyFiles(outputPath, trgOutput);
        const outputData = await readOutputFiles(outputPath);
        res.status(200).json({ message: "success", outputData });
    } catch (error) {
        res.status(500).json({ error: error });
    }
})

router.post('/substrConcatColumns', authMiddleware, setUploadType('substrConcatColumns'), removeOldFiles, upload.array("files"), async (req, res) => {
    try {
        const data = JSON.parse(req.body.data);
        const files = req.files;
        const baseModulePath = path.join(__dirname, '..', 'uploads', 'modules', 'databaseAnalytics', 'Substr_and_Concat_Columns');
        const srcInput = path.join(baseModulePath, 'Inputs');
        const trgInput = path.join(__dirname, '..', 'uploads', 'Inputs');
        const outputPath = path.join(baseModulePath, 'Outputs');
        if (files?.length) {
            await copyFiles(srcInput, trgInput);
        }
        if (data.inputFiles?.length) {
            await Promise.all(
                data.inputFiles.map(({ name }) => {
                    const src = path.join(trgInput, name);
                    const dest = path.join(srcInput, name);
                    return fsPromises.copyFile(src, dest);
                })
            );
        }
        const trgOutput = path.join(__dirname, '..', 'uploads', 'Outputs');
        const scriptPath = path.join(__dirname, '..', 'uploads', 'modules', 'databaseAnalytics', 'Substr_and_Concat_Columns', 'Scripts', 'Component_14A_Source_Attributes_substring_and_concatenation_dependencies_v1.py');
        const settingsPath = path.join(__dirname, '..', 'uploads', 'modules', 'databaseAnalytics', 'Substr_and_Concat_Columns', 'Scripts', 'Settings_Component_14A.py');
        const lines = fs.readFileSync(settingsPath, 'utf8').split('\n');
        const folderMain = path.join(__dirname, '..', 'uploads', 'modules');
        let updatedLines = [];

        for (let line of lines) {
            if (line.startsWith('folder_main_path')) {
                updatedLines.push(`folder_main_path = "${folderMain.replace(/\\/g, '\\\\')}"`);
            } else if (line.startsWith('count_of_distinct_values_per_column')) {
                updatedLines.push(`count_of_distinct_values_per_column = ${data.distinctCount}`);
            } else {
                updatedLines.push(line);
            }
        }
        fs.writeFileSync(settingsPath, updatedLines.join('\n'), 'utf8');
        await executeScript(scriptPath);
        const outFiles = fs.readdirSync(outputPath);
        data.outputFiles = outFiles;
        if (data.projectDetails.projectName && data.projectDetails.groupName) {
            await PreSave.findOneAndUpdate(
                {
                    projectName: data.projectDetails.projectName,
                    groupName: data.projectDetails.groupName,
                    moduleName: 'Database Analytics',
                    subModule: 'Substr and Concat Columns',
                },
                {
                    config: data.config,
                    checkedEntities: data.checkedEntities,
                    inputFiles: data.inputFiles,
                    distinctCount: data.distinctCount,
                    outputFiles: data.outputFiles,
                    user: req.user.id,
                },
                { new: true, upsert: true }
            );
        }
        // Copy output files to shared output folder
        await copyFiles(outputPath, trgOutput);
        const outputData = await readOutputFiles(outputPath);
        res.status(200).json({ message: "success", outputData });
    } catch (error) {
        res.status(500).json({ error: error });
    }
})

router.post('/equalColumns', authMiddleware, setUploadType('equalColumns'), removeOldFiles, upload.array("files"), async (req, res) => {
    try {
        const data = JSON.parse(req.body.data);
        const files = req.files;
        const baseModulePath = path.join(__dirname, '..', 'uploads', 'modules', 'databaseAnalytics', 'Equal_Columns');
        const srcInput = path.join(baseModulePath, 'Inputs');
        const trgInput = path.join(__dirname, '..', 'uploads', 'Inputs');
        const outputPath = path.join(baseModulePath, 'Outputs');
        if (files?.length) {
            await copyFiles(srcInput, trgInput);
        }
        if (data.inputFiles?.length) {
            await Promise.all(
                data.inputFiles.map(({ name }) => {
                    const src = path.join(trgInput, name);
                    const dest = path.join(srcInput, name);
                    return fsPromises.copyFile(src, dest);
                })
            );
        }
        const trgOutput = path.join(__dirname, '..', 'uploads', 'Outputs');
        const scriptPath = path.join(__dirname, '..', 'uploads', 'modules', 'databaseAnalytics', 'Equal_Columns', 'Scripts', 'Component_15_Apr_2023_15_Source_Attributes_Equal_dependencies_v1.py');
        const settingsPath = path.join(__dirname, '..', 'uploads', 'modules', 'databaseAnalytics', 'Equal_Columns', 'Scripts', 'Settings_Component_15.py');
        const lines = fs.readFileSync(settingsPath, 'utf8').split('\n');
        const folderMain = path.join(__dirname, '..', 'uploads', 'modules');
        let updatedLines = [];

        for (let line of lines) {
            if (line.startsWith('folder_main_path')) {
                updatedLines.push(`folder_main_path = "${folderMain.replace(/\\/g, '\\\\')}"`);
            } else if (line.startsWith('count_of_distinct_values_per_column')) {
                updatedLines.push(`count_of_distinct_values_per_column = ${data.distinctCount}`);
            } else {
                updatedLines.push(line);
            }
        }
        fs.writeFileSync(settingsPath, updatedLines.join('\n'), 'utf8');
        await executeScript(scriptPath);
        const outFiles = fs.readdirSync(outputPath);
        data.outputFiles = outFiles;
        if (data.projectDetails.projectName && data.projectDetails.groupName) {
            await PreSave.findOneAndUpdate(
                {
                    projectName: data.projectDetails.projectName,
                    groupName: data.projectDetails.groupName,
                    moduleName: 'Database Analytics',
                    subModule: 'Equal Columns',
                },
                {
                    config: data.config,
                    checkedEntities: data.checkedEntities,
                    inputFiles: data.inputFiles,
                    distinctCount: data.distinctCount,
                    outputFiles: data.outputFiles,
                    user: req.user.id,
                },
                { new: true, upsert: true }
            );
        }
        // Copy output files to shared output folder
        await copyFiles(outputPath, trgOutput);
        const outputData = await readOutputFiles(outputPath);
        res.status(200).json({ message: "success", outputData });
    } catch (error) {
        res.status(500).json({ error: error });
    }
})

router.post('/distinctPOS', authMiddleware, setUploadType('distinctPOS'), removeOldFiles, upload.array("files"), async (req, res) => {
    try {
        const data = JSON.parse(req.body.data);
        const files = req.files;
        const baseModulePath = path.join(__dirname, '..', 'uploads', 'modules', 'databaseAnalytics', 'Distinct_POS');
        const srcInput = path.join(baseModulePath, 'Inputs');
        const trgInput = path.join(__dirname, '..', 'uploads', 'Inputs');
        const outputPath = path.join(baseModulePath, 'Outputs');
        if (files?.length) {
            await copyFiles(srcInput, trgInput);
        }
        if (data.inputFiles?.length) {
            await Promise.all(
                data.inputFiles.map(({ name }) => {
                    const src = path.join(trgInput, name);
                    const dest = path.join(srcInput, name);
                    return fsPromises.copyFile(src, dest);
                })
            );
        }
        const trgOutput = path.join(__dirname, '..', 'uploads', 'Outputs');
        const scriptPath = path.join(__dirname, '..', 'uploads', 'modules', 'databaseAnalytics', 'Distinct_POS', 'Scripts', 'Component_16_Source_Attribute_POS_v1.py');
        const settingsPath = path.join(__dirname, '..', 'uploads', 'modules', 'databaseAnalytics', 'Distinct_POS', 'Scripts', 'Settings_Component_16.py');
        await writeSettings(settingsPath);
        await executeScript(scriptPath);
        const outFiles = fs.readdirSync(outputPath);
        data.outputFiles = outFiles;
        if (data.projectDetails.projectName && data.projectDetails.groupName) {
            await PreSave.findOneAndUpdate(
                {
                    projectName: data.projectDetails.projectName,
                    groupName: data.projectDetails.groupName,
                    moduleName: 'Database Analytics',
                    subModule: 'Distinct POS',
                },
                {
                    config: data.config,
                    checkedEntities: data.checkedEntities,
                    inputFiles: data.inputFiles,
                    outputFiles: data.outputFiles,
                    user: req.user.id,
                },
                { new: true, upsert: true }
            );
        }
        // Copy output files to shared output folder
        await copyFiles(outputPath, trgOutput);
        const outputData = await readOutputFiles(outputPath);
        res.status(200).json({ message: "success", outputData });
    } catch (error) {
        res.status(500).json({ error: error });
    }
})

router.post('/tableNamesGap', authMiddleware, setUploadType('tableNamesGap'), removeOldFiles, upload.array("files"), async (req, res) => {
    try {
        const data = JSON.parse(req.body.data);
        const files = req.files;
        const baseModulePath = path.join(__dirname, '..', 'uploads', 'modules', 'databaseAnalytics', 'Table_Names_Gap');
        const srcInput = path.join(baseModulePath, 'Inputs');
        const trgInput = path.join(__dirname, '..', 'uploads', 'Inputs');
        const outputPath = path.join(baseModulePath, 'Outputs');
        if (files?.length) {
            await copyFiles(srcInput, trgInput);
        }
        if (data.inputFiles?.length) {
            await Promise.all(
                data.inputFiles.map(({ name }) => {
                    const src = path.join(trgInput, name);
                    const dest = path.join(srcInput, name);
                    return fsPromises.copyFile(src, dest);
                })
            );
        }
        const trgOutput = path.join(__dirname, '..', 'uploads', 'Outputs');
        const scriptPath = path.join(__dirname, '..', 'uploads', 'modules', 'databaseAnalytics', 'Table_Names_Gap', 'Scripts', 'Component_5A_Source_Name_Definition_Filling_Gaps_v1.py');
        const settingsPath = path.join(__dirname, '..', 'uploads', 'modules', 'databaseAnalytics', 'Table_Names_Gap', 'Scripts', 'Settings_Component_5A.py');
        await writeSettings(settingsPath);
        await executeScript(scriptPath);
        const outFiles = fs.readdirSync(outputPath);
        data.outputFiles = outFiles;
        if (data.projectDetails.projectName && data.projectDetails.groupName) {
            await PreSave.findOneAndUpdate(
                {
                    projectName: data.projectDetails.projectName,
                    groupName: data.projectDetails.groupName,
                    moduleName: 'Database Analytics',
                    subModule: 'Table Names Gap',
                },
                {
                    config: data.config,
                    checkedEntities: data.checkedEntities,
                    inputFiles: data.inputFiles,
                    outputFiles: data.outputFiles,
                    user: req.user.id,
                },
                { new: true, upsert: true }
            );
        }
        // Copy output files to shared output folder
        await copyFiles(outputPath, trgOutput);
        const outputData = await readOutputFiles(outputPath);
        res.status(200).json({ message: "success", outputData });
    } catch (error) {
        res.status(500).json({ error: error });
    }
})

router.post('/tableNamesMissing', authMiddleware, setUploadType('tableNamesMissing'), removeOldFiles, upload.array("files"), async (req, res) => {
    try {
        const data = JSON.parse(req.body.data);
        const files = req.files;
        const baseModulePath = path.join(__dirname, '..', 'uploads', 'modules', 'databaseAnalytics', 'Table_Names_Missing');
        const srcInput = path.join(baseModulePath, 'Inputs');
        const trgInput = path.join(__dirname, '..', 'uploads', 'Inputs');
        const outputPath = path.join(baseModulePath, 'Outputs');
        if (files?.length) {
            await copyFiles(srcInput, trgInput);
        }
        if (data.inputFiles?.length) {
            await Promise.all(
                data.inputFiles.map(({ name }) => {
                    const src = path.join(trgInput, name);
                    const dest = path.join(srcInput, name);
                    return fsPromises.copyFile(src, dest);
                })
            );
        }
        const trgOutput = path.join(__dirname, '..', 'uploads', 'Outputs');
        const scriptPath = path.join(__dirname, '..', 'uploads', 'modules', 'databaseAnalytics', 'Table_Names_Missing', 'Scripts', 'Component_5B_Source_Name_extract_meanings_v1.py');
        const settingsPath = path.join(__dirname, '..', 'uploads', 'modules', 'databaseAnalytics', 'Table_Names_Missing', 'Scripts', 'Settings_Component_5B.py');
        await writeSettings(settingsPath);
        await executeScript(scriptPath);
        const outFiles = fs.readdirSync(outputPath);
        data.outputFiles = outFiles;
        if (data.projectDetails.projectName && data.projectDetails.groupName) {
            await PreSave.findOneAndUpdate(
                {
                    projectName: data.projectDetails.projectName,
                    groupName: data.projectDetails.groupName,
                    moduleName: 'Database Analytics',
                    subModule: 'Table Names Missing',
                },
                {
                    config: data.config,
                    checkedEntities: data.checkedEntities,
                    inputFiles: data.inputFiles,
                    outputFiles: data.outputFiles,
                    user: req.user.id,
                },
                { new: true, upsert: true }
            );
        }
        // Copy output files to shared output folder
        await copyFiles(outputPath, trgOutput);
        const outputData = await readOutputFiles(outputPath);
        res.status(200).json({ message: "success", outputData });
    } catch (error) {
        res.status(500).json({ error: error });
    }
})

module.exports = router;