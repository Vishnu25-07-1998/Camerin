import { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import ClearIcon from '@mui/icons-material/Clear';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileCsv } from "@fortawesome/free-solid-svg-icons";
import UploadIcon from '@mui/icons-material/Upload';
import styles from './secondarysidebar.module.css';

const Rightbar = ({executing, onAction, entities, setEntities}) => {
    const API_URL = import.meta.env.VITE_API_URL;
    const { authState } = useContext(AuthContext);
    const [datasources, setDatasources] = useState([]);
    const leftEntityRef = useRef(null);
    const rightEntityRef = useRef(null);
    const handleUploadClick = (ref) => {
        ref.current.click();
    }
    const changeHandler = (event, name) => {
        const newFiles = Array.from(event.target.files);
        setEntities(prevFiles => ({
            ...prevFiles,
            [name]: [...prevFiles[name], ...newFiles]
        }));
    };
    const removeFile = (file, name) => {
        setEntities(prevFiles => ({
            ...prevFiles,
            [name]: prevFiles[name].filter(item => item !== file)
        }));
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

    return (
        <aside className={`${styles["secondary-sidebar"]} scrollbar`}>
            <div className={styles["upload-area"]}>
                <div className={styles.uploadDiv} onClick={() => handleUploadClick(leftEntityRef)}>
                    <UploadIcon />
                    <p className={styles.uploadLabel}>Select Left Entities</p>
                    <input
                        type="file"
                        ref={leftEntityRef}
                        style={{ display: "none" }}
                        onChange={(event) => changeHandler(event, "leftEntity")}
                        multiple
                    />
                </div>
                <ul className={styles['upload-file-list']}>
                    {entities['leftEntity'].map((file, index) => (
                        <li key={index} className={styles['file-list-item']}>
                            <FontAwesomeIcon icon={faFileCsv} style={{ fontSize: '1rem', color: '#A84' }} />
                            <span className={styles["file-name"]}>{file.name}</span>
                            <span className={styles["remove-file"]} onClick={() => removeFile(file, 'leftEntity')}><ClearIcon className='remove-icon' style={{ fontSize: "14px" }} /></span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className={styles["upload-area"]}>
                <div className={styles.uploadDiv} onClick={() => handleUploadClick(rightEntityRef)}>
                    <UploadIcon />
                    <p className={styles.uploadLabel}>Select Right Entities</p>
                    <input
                        type="file"
                        ref={rightEntityRef}
                        style={{ display: "none" }}
                        onChange={(event) => changeHandler(event, "rightEntity")}
                        multiple
                    />
                </div>
                <ul className={styles['upload-file-list']}>
                    {entities['rightEntity'].map((file, index) => (
                        <li key={index} className={styles['file-list-item']}>
                            <FontAwesomeIcon icon={faFileCsv} style={{ fontSize: '1rem', color: '#A84' }} />
                            <span className={styles["file-name"]}>{file.name}</span>
                            <span className={styles["remove-file"]} onClick={() => removeFile(file, 'rightEntity')}><ClearIcon className='remove-icon' style={{ fontSize: "14px" }} /></span>
                        </li>
                    ))}
                </ul>
            </div>
            <button className={styles['module-btn']} disabled={executing} onClick={onAction}>Submit</button>
        </aside>
    )
}

export default Rightbar