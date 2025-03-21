import { useState, useEffect, useRef, useContext, useMemo } from 'react';
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ConnectModal from '../../components/modals/ConnectModal';
import './connection.css';

const Connections = () => {
 
    const location = useLocation();
    const [active, setActive] = useState(location.pathname);
    const API_URL = import.meta.env.VITE_API_URL;
    const { authState } = useContext(AuthContext);
    const [dataSources, setDataSources] = useState([]);
    const [connectModal, closeConnect] = useState(false);
    useEffect(() => {
        const fetchDataSources = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/datasourceroute/datasources`, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authState.token}`,
                    },
                });
                setDataSources(response.data);
            } catch (error) {
                console.error('Error fetching data sources:', error);
                alert("Connection error: " + (error.response?.data?.message || error.message));
            }
        };

        fetchDataSources();
    }, [authState.token]);
    const columns = useMemo(() => [
        {
            header: 'DATASOURCE NAME',
            accessorKey: 'datasource',
        },
        {
            header: 'DB TECHNOLOGY',
            accessorKey: 'dbtechnology',
            size: 100,
        },
        {
            header: 'DATABASE NAME',
            accessorKey: 'database',
        },
        {
            header: 'HOST NAME',
            accessorKey: 'hostname',
        },
        {
            header: 'PORT NUMBER',
            accessorKey: 'port',
            size: 100,
        },
        {
            header: 'USERNAME',
            accessorKey: 'username',
        },
        {
            header: 'PASSWORD',
            accessorKey: 'dbpassword',
            size: 100,
        },
    ], []);

    
    return (
        <>
            <div className="table-panel">
                <span className="label-box" onClick={() => closeConnect(!connectModal)}>Set up connections</span>
                <div className="table-options">
                    <input type="text" className='search-input' placeholder='Search' />
                    <span className='download-cover'><FileDownloadIcon className='download-icon' /></span>
                </div>
            </div>
            <div className="relation-table">
                <table>
                    <thead>
                        <tr>
                            {columns.map((column) => (
                                <th key={column.header}>{column.header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {dataSources &&
                            dataSources.filter(item => item.dbtechnology !== 'Folder_csv').map((data, index) => (
                                <tr key={index}>
                                    {columns.map((column) => (
                                        <td key={column.accessorKey}>
                                            {data[column.accessorKey]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
            {connectModal && <ConnectModal closeConnect={closeConnect} />}
        </>
    )
}

export default Connections