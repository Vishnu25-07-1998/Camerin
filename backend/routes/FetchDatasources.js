const express = require('express');
const User = require('../models/User');
const DatabaseConnection = require('../models/DatabaseConnection');
const authMiddleware = require('../controller/AuthMiddleware');
const path = require('path');
const fsPromises = require('fs').promises;
const fs = require('fs');
const { parse } = require('json2csv');
const { Client } = require('pg');
const { Pool } = require('pg');
const mysql = require('mysql2/promise');


const Entities_1 = path.join(__dirname, '..', 'uploads', 'Entities_1');

require('dotenv').config();
const router = express.Router();



const datasourceCSVpath = path.join(__dirname, '..', 'uploads', 'Relation_sheets', 'Data_Source_Names.csv');

const createDirectoriesIfNeeded = async (filePath) => {
    const dir = path.dirname(filePath);
    try {
        await fsPromises.mkdir(dir, { recursive: true });
    } catch (err) {
        console.error('Error creating directories:', err);
        throw err;
    }
};

// Render Datasource Names and create a csv file of datasources
router.get('/datasources', authMiddleware, async (req, res) => {
    const userId = req.user.id;

    try {
        // Fetch database connections for the user
        const databaseConnections = await DatabaseConnection.find({ user: userId });

        // Add local folder details
        const folderDetails = {
            datasource: 'Computer_Files',
            dbtechnology: 'Folder_csv',
            database: `${Entities_1}\\`,
            hostname: 'Not valid',
            port: 'Not valid',
            username: 'Not valid',
            dbpassword: 'Not valid',
        };
        databaseConnections.push(folderDetails);

        if (databaseConnections.length === 0) {
            return res.status(404).json({ message: 'No data sources found' });
        }

        // Map data to CSV format
        const datasourceFields = databaseConnections.map((db, index) => ({
            Sl_No: index + 1,
            Data_Source_Name: db.datasource,
            DB_URL: db.dbtechnology,
            Database_Name: db.database,
            Host_Name: db.hostname,
            Port_Number: db.port,
            Username: db.username,
            Password: db.dbpassword,
        }));

        await createDirectoriesIfNeeded(datasourceCSVpath);

        // Convert to CSV and write to file
        const csv = parse(datasourceFields);
        await fsPromises.writeFile(datasourceCSVpath, csv);
        // console.log('CSV file created successfully!');
        res.json(databaseConnections);
    } catch (error) {
        console.error('Error fetching data sources or creating CSV:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


router.post('/dbconnect', authMiddleware, async (req, res) => {
    const { datasource, dbtechnology, user, hostname, port, database, dbpassword } = req.body;
    const userId = req.user.id;
    try {
        switch (dbtechnology) {
            case "mysql+pymysql":
                await connectMySQL({ hostname, port, user, database, dbpassword });
                break;
            case "postgresql+psycopg2":
                await connectPostgres({ hostname, port, user, database, dbpassword });
                break;
            default:
                return res.status(402).json({ message: "Unsupported database technology" });
        }

        await db_Save({ datasource, dbtechnology, database, hostname, port, user, dbpassword, userId });
        return res.status(200).json({ message: "Connection saved successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})


async function connectMySQL({ hostname, port, user, database, dbpassword }) {
    try {
        const connection = await mysql.createConnection({
            host: hostname,
            port: port || 3306,
            user: user,
            database: database,
            password: dbpassword,
        });

        await connection.ping();
        // console.log("Connected to MySQL database successfully!");
        await connection.end();
        return true;
    } catch (error) {
        console.error("MySQL Connection error:", error);
        throw new Error("Failed to connect to the MySQL database");
    }
}

async function connectPostgres({ hostname, port, user, database, dbpassword }) {
    const pool = new Pool({
        host: hostname,
        port: port || 5432,
        user: user,
        database: database,
        password: dbpassword,
    });

    try {
        const client = await pool.connect();
        // console.log("Connected to PostgreSQL database successfully!");
        client.release();
        await pool.end();
        return true;
    } catch (error) {
        console.error("PostgreSQL Connection error:", error);
        throw new Error("Failed to connect to the PostgreSQL database");
    }
}

async function db_Save({ datasource, dbtechnology, database, hostname, port, user, dbpassword, userId }) {
    try {
        const existingEntry = await DatabaseConnection.findOne({ datasource });

        if (!existingEntry) {
            const dbConnection = new DatabaseConnection({
                datasource,
                dbtechnology,
                database,
                hostname,
                port,
                username: user,
                dbpassword,
                user: userId
            });

            await dbConnection.save();
            return true;
        } else {
            throw new Error("Datasource Exists.");
        }
    } catch (error) {
        console.error("Error saving database connection details:", error);
        throw new Error(error);
    }
}

// fetching tables and its datas
router.post('/dbtables', authMiddleware, async (req, res) => {
    const { config } = req.body;
    // console.log(config);
    if (!config || config.length === 0) {
        return res.status(400).json({ message: 'No data sources selected' });
    }
    const postgres = config.postgres;
    const mySql = config.mySql;
    let tableData = {};

    try {
        if (postgres) {
            const queryDatabaseConnection = await queryDatabase(postgres);
            const datas = await queryPostgresDB(queryDatabaseConnection);
            tableData[postgres] = datas;
            // console.log("tableData = ", tableData);
        }

        if (mySql) {
            const queryDatabaseConnection = await queryDatabase(mySql);
            const datas = await queryMysqlDB(queryDatabaseConnection);
            tableData[mySql] = datas;
            // console.log("tableData = ", tableData);
        }

        setTimeout(() => {
            return res.status(200).json(tableData);
        }, 2000);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while retrieving data' });
    }
})

const queryDatabase = async (datasource) => {
    return await DatabaseConnection.findOne({ datasource });
};

const queryPostgresDB = async (creds) => {
    const client = new Client({
        user: creds['username'],
        host: creds['hostname'],
        database: creds['database'],
        password: creds['dbpassword'],
        port: creds['port'],
    })
    try {
        await client.connect();
        const tables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema='public' AND table_type='BASE TABLE'
        `);
        let tableDetails = [];
        for (const table of tables.rows) {
            const tableName = table.table_name;
            const result = await client.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = '${tableName}'
                ORDER BY ordinal_position;
            `);
            const columns = result.rows.map(row => row.column_name);
            tableDetails.push({ tableName, columns });
        }
        return tableDetails;
    } catch (err) {
        console.error('Error executing query', err.stack);
    } finally {
        await client.end();
    }
}

const queryMysqlDB = async (creds) => {
    const connection = await mysql.createConnection({
        user: creds['username'],
        host: creds['hostname'],
        database: creds['database'],
        password: creds['dbpassword'],
        port: creds['port']
    })
    try {
        const [tables] = await connection.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = ?
        `, [creds['database']]);
        let tableDetails = [];
        for (const table of tables) {
            const tableName = table.TABLE_NAME;
            const [columns] = await connection.query(`
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = ? 
                AND TABLE_NAME = ?
            `, [creds['database'], tableName]);

            const columnNames = columns.map(row => row.COLUMN_NAME);
            tableDetails.push({ tableName, columns: columnNames });
        }
        return tableDetails;
    } catch (err) {
        console.error('Error executing query', err.stack);
    } finally {
        await connection.end();
    }
}


module.exports = router;