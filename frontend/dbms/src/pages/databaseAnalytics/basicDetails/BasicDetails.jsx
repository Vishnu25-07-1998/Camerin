import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useState, useEffect, useRef, useContext } from 'react';
import ProfileAvatar from '../../../assets/profile/ProfileAvatar.jpg';
import postgresIcon from '../../../assets/db/icons8-postgresql.svg';
import { useNavigate } from "react-router-dom";
import mysqlIcon from '../../../assets/db/icons8-mysql.svg';
import folderIcon from '../../../assets/db/icons8-folder.svg';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import SelectDatasource from '../../../widgets/customWidgets/datasourceSelect/SelectDatasource';
import { AuthContext } from '../../../context/AuthContext';
import axios from 'axios';
import CheckIcon from '@mui/icons-material/Check';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileCsv } from "@fortawesome/free-solid-svg-icons";
import FixedDropdown from '../../../widgets/customWidgets/fixeddropdown/FixedDropdown';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ClearIcon from '@mui/icons-material/Clear';
import './basicDetails.css';

const BasicDetails = () => {

    const API_URL = import.meta.env.VITE_API_URL;
    const { authState } = useContext(AuthContext);
    const navigate = useNavigate();
    const [schemaEntries, setschemaEntries] = useState([]);
    const [showDropdown, setDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const selectRef = useRef(null);
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
    const [data, setData] = useState([]);
    const [formData, setFormData] = useState({
        fileName: "",
    });
    const fileInputRef = useRef(null);
    const items = [
        'Database Analytics',
        'User Story',
        'High Level Design/Mapping',
        'Low Level Design',
        'Data Flow Diagram',
        'Code Development',
        'Create Test Data',
        'Create Test Cases'
    ];
    const filteredItems = items.filter(item =>
        item.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const handleChange = (e) => {
        setSearchQuery(e.target.value);
        setDropdown(true);
    }
    const handleDropdown = () => {
        setDropdown(prevState => !prevState);
    }
    const handleClickOutside = (event) => {
        if (selectRef.current && !selectRef.current.contains(event.target)) {
            setDropdown(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    const handleItemClick = (item) => {
        setSearchQuery(item);
        setDropdown(false);
        navigate('/db-analytics');
    }

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
    const handleFormdata = (e, field) => {
        const { value } = e.target;
        setFormData(prev => ({ ...prev, [field]: value }));
    }
    const headers = data
        .filter(({ fileName }) => fileName === formData['fileName'])
        .map(({ data }) => data[0] ? Object.keys(data[0]) : [])
        .flat();
    const tData = data
        .filter(({ fileName }) => fileName === formData['fileName'])
        .map(({ data }) => data).flat();

    const callAction = async () => {
        const formData = new FormData();
        computerFiles.forEach(file => {
            formData.append("files", file);
        });
        try {
            const response = await axios.post(
                `${API_URL}/api/databaseAnalyticsRoute/basicDetails`, formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${authState.token}`,
                    },
                }
            );
            // response.data.output.forEach(file => {
            //     const downloadLink = document.createElement('a');
            //     downloadLink.href = file.fileUrl;
            //     downloadLink.download = file.filename;
            //     downloadLink.click();
            // });
            setData(response.data.output);
        } catch (error) {
            console.error('Error in executing Script:', error.response?.data || error.message);
        }
    }


    return (
        <div className="module-wrapper">
            <header className="header">
                <div className="main-logo">
                    <h2>DBMS</h2>
                </div>
                <nav className="nav-bar">
                    <div className="search-wrapper" ref={selectRef}>
                        <div className="search-bar" onClick={handleDropdown}>
                            <SearchIcon className='search-icon' />
                            <input type="text" placeholder='Google Your DB Menu' value={searchQuery} onChange={handleChange} />
                        </div>
                        {showDropdown && <ul className="search-list">
                            {filteredItems.map((item, index) => (
                                <li key={index} className='searchList-item' onClick={() => handleItemClick(item)} >{item}</li>
                            ))}
                        </ul>}
                    </div>
                    <div className="nav-links">
                        <NotificationsIcon />
                        <div className="profile-container">
                            <img src={ProfileAvatar} alt="Profile" className="avatar" />
                            <div className="welcome-text">
                                <span>Welcome</span>
                                <strong>John Doe</strong>
                            </div>
                            <UnfoldMoreIcon style={{ cursor: "pointer" }} />
                        </div>
                    </div>
                </nav>
            </header>
            <aside className="module-sidebar">
                <form className='datasource-container-form' onSubmit={handleDatasourceSubmit}>
                    <SelectDatasource icon={postgresIcon} selectedValue={config.postgres} options={postgresDatasources.map(item => item.datasource)} onChange={(e) => selectDatasource(e, "postgres")} />
                    <SelectDatasource icon={mysqlIcon} options={mysqlDatasources.map(item => item.datasource)} selectedValue={config.mySql} onChange={(e) => selectDatasource(e, "mySql")} />
                    <SelectDatasource icon={folderIcon} options={foldersource.map(item => item.datasource)} selectedValue={config.folder} onChange={(e) => selectDatasource(e, "folder")} />
                    <button type="submit" className="sidebar-btn">Fetch</button>
                </form>
                {(Object.keys(fetchedTables).length > 0 || folder) && (
                    <div className="entity-container">
                        <p className='entity-title'>Tables & Files</p>
                        {fetchedTables && Object.entries(fetchedTables).map(([datasource, tables]) => (
                            <div className="entity-block" key={datasource}>
                                <p className='datasource-name'>{datasource}</p>
                                {tables.map((table, tabIndex) => (
                                    <div className='entity-detail' key={`${table.tableName}_${tabIndex}`}>
                                        <span
                                            className={`checkbox ${checkedEntities.some(item => item.key === `${datasource}_${table.tableName}_${tabIndex}`) ? 'checked' : ''}`}
                                            onClick={() => handleCheckboxChange(datasource, table.tableName, tabIndex)}
                                        >
                                            {checkedEntities.some(item => item.key === `${datasource}_${table.tableName}_${tabIndex}`) && (
                                                <CheckIcon className="checkicon" />
                                            )}
                                        </span>
                                        <span className="tableName">{table.tableName}</span>
                                    </div>
                                ))}
                            </div>
                        ))}

                        {folder && (<div className="entity-block">
                            <div onClick={handleLabelClick} style={{ display: "flex", gap: "0.5rem", cursor: "pointer" }}>
                                <FontAwesomeIcon icon={faFileCsv} style={{ fontSize: '1rem', color: '#A84' }} />
                                <p className='datasource-name'>Computer_Files</p>
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
                                    <div className='entity-detail' key={item.name}>
                                        <FontAwesomeIcon icon={faFileCsv} style={{ fontSize: '15px', color: 'blue' }} />
                                        <span className="tableName">{fileName}</span>
                                        <span className="remove-file" onClick={() => removeFile(item)}><ClearIcon className='remove-icon' style={{ fontSize: "14px" }} /></span>
                                    </div>
                                );
                            })}
                        </div>)}
                        {/* <button onClick={handleEntitySubmit} className="sidebar-btn">continue</button> */}
                    </div>
                )}
                <button className='module-btn' onClick={callAction}>Basic Details</button>
                {/* {schemaEntries.length > 0 && <button className='module-btn' onClick={callAction}>Basic Details</button>} */}
            </aside>
            <main className="module-content relation-module">
                <div className="table-panel">
                    <FixedDropdown options={data.map((item) => item['fileName'])} onChange={(e) => handleFormdata(e, "fileName")} selectedValue={formData.fileName} placeholder={'select output file'} customStyles={{ container: { maxWidth: "270px", borderTop: "0", borderRadius: "40%" }, list: { borderRadius: "10px" }, }} />
                    <div className="table-options">
                        <input type="text" className='search-input' placeholder='Search' />
                        <span className='download-cover'><FileDownloadIcon className='download-icon' /></span>
                    </div>
                </div>
                {headers.length > 0 && <div className="relation-table module-table">
                    <table>
                        <thead>
                            <tr>
                                {headers.map((header, idx) => <th key={idx}>{header}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {tData.map((item, idx) => (
                                <tr key={idx}>
                                    {headers.map((header, index) => (
                                        <td key={index}>{item[header]}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>}
            </main>
        </div>
    )
}

export default BasicDetails