import './etlModal.css';
import { useContext, useState, useEffect } from 'react';
import axios from "axios";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CustomSelect from '../../widgets/customWidgets/customSelect/CustomSelect';
import FixedDropdown from '../../widgets/customWidgets/fixeddropdown/FixedDropdown';
import { AuthContext } from '../../context/AuthContext';
import * as XLSX from "xlsx";
import PropTypes from "prop-types";

const ETLModal = ({ schemaEntries, computerFiles, closeETLModal }) => {
    const API_URL = import.meta.env.VITE_API_URL;
    const { authState } = useContext(AuthContext);
    const moduleOptions = ['Basic Details', 'Cardinality', 'Distinct Column Length', 'Distinct Column Value', 'Column Each Char Count', 'Subset Relation', 'Substr and Concat Columns', 'Substr and Concat All Entities'];
    const [selectedModule, selectModule] = useState("Basic Details");
    const [selectedDatasource, setSelectedDatasource] = useState("");
    const [selectedEntity, setEnity] = useState("");
    const [localFile, setLocalFile] = useState("");

    useEffect(() => {
        if (selectedDatasource === 'Computer_Files') {
            const selectedFile = computerFiles.find(file =>
                file.name.replace(/\.[^/.]+$/, "") === selectedEntity
            );
            setLocalFile(selectedFile);
        } else {
            setLocalFile("");
        }
    }, [selectedDatasource, selectedEntity, computerFiles]);

    useEffect(() => {
        setEnity("");
    }, [selectedDatasource]);
   

    const callAction = async () => {
        const formData = new FormData();
        formData.append("files", localFile);

        const endpoints = {
            "Basic Details": `${API_URL}/api/databaseAnalyticsRoute/basicDetails`,
            "Cardinality": `${API_URL}/api/databaseAnalyticsRoute/cardinality`,
            "Unique indexes": `${API_URL}/api/databaseAnalyticsRoute/uniqueIndexes`,
            "Substr and Concat Columns": `${API_URL}/api/databaseAnalyticsRoute/substrConcatColumns`,
            "Substr and Concat All Entities": `${API_URL}/api/databaseAnalyticsRoute/substrConcatAllEntities`,
            "Subset Relations": `${API_URL}/api/userStoryRoute/subsetRelation`,
            "Distinct Column Length": `${API_URL}/api/databaseAnalyticsRoute/distinctColumnLength`,
            "Distinct Column values": `${API_URL}/api/databaseAnalyticsRoute/distinctColumnValues`,
            "Column Each char Count": `${API_URL}/api/databaseAnalyticsRoute/columnEachCharCount`
        };

        const endpoint = endpoints[selectedModule];
        if (!endpoint) return;

        try {
            const response = await axios.post(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${authState.token}`,
                },
            });
            // const outputData = response.data.output;
            // console.log(outputData);
            // localStorage.setItem('sharedViewData', JSON.stringify(outputData));
            localStorage.setItem('selectedModule', JSON.stringify(selectedModule));
            window.open('/etlTab', '_blank');
        } catch (error) {
            console.error('Error in executing Script:', error.response?.data || error.message);
        }

    }
    return (
        <div className="modalOverlay">
            <div className="modal-content">
                <button onClick={() => closeETLModal(false)} className="close">
                    X
                </button>
                <div className="select-module">
                    <CustomSelect options={moduleOptions} onChange={(e) => selectModule(e.target.value)} selectedValue={selectedModule} placeholder={'select Module'} />
                    <CustomSelect options={[...new Set(schemaEntries.map(item => item.datasource))]} onChange={(e) => setSelectedDatasource(e.target.value)} selectedValue={selectedDatasource} placeholder={'select datasource'} />
                    <CustomSelect options={schemaEntries.filter(item => item.datasource === selectedDatasource).map(item => item.sourceEntity)} onChange={(e) => setEnity(e.target.value)} selectedValue={selectedEntity} placeholder={'select Entity'} />
                </div>
                <div className="module-btns">
                    <button onClick={callAction}>Submit</button>
                    {/* <button onClick={() => callAction("Basic Details")}>Get Basic Details</button>
                    <button onClick={() => callAction("Cardinality")}>Get Cardinality</button>
                    <button onClick={() => callAction("Unique indexes")}>Get Unique Indexes</button> */}
                </div>
                {/* <div className="module-btns">
                    <button>Get Distinct Column Value</button>
                    <button>Get Distinct Column Length</button>
                    <button>Get Column Each Char Count</button>
                </div>
                <div className="module-btns">
                    <button>Get Substr and Concat All Entity</button>
                    <button>Get Substr and Concat Columns</button>
                </div> */}
            </div>
        </div>
    )
};

export default ETLModal