import { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import CustomSelect from '../../widgets/customWidgets/customSelect/CustomSelect';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import * as XLSX from "xlsx";
import Papa from 'papaparse';
import Navbar from '../../components/layouts/Navbar';
import Rightbar from '../../components/layouts/Rightbar';
import ProcessingModal from '../../components/modals/ProcessingModal';

const DBCompare = () => {

    const API_URL = import.meta.env.VITE_API_URL;
    const { authState } = useContext(AuthContext);
    const [datasources, setDatasources] = useState([]);
    const [entities, setEntities] = useState({
        leftEntity: [],
        rightEntity: [],
    });
    const [executing, setExecution] = useState(false);
    const [data, setData] = useState([]);
    const [formData, setFormData] = useState({
        fileName: "",
    });
    const [extension, setExtension] = useState("xlsx");
    const [selectedModule, selectModule] = useState("Correlation Between DB Data");
    const category = "DB Compare";
    const items = [
        'Correlation Between DB Data',
        'Quick Ratio Comparison Between Source Columns',
        'Spearman Comparison Between Source Columns',
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

    const fetchOutput = async () => {
        try {
            const response = await axios.post(
                `${API_URL}/api/dbCompareRoute/dbOuts`,
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
        entities['leftEntity'].forEach(file => {
            formData.append("leftFiles", file);
        });
        entities['rightEntity'].forEach(file => {
            formData.append("rightFiles", file);
        });
        const endpoints = {
            "Correlation Between DB Data": `${API_URL}/api/dbCompareRoute/correlationBetweenDbData`,
            "Quick Ratio Comparison Between Source Columns": `${API_URL}/api/dbCompareRoute/quickRatioComparison`,
            "Spearman Comparison Between Source Columns": `${API_URL}/api/dbCompareRoute/spearmanComparison`,
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
            await fetchOutput();
            setFormData(prev => ({ ...prev, fileName: "" }));
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
            <Rightbar executing={executing} entities={entities} setEntities={setEntities} onAction={callAction} />
            <main className="module-content relation-module">
                <div className="table-panel">
                    <CustomSelect options={data.map((item) => item['fileName'])} onChange={(e) => handleFormdata(e, "fileName")} selectedValue={formData.fileName} placeholder={'select output file'} customStyles={{ container: { minWidth: "270px" } }} />
                    <div className="table-options">
                        <CustomSelect options={["csv", "xlsx"]} onChange={(e) => setExtension(e.target.value)} selectedValue={extension} placeholder={'select output extension'} customStyles={{ container: { maxWidth: "80px", borderTop: "0", borderRadius: "40%" }, list: { borderRadius: "10px" }, }} />
                        <span className='download-cover' onClick={downloadFile}><FileDownloadIcon className='download-icon' /></span>
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
            {executing && <ProcessingModal />}
        </div>
    )
}

export default DBCompare