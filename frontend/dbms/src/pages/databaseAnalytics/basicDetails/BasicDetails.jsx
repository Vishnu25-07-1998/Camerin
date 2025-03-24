import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useState, useEffect, useRef, useContext } from 'react';
import ProfileAvatar from '../../../assets/profile/ProfileAvatar.jpg';
import { useNavigate } from "react-router-dom";
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import { AuthContext } from '../../../context/AuthContext';
import axios from 'axios';
import FixedDropdown from '../../../widgets/customWidgets/fixeddropdown/FixedDropdown';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import './basicDetails.css';
import Headers from '../../../components/layouts/Headers';
import SecondarySidebar from '../../../components/layouts/SecondarySidebar';

const BasicDetails = () => {

    const API_URL = import.meta.env.VITE_API_URL;
    const { authState } = useContext(AuthContext);
    const navigate = useNavigate();
    // const [schemaEntries, setschemaEntries] = useState([]);
    const [data, setData] = useState([]);
    const [formData, setFormData] = useState({
        fileName: "",
    });
   
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
            <Headers />
            <SecondarySidebar buttonText={"Basic Details"} onAction={callAction} /> 
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