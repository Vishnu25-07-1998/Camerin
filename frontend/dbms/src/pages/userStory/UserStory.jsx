import SearchIcon from '@mui/icons-material/Search';
import { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileCsv } from "@fortawesome/free-solid-svg-icons";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import UploadIcon from '@mui/icons-material/Upload';
import sidebarStyles from '../../components/layouts/secondarysidebar.module.css';
import Navbar from '../../components/layouts/Navbar';
import MultiSelect from '../../widgets/customWidgets/multiSelect/MultiSelect';
import Papa from 'papaparse';
import DropdownSelect from '../../widgets/customWidgets/selectDropdown/DropdownSelect';
import styles from './userstory.module.css';
import CustomSelect from '../../widgets/customWidgets/customSelect/CustomSelect';
import InfoIcon from '@mui/icons-material/Info';
import * as XLSX from "xlsx";

const UserStory = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    const { authState } = useContext(AuthContext);
    const [datasources, setDatasources] = useState([]);
    const [data, setData] = useState([]);
    const [formData, setFormData] = useState({
        fileName: "",
    });
    const [extension, setExtension] = useState("xlsx");
    const [entities, setEntities] = useState({
        leftEntity: "",
        rightEntity: ""
    });
    const [headers, setHeaders] = useState({
        leftEntity: [],
        rightEntity: [],
    });

    const [selectedHeaders, selectHeaders] = useState({
        leftEntity: [],
        rightEntity: [],
    });
    const commonHeaders = headers.leftEntity.filter(field => headers.rightEntity.includes(field));

    useEffect(() => {
        if (
            headers.leftEntity.length > 0 &&
            headers.rightEntity.length > 0
        ) {
            const common = headers.leftEntity.filter(field =>
                headers.rightEntity.includes(field)
            );

            if (common.length === 0) {
                alert("No common columns found between Left and Right entities.");
            }
        }
    }, [headers.leftEntity, headers.rightEntity]);

    const [executing, setExecution] = useState(false);
    const leftEntityRef = useRef(null);
    const rightEntityRef = useRef(null);
    const [selectedModule, selectModule] = useState("Generate Recon Report");
    const category = "Reconcilation";
    const items = [
        'Generate Data Extract',
        'Generate BI Report',
        'Generate Recon Report',
    ];
    const handleUploadClick = (ref) => {
        ref.current.click();
    }
    const changeHandler = (event, name) => {
        const newFile = event.target.files[0];

        if (newFile) {
            setEntities(prev => ({
                ...prev,
                [name]: newFile
            }));

            Papa.parse(newFile, {
                header: true,
                preview: 1,
                complete: (result) => {
                    if (result && result.meta && result.meta.fields) {
                        setHeaders(prev => ({
                            ...prev,
                            [name]: result.meta.fields
                        }));
                        selectHeaders(prev => ({
                            ...prev,
                            [name]: [],
                        }));
                    }
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

    const handleFormdata = (e, field) => {
        const { value } = e.target;
        setFormData(prev => ({ ...prev, [field]: value }));
    }

    const handleHeaders = (e, field) => {
        selectHeaders(prev => ({
            ...prev,
            [field]: e.target.value
        }));
    }


    const headings = data
        .filter(({ fileName }) => fileName === formData['fileName'])
        .map(({ data }) => data[0] ? Object.keys(data[0]) : [])
        .flat();
    const tData = data
        .filter(({ fileName }) => fileName === formData['fileName'])
        .map(({ data }) => data).flat();

    const fetchOutput = async () => {
        try {
            const response = await axios.post(
                `${API_URL}/api/userStoryRoute/dbOuts`,
                { selectedModule },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authState.token}`,
                    },
                }
            );
            setData(response.data.Output);
        } catch (error) {
            console.error('Error in fetching Outs:', error.response?.data || error.message);
        }
    };

    useEffect(() => {
        fetchOutput();
        setFormData(prev => ({ ...prev, fileName: "" }));
    }, [selectedModule]);


    const callAction = async () => {
        const formData = new FormData();

        formData.append("leftFiles", entities['leftEntity']);
        formData.append("rightFiles", entities['rightEntity']);
        formData.append("selectedHeaders", JSON.stringify(selectedHeaders));

        const endpoints = {
            "Generate Data Extract": `${API_URL}/api/userStoryRoute/generateDataExtract`,
            "Generate BI Report": `${API_URL}/api/userStoryRoute/generateBIReport`,
            "Generate Recon Report": `${API_URL}/api/userStoryRoute/generateReconReport`,
        };

        const endpoint = endpoints[selectedModule];
        if (!endpoint) return;
        setExecution(true);

        try {
            const response = await axios.post(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${authState.token}`,
                },
            }
            );
            console.log("result : ", response.data.result);
            fetchOutput();
        } catch (error) {
            console.error('Error in executing Script:', error.response?.data || error.message);
        } finally {
            setExecution(false);
        }
    }

    const downloadFile = () => {
        // Convert data to CSV using PapaParse

        if (extension === "xlsx") {
            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.json_to_sheet(tData);
            XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
            XLSX.writeFile(workbook, formData['fileName'].replace(/\.(xlsx|csv)$/, '.csv'));
        } else {
            const csv = Papa.unparse(tData, {
                header: true,
                columns: headers
            });

            // Create a Blob from the CSV string
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = formData['fileName'].replace(/\.(xlsx|csv)$/, '.csv');
            link.click();
        }

    };

    return (
        <div className="module-wrapper">
            <Navbar category={category} items={items} selectedModule={selectedModule} selectModule={selectModule} />
            <aside className={`${sidebarStyles["secondary-sidebar"]} scrollbar`}>
                <div className={sidebarStyles["upload-area"]}>
                    <div className={sidebarStyles["uploadDiv"]} onClick={() => handleUploadClick(leftEntityRef)}>
                        <UploadIcon />
                        <p>Upload Left Entity</p>
                        <input
                            type="file"
                            ref={leftEntityRef}
                            style={{ display: "none" }}
                            onChange={(event) => changeHandler(event, "leftEntity")}
                        />
                    </div>
                    <ul className={sidebarStyles['upload-file-list']}>
                        <li className={sidebarStyles['file-list-item']}>
                            <FontAwesomeIcon icon={faFileCsv} style={{ fontSize: '1rem', color: '#A84' }} />
                            <span className={sidebarStyles["file-name"]}>{entities['leftEntity'].name}</span>
                        </li>
                    </ul>
                </div>
                <div className={sidebarStyles["upload-area"]}>
                    <div className={sidebarStyles["uploadDiv"]} onClick={() => handleUploadClick(rightEntityRef)}>
                        <UploadIcon />
                        <p>Upload Right Entity</p>
                        <input
                            type="file"
                            ref={rightEntityRef}
                            style={{ display: "none" }}
                            onChange={(event) => changeHandler(event, "rightEntity")}
                        />
                    </div>
                    <ul className={sidebarStyles['upload-file-list']}>
                        <li className={sidebarStyles['file-list-item']}>
                            <FontAwesomeIcon icon={faFileCsv} style={{ fontSize: '1rem', color: '#A84' }} />
                            <span className={sidebarStyles["file-name"]}>{entities['rightEntity'].name}</span>
                        </li>
                    </ul>
                </div>
                <button className={sidebarStyles['module-btn']} onClick={callAction} disabled={executing}>Submit</button>
            </aside>
            <main className="module-content relation-module">
                <div className={styles["module-top"]}>
                    {/* {<InfoIcon className={styles.infoIcon} />} */}
                    <div className={styles["select_wrap"]}>
                        <label className={styles.label}>Choose common columns (key for comparison between entities)</label>
                        <MultiSelect options={commonHeaders} onChange={(e) => handleHeaders(e, "leftEntity")} selectedValue={selectedHeaders.leftEntity} placeholder={'key for comparison between entities'} />
                    </div>
                    <div className={styles["select_wrap"]}>
                        <label className={styles.label}>Choose common columns (for non key comparison)</label>
                        <MultiSelect options={commonHeaders} onChange={(e) => handleHeaders(e, "rightEntity")} selectedValue={selectedHeaders.rightEntity} placeholder={'for non key comparison'} />
                    </div>
                </div>
                <div className="table-panel">
                    <CustomSelect options={data.map((item) => item['fileName'])} onChange={(e) => handleFormdata(e, "fileName")} selectedValue={formData.fileName} placeholder={'select output file'} customStyles={{ container: { minWidth: "270px", borderTop: "0", borderRadius: "40%" }, list: { borderRadius: "10px" }, input: { fieldSizing: "content" } }} />
                    {/* <DropdownSelect options={data.map((item) => item['fileName'])} onChange={(e) => handleFormdata(e, "fileName")} selectedValue={formData.fileName} placeholder={'select output file'} /> */}
                    <div className="table-options">
                        <CustomSelect options={["csv", "xlsx"]} onChange={(e) => setExtension(e.target.value)} selectedValue={extension} placeholder={'select output extension'} customStyles={{ container: { maxWidth: "80px", borderTop: "0", borderRadius: "40%" }, list: { borderRadius: "10px" }, }} />
                        <span className='download-cover' onClick={downloadFile}><FileDownloadIcon className='download-icon' /></span>
                    </div>
                </div>
                {headings.length > 0 && <div className="relation-table module-table">
                    <table>
                        <thead>
                            <tr>
                                {headings.map((header, idx) => <th key={idx}>{header}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {tData.map((item, idx) => (
                                <tr key={idx}>
                                    {headings.map((header, index) => (
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

export default UserStory