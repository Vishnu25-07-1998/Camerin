import { useState, useEffect, useRef, useContext } from 'react';
import postgresIcon from '../../assets/db/icons8-postgresql.svg';
import mysqlIcon from '../../assets/db/icons8-mysql.svg';
import folderIcon from '../../assets/db/icons8-folder.svg';
import SelectDatasource from '../../widgets/customWidgets/datasourceSelect/SelectDatasource';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import CheckIcon from '@mui/icons-material/Check';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileCsv } from "@fortawesome/free-solid-svg-icons";
import MappingSheet from '../../components/ETL/MappingSheet';
import SourceRelationSheet from '../../components/ETL/SourceRelationSheet';
import './etlSheet.css';
import UpdateSourceRelation from '../../components/ETL/UpdateSourceRelation';
import ClearIcon from '@mui/icons-material/Clear';
import ETLModal from '../../components/modals/ETLModal';
import MappingError from '../../components/ETL/MappingError';
import SourceRelationError from '../../components/ETL/SourceRelationError';
import sidebarStyles from '../../components/layouts/secondarysidebar.module.css'
import Navbar from '../../components/layouts/Navbar';
import ProcessingModal from '../../components/modals/ProcessingModal';


const HighLevel = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    const { authState } = useContext(AuthContext);
    const [schemaEntries, setschemaEntries] = useState([]);
    const [filteredSchema, setFilteredSchema] = useState([]);
    const [sourceRelation, setSourceRelation] = useState([]);
    const [datasources, setDatasources] = useState([]);
    const [config, setConfig] = useState({
        postgres: '',
        mySql: '',
        folder: '',
    });
    const [folder, setFolder] = useState(false);
    const [fetchedTables, setFetchedTables] = useState({});
    const [checkedEntities, setCheckedEntities] = useState([]);
    const [computerFiles, setComputerFiles] = useState([]);
    const [openETLModal, closeETLModal] = useState(false);
    const [mappingErrors, setMappingErrors] = useState([]);
    const [sourceRelationErrors, setSourceRelationError] = useState([]);
    const [updatedSourceRelation, updateSourceRelation] = useState({});
    const [executing, setExecution] = useState(false);
    const fileInputRef = useRef(null);
    const [selectedModule, selectModule] = useState("Create ETL Mapping Sheet");
    const category = "High Level Design/Mapping";
    const items = [
        'Create ETL Mapping Sheet',
    ];

    // Fetch datasources
    useEffect(() => {
        const fetchDataSources = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/datasourceroute/datasources`, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authState.token}`,
                    },
                });
                setDatasources(response.data);
            } catch (error) {
                console.error('Error fetching data sources:', error);
                alert("Connection error: " + (error.response?.data?.message || error.message));
            }
        };

        fetchDataSources();
    }, [authState.token]);
    // datasources of different DBs
    const postgresDatasources = datasources.filter(ds => ds.dbtechnology.includes('postgresql+psycopg2'));
    const mysqlDatasources = datasources.filter(ds => ds.dbtechnology.includes('mysql+pymysql'));
    const foldersource = [{ _id: 'xxx', datasource: 'Computer Files', dbtechnology: 'xxx', database: 'xxx', hostname: 'xxx' }];
    //select Datasource
    const selectDatasource = (e, field) => {
        const { value } = e.target;
        setConfig(prev => ({
            ...prev,
            [field]: value
        }))
    }
    //Fetch tables using selected datasource
    const handleDatasourceSubmit = async (e) => {
        e.preventDefault();
        setFolder(!!config.folder);
        if (!config.postgres && !config.mySql && !config.folder) {
            console.log("Config is empty, not sending request.");
            return;
        }
        try {
            const response = await axios.post(`${API_URL}/api/datasourceroute/dbtables`,
                { config },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authState.token}`,
                    },
                });
            setFetchedTables(response.data);
        } catch (error) {
            console.error('Error fetching data sources:', error);
        }
    };
    // checkbox to select entities
    const handleCheckboxChange = (datasource, tableName, index) => {
        const uniqueKey = `${datasource}_${tableName}_${index}`;
        setCheckedEntities((prevData) => {
            const itemIndex = prevData.findIndex(item => item.key === uniqueKey);
            if (itemIndex > -1) {
                return prevData.filter((_, index) => index !== itemIndex);
            } else {
                return [...prevData, { key: uniqueKey, datasource, tableName }];
            }
        })
    }
    //label when clicked invoke file updoad
    const handleLabelClick = () => {
        fileInputRef.current.click();
    };
    // onchange for file upload
    const changeHandler = (event) => {
        const newFiles = Array.from(event.target.files);
        setComputerFiles(prevFiles => {
            const uniqueNewFiles = newFiles.filter(
                newFile => !prevFiles.some(prevFile => prevFile.name === newFile.name)
            );
            return [...prevFiles, ...uniqueNewFiles];
        });
    }
    // Remove Files 
    const removeFile = (file) => {
        setComputerFiles(prevFiles => prevFiles.filter(item => item !== file));
    }
    // submitted selected entities
    const handleEntitySubmit = async (e) => {
        e.preventDefault();
        let newData = [];
        checkedEntities.forEach(entity => {
            const tableData = fetchedTables[entity.datasource];
            if (tableData) {
                tableData.forEach(item => {
                    if (item.tableName === entity.tableName) {
                        newData.push({
                            id: newData.length + 1,
                            datasource: entity.datasource,
                            sourceEntity: item.tableName,
                            sourceAttributes: item.columns
                        });
                    }
                });
            }
        });

        const formData = new FormData();
        computerFiles.forEach(file => {
            formData.append("files", file);
        });

        try {
            const response = await axios.post(`${API_URL}/api/databaseAnalyticsRoute/uploadEntities`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${authState.token}`,
                },
            })
            console.log(response.data);
        } catch (error) {
            console.error("Error:", error);
        }

        if (computerFiles.length > 0) {
            try {
                const filePromises = computerFiles.map(file => {
                    return new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = function (e) {
                            const content = e.target.result;
                            const datasource = "Computer_Files";
                            const lines = content.split("\n").map(line => line.replace(/\r/g, ""));
                            const sourceEntity = file.name.replace(/\.(csv|xlsx)$/i, '');
                            const sourceAttributes = lines[0].split(",").filter(item => item !== null && item !== '');
                            newData.push({
                                id: newData.length + 1,
                                datasource,
                                sourceEntity,
                                sourceAttributes,
                            });
                            resolve();
                        };
                        reader.onerror = function (err) {
                            reject(err);
                        };
                        reader.readAsText(file);
                    });
                });
                await Promise.all(filePromises);
            } catch (error) {
                console.log(error);
            }
        }
        setschemaEntries(newData);
    };

    const handleETLSheet = async () => {
        const requiredMappingFields = [
            { key: "sourceEntity", label: "Source Entity" },
            { key: "sourceEntityAlias", label: "Source Entity Alias" },
            { key: "sourceAttribute", label: "Source Attribute" },
            { key: "datasource", label: "Datasource" },
            { key: "transformationRuleLanguage", label: "Transformation Rule Language" },
            { key: "transformationRule", label: "Transformation Rule" },
        ]
        const targetAttributes = new Set();
        const errorMessages = filteredSchema.reduce((acc, item, index) => {
            requiredMappingFields.forEach(({ key, label }) => {
                if (!item[key]) {
                    acc.push(`Error at row ${index + 1}: ${label} is empty.`);
                }
            });
            if (item.targetAttribute) {
                if (targetAttributes.has(item.targetAttribute)) {
                    acc.push(`Error at row ${index + 1}: Duplicate targetAttribute '${item.targetAttribute}' found.`);
                } else {
                    targetAttributes.add(item.targetAttribute);
                }
            };
            return acc;
        }, []);
        setMappingErrors(errorMessages);

        const sourceRelationFields = [
            { "key": "leftDatasource", "label": "Left Datasource" },
            { "key": "leftSourceEntity", "label": "Left Source Entity" },
            { "key": "leftSourceEntityAlias", "label": "Left Source Entity Alias" },
            { "key": "leftSourceAttribute", "label": "Left Source Attribute" },
            { "key": "leftFilterTransformationRule", "label": "Left Filter Transformation Rule" },
            { "key": "aliasRelationshipType", "label": "Alias Relationship Type" },
            { "key": "aliasAttributeRelationshipFilterCondition", "label": "Alias Attribute Relationship Filter Condition" },
            { "key": "joinMethod", "label": "Join Method" },
            { "key": "rightDatasource", "label": "Right Datasource" },
            { "key": "rightSourceEntity", "label": "Right Source Entity" },
            { "key": "rightSourceEntityAlias", "label": "Right Source Entity Alias" },
            { "key": "rightSourceAttribute", "label": "Right Source Attribute" },
            { "key": "rightFilterTransformationRule", "label": "Right Filter Transformation Rule" },
            { "key": "targetTempOutputNumber", "label": "Target Temp Output Number" },
            { "key": "targetTempTypeOfDataStore", "label": "Target Temp Type Of Data Store" }
        ]
        const errors = sourceRelation.reduce((acc, item, index) => {
            sourceRelationFields.forEach(({ key, label }) => {
                if (!item[key]) {
                    acc.push(`Error at row ${index + 1}: ${label} is empty.`);
                }
            });
            return acc;
        }, [])
        setSourceRelationError(errors);
        const uniqueTargetTempOutputNumbers = [...new Set(sourceRelation.map(item => item.targetTempOutputNumber))];
        const allGroupData = {};

        const groupedByTargetTempOutputNumber = uniqueTargetTempOutputNumbers.reduce((acc, item) => {
            acc[item] = sourceRelation.filter(row => row.targetTempOutputNumber === item);
            return acc;
        }, {});

        for (const key in groupedByTargetTempOutputNumber) {
            const tempArray = groupedByTargetTempOutputNumber[key];
            allGroupData[key] = [];
            for (let i = 0; i < tempArray.length; i++) {
                const rowI = tempArray[i];
                const { leftSourceEntityAlias, rightSourceEntityAlias } = rowI;
                const exists = allGroupData[key].some(item =>
                    item.includes(leftSourceEntityAlias) && item.includes(rightSourceEntityAlias)
                );
                if (!exists) {
                    allGroupData[key].push([leftSourceEntityAlias, rightSourceEntityAlias]);
                }

                for (let j = 0; j < tempArray.length; j++) {
                    if (i !== j) {
                        const rowJ = tempArray[j];
                        if (
                            rowI.leftSourceEntityAlias === rowJ.rightSourceEntityAlias ||
                            rowI.leftSourceEntityAlias === rowJ.leftSourceEntityAlias ||
                            rowI.rightSourceEntityAlias === rowJ.leftSourceEntityAlias ||
                            rowI.rightSourceEntityAlias === rowJ.rightSourceEntityAlias
                        ) {
                            allGroupData[key].forEach(item => {
                                if (item.includes(leftSourceEntityAlias) && item.includes(rightSourceEntityAlias)) {
                                    item.push(rowI.leftSourceEntityAlias);
                                    item.push(rowI.rightSourceEntityAlias);
                                    item.push(rowJ.leftSourceEntityAlias);
                                    item.push(rowJ.rightSourceEntityAlias);
                                }
                            });
                        }
                    }
                }
            }
            allGroupData[key] = allGroupData[key].map(item => [...new Set(item)]);
        }
        for (const key in allGroupData) {
            if (allGroupData[key].length > 1) {
                setSourceRelationError(prevErrors => [
                    ...prevErrors,
                    `for ${key} relation between these entities ${JSON.stringify(allGroupData[key])} have not been established`
                ])
            }
        }

        if (mappingErrors.length > 0 || sourceRelationErrors.length > 0) {
            return
        }
        setExecution(true);
        try {
            const response = await axios.post(`${API_URL}/api/etlRoute/ETLCall`, { filteredSchema, sourceRelation }, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authState.token}`,
                },
            });
            if (response.status < 200 || response.status >= 300) {
                throw new Error('Network response was not ok');
            }
            if (response.status === 200) {
                console.log(response.data.output);
            }
        } catch (error) {
            console.error('Error :', error);
            alert("Connection error: " + (error.response?.data?.message || error.message));
        } finally {
            setExecution(false);
        }
    }

    return (
        <div className="module-wrapper">
            <Navbar category={category} items={items} selectedModule={selectedModule} selectModule={selectModule} />
            <aside className={`${sidebarStyles["secondary-sidebar"]} scrollbar`}>
                <form className={sidebarStyles['datasource-container-form']} onSubmit={handleDatasourceSubmit}>
                    <SelectDatasource icon={postgresIcon} selectedValue={config.postgres} options={postgresDatasources.map(item => item.datasource)} onChange={(e) => selectDatasource(e, "postgres")} />
                    <SelectDatasource icon={mysqlIcon} options={mysqlDatasources.map(item => item.datasource)} selectedValue={config.mySql} onChange={(e) => selectDatasource(e, "mySql")} />
                    <SelectDatasource icon={folderIcon} options={foldersource.map(item => item.datasource)} selectedValue={config.folder} onChange={(e) => selectDatasource(e, "folder")} />
                    <button type="submit" className="sidebar-btn">Fetch</button>
                </form>
                {(Object.keys(fetchedTables).length > 0 || folder) && (
                    <div className={sidebarStyles["entity-container"]}>
                        <p className={sidebarStyles['entity-title']}>Tables & Files</p>
                        {fetchedTables && Object.entries(fetchedTables).map(([datasource, tables]) => (
                            <div className={sidebarStyles["entity-block"]} key={datasource}>
                                <p className={sidebarStyles['datasource-name']}>{datasource}</p>
                                {tables.map((table, tabIndex) => (
                                    <div className={sidebarStyles['entity-detail']} key={`${table.tableName}_${tabIndex}`}>
                                        <span
                                            className={`checkbox ${checkedEntities.some(item => item.key === `${datasource}_${table.tableName}_${tabIndex}`) ? 'checked' : ''}`}
                                            onClick={() => handleCheckboxChange(datasource, table.tableName, tabIndex)}
                                        >
                                            {checkedEntities.some(item => item.key === `${datasource}_${table.tableName}_${tabIndex}`) && (
                                                <CheckIcon className="checkicon" />
                                            )}
                                        </span>
                                        <span className={sidebarStyles["tableName"]}>{table.tableName}</span>
                                    </div>
                                ))}
                            </div>
                        ))}

                        {folder && (<div className={sidebarStyles["entity-block"]}>
                            <div onClick={handleLabelClick} style={{ display: "flex", gap: "0.5rem", cursor: "pointer" }}>
                                <FontAwesomeIcon icon={faFileCsv} style={{ fontSize: '1rem', color: '#A84' }} />
                                <p className={sidebarStyles['datasource-name']}>Computer_Files</p>
                                <input
                                    type="file"
                                    name="files"
                                    onChange={changeHandler}
                                    ref={fileInputRef}
                                    style={{ display: "none" }}
                                    multiple
                                />
                            </div>
                            {computerFiles.length > 0 && computerFiles.map(item => {
                                let fileName = item.name.split('.').slice(0, -1).join('.');
                                fileName = fileName.length > 20
                                    ? `${fileName.slice(0, 10)}...${fileName.slice(-6)}`
                                    : fileName;
                                return (
                                    <div className={sidebarStyles['entity-detail']} key={item.name}>
                                        <FontAwesomeIcon icon={faFileCsv} style={{ fontSize: '15px', color: 'blue' }} />
                                        <span className={sidebarStyles["tableName"]}>{fileName}</span>
                                        <span className="remove-file" onClick={() => removeFile(item)}><ClearIcon className='remove-icon' style={{ fontSize: "14px" }} /></span>
                                    </div>
                                );
                            })}
                        </div>)}
                        <button onClick={handleEntitySubmit} className="sidebar-btn">continue</button>
                    </div>
                )}
                {/* {schemaEntries.length > 0 && <button className='module-btn' onClick={() => window.open('/dashboard', '_blank', 'noopener,noreferrer')}>Get Additional Details</button>} */}
                {/* {ETLModal && schemaEntries.length > 0 && <button className={sidebarStyles['module-btn']} onClick={() => closeETLModal(true)}>Get Additional Details</button>} */}
                {ETLModal && schemaEntries.length > 0 && <button className={sidebarStyles['module-btn']} onClick={() => window.open('/dashboard', '_blank')}>New Session</button>}
            </aside>
            <main className="module-content ETL-module">
                <MappingSheet schemaEntries={schemaEntries} filteredSchema={filteredSchema} setFilteredSchema={setFilteredSchema} />
                {mappingErrors.length > 0 && <MappingError mappingErrors={mappingErrors} />}
                <SourceRelationSheet schemaEntries={schemaEntries} filteredSchema={filteredSchema} sourceRelation={sourceRelation} setSourceRelation={setSourceRelation} />
                {sourceRelationErrors.length > 0 && <SourceRelationError sourceRelationErrors={sourceRelationErrors} />}
                <UpdateSourceRelation updateSourceRelation={updateSourceRelation} updatedSourceRelation={updatedSourceRelation} sourceRelation={sourceRelation} />
                {filteredSchema.length > 0 && sourceRelation.length > 0 && <button className='final-btn' onClick={handleETLSheet}>ETL Sheet</button>}
            </main>
            {openETLModal && <ETLModal schemaEntries={schemaEntries} computerFiles={computerFiles} closeETLModal={closeETLModal} />}
            {executing && <ProcessingModal />}
        </div>
    )

}

export default HighLevel