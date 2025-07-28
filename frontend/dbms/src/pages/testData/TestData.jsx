import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useState, useEffect, useRef, useContext } from 'react';
import ProfileAvatar from '../../assets/profile/ProfileAvatar.jpg';
import folderIcon from '../../assets/db/icons8-folder.svg';
import CustomSelect from '../../widgets/customWidgets/customSelect/CustomSelect';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import CheckIcon from '@mui/icons-material/Check';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileCsv } from "@fortawesome/free-solid-svg-icons";
import FixedDropdown from '../../widgets/customWidgets/fixeddropdown/FixedDropdown';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import UploadIcon from '@mui/icons-material/Upload';
import sidebarStyles from '../../components/layouts/secondarysidebar.module.css';
import MultiSelect from '../../widgets/customWidgets/multiSelect/MultiSelect';
import Navbar from '../../components/layouts/Navbar';
import styles from './testData.module.css';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloseIcon from '@mui/icons-material/Close';
import ProcessingModal from '../../components/modals/ProcessingModal';

import Papa from 'papaparse';

const TestData = () => {

    const API_URL = import.meta.env.VITE_API_URL;
    const { authState } = useContext(AuthContext);
    const [datasources, setDatasources] = useState([]);
    const [formData, setFormData] = useState({
        mappingSheet: "",
        sourceRelationSheet: "",
        fileName: "",
    });
    const [editingIndex, setIndex] = useState('');
    const [data, setData] = useState([]);
    const [sourceEntities, setSourceEntities] = useState([]);
    const [selectedEntities, selectEntities] = useState([]);
    const [executing, setExecution] = useState(false);
    const mappingSheetRef = useRef(null);
    const sourceRelationRef = useRef(null);
    const basicDetailsRef = useRef(null);
    const [selectedModule, selectModule] = useState("Test Data via Mapping");
    const category = "Create Test Data";
    const items = [
        'Test Data via Mapping',
        'Test Data via Entity'
    ];
    const handleUploadClick = (ref) => {
        ref.current.click();
    }

    const handleFormdata = (e, field) => {
        const { value } = e.target;
        setFormData(prev => ({ ...prev, [field]: value }));
    }

    const changeHandler = (event, name) => {
        const newFile = event.target.files[0];

        if (!newFile) return;

        setFormData(prevFiles => ({
            ...prevFiles,
            [name]: newFile
        }));

        if (name === 'mappingSheet') {

            Papa.parse(newFile, {
                header: true,
                skipEmptyLines: true,
                complete: (result) => {
                    if (!result.data || !result.meta?.fields.includes('Source_Entity')) {
                        console.warn("Missing 'Source_Entity' field in CSV.");
                        return;
                    }
                    const entities = result.data
                        .map(row => row.Source_Entity)
                        .filter(Boolean);

                    const unique = Array.from(new Set(entities));
                    setSourceEntities(unique);
                },
                error: (err) => {
                    console.error("Error parsing CSV:", err);
                }
            });
        }
    };

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

    const getBasicDetails = async () => {
        setExecution(true);
        try {
            const response = await axios.post(`${API_URL}/api/reconRouter/basicDetails`, { selectedEntities },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authState.token}`,
                    },
                }
            );
            // console.log("response : ", response);
            setData(response.data.Output);
        } catch (error) {
            console.error('Error :', error);
        } finally {
            setExecution(false);
        }
    }

    const headers = data
        .filter(({ fileName }) => fileName === formData['fileName'])
        .map(({ data }) => data[0] ? Object.keys(data[0]) : [])
        .flat();
    const tData = data
        .filter(({ fileName }) => fileName === formData['fileName'])
        .map(({ data }) => data).flat();



    return (
        <div className="module-wrapper">
            <Navbar category={category} items={items} selectedModule={selectedModule} selectModule={selectModule} />
            <aside className={`${sidebarStyles["secondary-sidebar"]} scrollbar`}>
                <div className={sidebarStyles["upload-area"]}>
                    <div className={sidebarStyles.uploadDiv} onClick={() => handleUploadClick(mappingSheetRef)}>
                        <UploadIcon />
                        <p className={sidebarStyles.uploadLabel}>Upload Mapping Sheet</p>
                        <input
                            type="file"
                            ref={mappingSheetRef}
                            style={{ display: "none" }}
                            onChange={(event) => changeHandler(event, "mappingSheet")}
                        />
                    </div>
                    <ul className={sidebarStyles['upload-file-list']}>
                        <li className={sidebarStyles['file-list-item']}>
                            <FontAwesomeIcon icon={faFileCsv} style={{ fontSize: '1rem', color: '#A84' }} />
                            <span className={sidebarStyles["file-name"]}>{formData['mappingSheet'].name}</span>
                        </li>
                    </ul>
                </div>
                <div className={sidebarStyles["upload-area"]}>
                    <div className={sidebarStyles.uploadDiv} onClick={() => handleUploadClick(sourceRelationRef)}>
                        <UploadIcon />
                        <p className={sidebarStyles.uploadLabel}>Upload Source Relation Sheet</p>
                        <input
                            type="file"
                            ref={sourceRelationRef}
                            style={{ display: "none" }}
                            onChange={(event) => changeHandler(event, "sourceRelationSheet")}
                        />
                    </div>
                    <ul className={sidebarStyles['upload-file-list']}>
                        <li className={sidebarStyles['file-list-item']}>
                            <FontAwesomeIcon icon={faFileCsv} style={{ fontSize: '1rem', color: '#A84' }} />
                            <span className={sidebarStyles["file-name"]}>{formData['sourceRelationSheet'].name}</span>
                        </li>
                    </ul>
                </div>
                <button className={sidebarStyles['module-btn']}>Submit</button>
            </aside>
            <main className="module-content relation-module">
                <div className={styles.tablePanel}>
                    <div className={styles.leftPanel}>
                        <MultiSelect options={sourceEntities} onChange={(e) => {
                            const value = e.target.value;
                            selectEntities(value);
                        }}
                            selectedValue={selectedEntities} placeholder={'Select Entities'} customStyles={{ container: { minWidth: "270px" } }} />
                        <button className="label-box" onClick={getBasicDetails}>Get Basic Details</button>
                    </div>

                    <div className="table-options">

                        {/* <div className={`${styles.iconWrapper} ${!selectedEntities ? styles.disabled : ''}`}> */}
                        {/* <UploadFileIcon
                                onClick={() => handleUploadClick(basicDetailsRef)}
                                className={`${styles.uploadIcon} ${!selectedEntities ? styles.disabled : ''}`}
                            /> */}

                        {/* </div> */}
                        <CustomSelect options={data.map((item) => item['fileName'])} onChange={(e) => handleFormdata(e, "fileName")} selectedValue={formData.fileName} placeholder={'select Basic Details file'} customStyles={{ container: { minWidth: "270px" } }} />

                        {/* <button className="label-box" disabled={!selectedEntities} onClick={() => handleUploadClick(basicDetailsRef)}>Basic Details Sheet</button> */}
                        {/* <input
                            type="file"
                            ref={basicDetailsRef}
                            onChange={handleFileChange}
                            style={{ display: "none" }}
                        />
                        {fileName && <span className={styles.fileName} >{fileName}</span>} */}

                    </div>
                </div>
                {headers.length > 0 && <div className="relation-table module-table">
                    <table>
                        <thead>
                            <tr>
                                {/* <th>Actions</th> */}
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
            {executing && <ProcessingModal />}
        </div>
    )
}

export default TestData