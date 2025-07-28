import React, { useEffect, useState, useContext } from 'react';
import CustomSelect from '../../widgets/customWidgets/customSelect/CustomSelect';
import * as XLSX from "xlsx";
import Papa from 'papaparse';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import styles from './ETLTab.module.css';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';

const ETLTab = () => {
    const [viewData, setViewData] = useState([]);
    const [selectedModule, selectModule] = useState("");
    const [extension, setExtension] = useState("xlsx");
    const API_URL = import.meta.env.VITE_API_URL;
    const { authState } = useContext(AuthContext);
    useEffect(() => {
        // const data = localStorage.getItem('sharedViewData');
        const data = localStorage.getItem('selectedModule');
        if (data) {

            selectModule(JSON.parse(data));
            localStorage.removeItem('selectedModule');

            // setViewData(JSON.parse(data));
            // localStorage.removeItem('sharedViewData');
        }
    }, []);

    const fetchOutput = async () => {
        try {
            const response = await axios.post(
                `${API_URL}/api/databaseAnalyticsRoute/dbOuts`,
                { selectedModule },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authState.token}`,
                    },
                }
            );
            setViewData(response.data.Output);
        } catch (error) {
            console.error('Error in fetching Outs:', error.response?.data || error.message);
        }
    };

    useEffect(() => {
        fetchOutput();
    }, [selectedModule]);

    const headers = viewData
        .map(({ data }) => data[0] ? Object.keys(data[0]) : [])
        .flat();
    const tData = viewData
        .map(({ data }) => data).flat();

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

    console.log("viewData : ", viewData);


    return (
        <div className={styles.tabWrapper}>
            <div className={styles.tablePanel}>
                <span className={styles.tableName}>
                    {viewData.map(({ fileName }) => fileName).join(', ').replace(/\.(xlsx|csv)$/, '')}
                </span>

                <div className={styles.tableOptions}>
                    <CustomSelect options={["csv", "xlsx"]} onChange={(e) => setExtension(e.target.value)} selectedValue={extension} placeholder={'select output extension'} customStyles={{ container: { maxWidth: "80px", borderTop: "0", borderRadius: "40%" }, list: { borderRadius: "10px" }, }} />
                    <span className='download-cover' onClick={downloadFile}><FileDownloadIcon className='download-icon' /></span>
                </div>
            </div>
            {headers.length > 0 && <div className={styles.tabTable}>
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
            </div>}</div>
    )
}

export default ETLTab