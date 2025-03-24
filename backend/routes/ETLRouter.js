const express = require('express');
const authMiddleware = require('../controller/AuthMiddleware');
const path = require('path');
const fsPromises = require('fs').promises;
const { parse } = require('json2csv');
const { spawn } = require('child_process');



require('dotenv').config();
const router = express.Router();

const placeMappingSheet = async (filteredSchema, mappingsheetDirectory) => {
    const mappingsheetFields = filteredSchema.map((item, index) => ({
        Mapping_Target_Key_Number: index + 1,
        Data_Source_Name: item.datasource,
        Source_Entity: item.sourceEntity,
        Source_Entity_Alias_Name: item.sourceEntityAlias,
        Source_Attribute: item.sourceAttribute,
        Filter_Transformation_Condition_Language: item.filterTransformationConditionLanguage,
        Filter_Transformation_Condition: item.filterCondition,
        Transformation_Rule_Language: item.transformationRuleLanguage,
        Transformation_Rule: item.transformationRule,
        Target_Attribute: item.targetAttribute,
        Part_of_Unique_Key: item.partOfUniqueKey,
        Order_by_priority_number: item.orderByPriorityNumber,
        Order_By: item.orderBy,
        Data_Type: item.dataType,
        Mandatory: item.mandatory,
        Min_Length: item.minLength,
        Max_Length: item.maxLength,
        Scale: item.scale,
        Precision: item.precision,
        Format: item.format
    }))
    try {
        const csv = parse(mappingsheetFields);
        await fsPromises.writeFile(mappingsheetDirectory, csv);
        console.log('CSV file created successfully for Mapping Sheet!');
        return true;
    } catch (err) {
        console.error('Error writing Mapping Sheet to CSV:', err);
        return false;
    }
};

const placeSourceRelation = async (sourceRelation, sourceRelationPath) => {
    const sourceRelationFields = sourceRelation.map((item, index) => ({
        Relationship_Key_Number: index + 1,
        Data_Source_Name_Left: item.leftDatasource,
        Source_Left_Entity: item.leftSourceEntity,
        Left_Entity_Alias_Name: item.leftSourceEntityAlias,
        Source_Left_Entity_Extraction_Bundle: item.sourceLeftEntityExtractionBundle,
        Left_Alias_Type_Of_Data_Store: item.leftAliasTypeOfDataStore,
        Left_Attribute: item.leftSourceAttribute,
        Left_Filter_Transformation_Rule_Language: item.leftFilterTransformationRuleLanguage,
        Left_Filter_Transformation_Rule: item.leftFilterTransformationRule,
        Alias_Relationship_Type_Language: item.aliasRelationshipTypeLanguage,
        Alias_Relationship_Type: item.aliasRelationshipType,
        Alias_Attribute_Relationship_Filter_Condition_Language: item.aliasAttributeRelationshipFilterConditionLanguage,
        Alias_Attribute_Relationship_Filter_Condition: item.aliasAttributeRelationshipFilterCondition,
        Join_Method_Language: item.joinMethodLanguage,
        Join_Method: item.joinMethod,
        Data_Source_Name_Right: item.rightDatasource,
        Source_Right_Entity: item.rightSourceEntity,
        Right_Entity_Alias_Name: item.rightSourceEntityAlias,
        Source_Right_Entity_Extraction_Bundle: item.sourceRightEntityExtractionBundle,
        Right_Alias_Type_Of_Data_Store: item.rightAliasTypeOfDataStore,
        Right_Attribute: item.rightSourceAttribute,
        Right_Filter_Transformation_Rule_Language: item.rightFilterTransformationRuleLanguage,
        Right_Filter_Transformation_Rule: item.rightFilterTransformationRule,
        Target_Temp_Output_Number: item.targetTempOutputNumber,
        Relationship_Type: item.relationshipType,
        Left_To_Right_Set_Information: item.leftToRightSetInformation,
        Target_Temp_Type_Of_Data_Store: item.targetTempTypeOfDataStore,
        Target_Datasource_Name: item.targetDatasourceName,
        Target_Name: item.targetName,
        Load_Option: item.loadOption,
        Order_By: item.orderBy,
        Parallel_Bundles_Extraction_Priority: item.parallelBundlesExtractionPriority,
        Parallel_Bundles_Transformation: item.parallelBundlesTransformation,
        Parallel_Bundles_Load: item.parallelBundlesLoad,
        Parallel_Bundles_Load_Priority: item.parallelBundlesLoadPriority
    }))
    try {
        const csv = parse(sourceRelationFields);
        await fsPromises.writeFile(sourceRelationPath, csv);
        console.log('CSV file created successfully for Source Relation!');
        return true;
    } catch (err) {
        console.error('Error writing Source Relation to CSV:', err);
        return false;
    }
}

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


router.post('/ETLCall', authMiddleware, async (req, res) => {  
    try {
        const mappingsheetDirectory = path.join(__dirname, '..', 'uploads', 'Project_1', 'Group_1', 'Relation_sheets', 'Mapping_table.csv');
        const sourceRelationPath = path.join(__dirname, '..', 'uploads', 'Project_1', 'Group_1', 'Relation_sheets', 'Source_Relations.csv');
        
        const { filteredSchema, sourceRelation } = req.body;

        if (!filteredSchema || !sourceRelation) {
            return res.status(400).json({ error: "Missing required fields: filteredSchema or sourceRelation" });
        }

        // Place data into CSV files
        const mappingSheet = await placeMappingSheet(filteredSchema, mappingsheetDirectory);
        const sourceRelationSheet = await placeSourceRelation(sourceRelation, sourceRelationPath);

        if (!mappingSheet || !sourceRelationSheet) {
            return res.status(500).json({ error: "Failed to create CSV files" });
        }

        console.log("CSV files created successfully");

        // Execute the ETL script
        const result = await executeScript('C:/Python_Code/Apr_2023_31_Data_Extract_Code_Generate_v1077m.py');
        console.log("Script Execution Result:", result);

        res.status(200).json({ message: "ETL process completed successfully", output: result });

    } catch (error) {
        console.error("ETL Process Error:", error);
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
});

module.exports = router;