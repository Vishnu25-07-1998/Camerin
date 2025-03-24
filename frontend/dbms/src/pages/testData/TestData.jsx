import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useState, useEffect, useRef, useContext } from 'react';
import ProfileAvatar from '../../assets/profile/ProfileAvatar.jpg';
import folderIcon from '../../assets/db/icons8-folder.svg';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import CheckIcon from '@mui/icons-material/Check';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileCsv } from "@fortawesome/free-solid-svg-icons";
import FixedDropdown from '../../widgets/customWidgets/fixeddropdown/FixedDropdown';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import UploadIcon from '@mui/icons-material/Upload';
import './testData.css';

const TestData = () => {

    const API_URL = import.meta.env.VITE_API_URL;
    const { authState } = useContext(AuthContext);
    const [showDropdown, setDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const selectRef = useRef(null);
    const [datasources, setDatasources] = useState([]);
    const [formData, setFormData] = useState({
        mappingSheet: "",
        sourceRelationSheet: ""
    });
    const mappingSheetRef = useRef(null);
    const sourceRelationRef = useRef(null);
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
    }
    const handleUploadClick = (ref) => {
        ref.current.click();
    }
    const changeHandler = (event, name) => {
        const newFile = event.target.files[0];
        setFormData(prevFiles => ({
            ...prevFiles,
            [name]: newFile
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
                <div className="upload-area">
                    <div className="upload-label" onClick={() => handleUploadClick(mappingSheetRef)}>
                        <UploadIcon />
                        <p>Upload Mapping Sheet</p>
                        <input
                            type="file"
                            ref={mappingSheetRef}
                            style={{ display: "none" }}
                            onChange={(event) => changeHandler(event, "mappingSheet")}
                        />
                    </div>
                    <ul className='upload-file-list'>
                        <li className='file-list-item'>
                            <FontAwesomeIcon icon={faFileCsv} style={{ fontSize: '1rem', color: '#A84' }} />
                            <span className="file-name">{formData['mappingSheet'].name}</span>
                        </li>
                    </ul>
                </div>
                <div className="upload-area">
                    <div className="upload-label" onClick={() => handleUploadClick(sourceRelationRef)}>
                        <UploadIcon />
                        <p>Upload Source Relation Sheet</p>
                        <input
                            type="file"
                            ref={sourceRelationRef}
                            style={{ display: "none" }}
                            onChange={(event) => changeHandler(event, "sourceRelationSheet")}
                        />
                    </div>
                    <ul className='upload-file-list'>
                        <li className='file-list-item'>
                            <FontAwesomeIcon icon={faFileCsv} style={{ fontSize: '1rem', color: '#A84' }} />
                            <span className="file-name">{formData['sourceRelationSheet'].name}</span>
                        </li>
                    </ul>
                </div>
                <button className='module-btn'>Create Test Data</button>
            </aside>
            <main className="module-content relation-module">

            </main>
        </div>
    )
}

export default TestData