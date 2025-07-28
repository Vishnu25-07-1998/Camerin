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
import ClearIcon from '@mui/icons-material/Clear';
import styles from './secondarysidebar.module.css';

const SecondarySidebar = ({executing, onAction, config, setConfig, folder, setFolder, checkedEntities, setCheckedEntities, computerFiles, setComputerFiles}) => {

    const API_URL = import.meta.env.VITE_API_URL;
    const { authState } = useContext(AuthContext);
    const [datasources, setDatasources] = useState([]);
    // const [config, setConfig] = useState({
    //     postgres: '',
    //     mySql: '',
    //     folder: '',
    // });
    // const [folder, setFolder] = useState(false);
    const [fetchedTables, setFetchedTables] = useState({});
    // const [checkedEntities, setCheckedEntities] = useState([]);
    // const [computerFiles, setComputerFiles] = useState([]);
    const fileInputRef = useRef(null);
   

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

    const removeFile = (file) => {
        setComputerFiles(prevFiles => prevFiles.filter(item => item !== file));
    }

    
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

    return (
        <aside className={`${styles["secondary-sidebar"]} scrollbar`}>
            <form className={styles['datasource-container-form']} onSubmit={handleDatasourceSubmit}>
                <SelectDatasource icon={postgresIcon} selectedValue={config.postgres} options={postgresDatasources.map(item => item.datasource)} onChange={(e) => selectDatasource(e, "postgres")} />
                <SelectDatasource icon={mysqlIcon} options={mysqlDatasources.map(item => item.datasource)} selectedValue={config.mySql} onChange={(e) => selectDatasource(e, "mySql")} />
                <SelectDatasource icon={folderIcon} options={foldersource.map(item => item.datasource)} selectedValue={config.folder} onChange={(e) => selectDatasource(e, "folder")} />
                <button type="submit" className="sidebar-btn">Fetch</button>
            </form>
            {(Object.keys(fetchedTables).length > 0 || folder) && (
                <div className={styles["entity-container"]}>
                    <p className={styles['entity-title']}>Tables & Files</p>
                    {fetchedTables && Object.entries(fetchedTables).map(([datasource, tables]) => (
                        <div className={styles["entity-block"]} key={datasource}>
                            <p className={styles['datasource-name']}>{datasource}</p>
                            {tables.map((table, tabIndex) => (
                                <div className={styles['entity-detail']} key={`${table.tableName}_${tabIndex}`}>
                                    <span
                                        className={`checkbox ${checkedEntities.some(item => item.key === `${datasource}_${table.tableName}_${tabIndex}`) ? 'checked' : ''}`}
                                        onClick={() => handleCheckboxChange(datasource, table.tableName, tabIndex)}
                                    >
                                        {checkedEntities.some(item => item.key === `${datasource}_${table.tableName}_${tabIndex}`) && (
                                            <CheckIcon className="checkicon" />
                                        )}
                                    </span>
                                    <span className={styles["tableName"]}>{table.tableName}</span>
                                </div>
                            ))}
                        </div>
                    ))}

                    {folder && (<div className="entity-block">
                        <div onClick={handleLabelClick} style={{ display: "flex", gap: "0.5rem", cursor: "pointer" }}>
                            <FontAwesomeIcon icon={faFileCsv} style={{ fontSize: '1rem', color: '#A84' }} />
                            <p className={styles['datasource-name']}>Computer_Files</p>
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
                            let fileName = item.name.replace(/\.(csv|xlsx)$/i, '');
                            fileName = fileName.length > 20
                                ? `${fileName.slice(0, 10)}...${fileName.slice(-6)}`
                                : fileName;
                            return (
                                <div className={styles['entity-detail']} key={item.name}>
                                    <FontAwesomeIcon icon={faFileCsv} style={{ fontSize: '15px', color: 'blue' }} />
                                    <span className={styles["tableName"]}>{fileName}</span>
                                    <span className="remove-file" onClick={() => removeFile(item)}><ClearIcon className='remove-icon' style={{ fontSize: "14px" }} /></span>
                                </div>
                            );
                        })}
                    </div>)}
                    {/* <button onClick={handleEntitySubmit} className="sidebar-btn">continue</button> */}
                </div>
            )}
            <button className={styles['module-btn']} disabled={executing} onClick={onAction}>Submit</button>
            {/* {schemaEntries.length > 0 && <button className='module-btn' onClick={callAction}>Basic Details</button>} */}
        </aside>
    )
}

export default SecondarySidebar