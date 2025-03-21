import './etlModal.css';
import { useContext, useState } from 'react';
import axios from "axios";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CustomSelect from '../../widgets/customWidgets/customSelect/CustomSelect';
import FixedDropdown from '../../widgets/customWidgets/fixeddropdown/FixedDropdown';
import { AuthContext } from '../../context/AuthContext';
import PropTypes from "prop-types";

const ETLModal = ({ schemaEntries, closeETLModal }) => {
    const { authState } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        module: "",
        selectedDatasource: "",
        selectedEntity: "",
        fileName: "",
    });
    const [data, setData] = useState([]);
    const datsourceOptions = [...new Set(schemaEntries.map(item => item.datasource))];
    const sourceEntityOptions = formData['selectedDatasource']
        ? schemaEntries.filter(item => item.datasource === formData['selectedDatasource']).map(item => item.sourceEntity)
        : ["Select first datasource"];
    const moduleOptions = ['Get Basic Details', 'Get Cardinality', 'Get Distinct Column Length'];
    const extensions = ['view in csv', 'view in excel', 'view in pdf'];
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

    return (
        <div className="modalOverlay">
            <div className="modal-content">
                <button onClick={() => closeETLModal(false)} className="close">
                    X
                </button>

                <aside className='modal-side'>
                    <div className="select-module">
                        <CustomSelect options={moduleOptions} onChange={(e) => handleFormdata(e, "module")} selectedValue={formData['module']} placeholder={'select module'} />
                    </div>
                    {formData['module'] && <div className="select-module">
                        <CustomSelect options={datsourceOptions} onChange={(e) => handleFormdata(e, "selectedDatasource")} selectedValue={formData['selectedDatasource']} placeholder={'select datasource'} />
                    </div>}
                    {formData['selectedDatasource'] && <div className="select-module">
                        <CustomSelect options={sourceEntityOptions} onChange={(e) => handleFormdata(e, "selectedEntity")} selectedValue={formData['selectedEntity']} placeholder={'select entity'} />
                    </div>}
                    {formData['module'] && <button onClick={() => callAction("getBasicDetails")} className='module-btn'>Basic Details</button>}
                </aside>

                <main className='modal-main'>
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

        </div>
    )
}

export default ETLModal