import { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import axios from 'axios';
import CustomSelect from '../../../widgets/customWidgets/customSelect/CustomSelect';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import * as XLSX from "xlsx";
import Papa from 'papaparse';
import { useSelector, useDispatch } from 'react-redux';
import sidebarStyles from '../../../components/layouts/secondarysidebar.module.css';
import SelectDatasource from '../../../widgets/customWidgets/datasourceSelect/SelectDatasource';
import postgresIcon from '../../../assets/db/icons8-postgresql.svg';
import mysqlIcon from '../../../assets/db/icons8-mysql.svg';
import folderIcon from '../../../assets/db/icons8-folder.svg';
import CheckIcon from '@mui/icons-material/Check';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileCsv } from "@fortawesome/free-solid-svg-icons";
import ClearIcon from '@mui/icons-material/Clear';
import { updateProjectDetails, setDatasources } from '../../../store/dbSlice';
import styles from '../databaseAnalytics.module.css';

const SubstrAndConcatEntities = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const { authState } = useContext(AuthContext);
  const dispatch = useDispatch()
  const projectDetails = useSelector((state) => state.dbms.projectDetails);
  const datasources = useSelector((state) => state.dbms.datasources);
  const [config, setConfig] = useState({
    postgres: '',
    mySql: '',
    folderSource: '',
  });
  const [fetchedTables, setFetchedTables] = useState({});
  const [folder, setFolder] = useState(false);
  const [checkedEntities, setCheckedEntities] = useState([]);
  const [executing, setExecution] = useState(false);
  const [extension, setExtension] = useState('csv')
  const [folderFiles, setFile] = useState([]);
  const [outputData, setOutData] = useState([]);
  const [selectedOut, selectOutFile] = useState('');
  const tableData =
    outputData?.find(({ fileName }) => fileName === selectedOut)?.data ?? [];
  const fileInputRef = useRef(null);
  const [defaultSettings, setDefaultSettings] = useState(null);
  const [preSaveSettings, setPreSaveSettings] = useState(null);
  const [substrEntitiesSettings, setSubstrEntitiesSettings] = useState({ distinctCount: '', nrows_source_var: '', nrows_other_source_var: '' });


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
        dispatch(setDatasources(response.data));
      } catch (error) {
        console.error('Error fetching data sources:', error);
        alert("Connection error: " + (error.response?.data?.message || error.message));
      }
    };

    fetchDataSources();
  }, [authState.token]);
  // datasources of different DBs
  const postgresDatasources = datasources.filter(ds => ds.dbtechnology.includes('postgresql+psycopg2'));
  const mysqlDatasources = datasources.filter(ds => ds.dbtechnology.includes('mysql+pymysql'));
  const foldersource = [{ _id: 'xxx', datasource: 'Computer Files', dbtechnology: 'xxx', database: 'xxx', hostname: 'xxx' }];
  //select Datasource
  const selectDatasource = (e, field) => {
    const { value } = e.target;
    setConfig(prev => ({
      ...prev,
      [field]: value
    }))
  };
  //Fetch tables using selected datasource
  const handleDatasourceSubmit = async (e) => {
    e.preventDefault();
    setFolder(!!config.folderSource);
    if (!config.postgres && !config.mySql && !config.folderSource) {
      console.log("Config is empty, not sending request.");
      return;
    }
    try {
      const response = await axios.post(`${API_URL}/api/datasourceroute/dbtables`,
        { config },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authState.token}`,
          },
        });
      setFetchedTables(response.data);
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };
  // checkbox to select entities
  const handleCheckboxChange = (datasource, tableName) => {
    const key = `${datasource}_${tableName}`;

    setCheckedEntities(prev => {
      const existingIndex = prev.findIndex(item => item.key === key);
      if (existingIndex > -1) {
        // Remove the item
        return prev.filter(item => item.key !== key);
      } else {
        // Add the item
        return [...prev, { key, datasource, tableName }];
      }
    });
  };

  //label when clicked invoke file updoad
  const handleLabelClick = () => {
    fileInputRef.current.click();
  };
  // onchange for file upload
  const changeHandler = (event) => {
    const newFiles = Array.from(event.target.files);
    const uniqueNewFiles = newFiles.filter(
      newFile => !folderFiles.some(
        prevFile => prevFile.name === newFile.name && prevFile.size === newFile.size
      )
    );
    setFile(prevFiles => [...prevFiles, ...uniqueNewFiles]);
    event.target.value = null;
  };
  //remove file
  const removeFile = (selectedFile) => {
    const newFiles = folderFiles.filter(
      file => !(file.name === selectedFile.name && file.size === selectedFile.size)
    );
    setFile(newFiles);
  }
  //setting module name
  useEffect(() => {
    dispatch(updateProjectDetails({ field: "moduleName", value: "Database Analytics" }));
    dispatch(updateProjectDetails({ field: "subModule", value: "Substr and Concat All Entities" }));
  }, []);
  useEffect(() => {
    if (projectDetails.subModule === 'Substr and Concat All Entities') {
      fetchPrev();
      fetchValues();
    }
  }, [projectDetails]);
  //fetch previous datas
  const fetchPrev = useCallback(async () => {
    try {
      const response = await axios.post(
        `${API_URL}/api/databaseAnalyticsRoute/prevs`,
        { projectDetails },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authState.token}`,
          },
        }
      );
      setOutData(response.data.output);
      selectOutFile('');
      const fetchedData = response.data.prevDatas[0];
      setConfig(fetchedData.config);
      setCheckedEntities(fetchedData.checkedEntities);
      setFile(fetchedData.inputFiles);
      setPreSaveSettings({ distinctCount: fetchedData.distinctCount || '', nrows_source_var: fetchedData.nrowsSource || '', nrows_other_source_var: fetchedData.nrowsOtherSource || '' });
    } catch (error) {
      console.error('Error in fetching Prev datas:', error.response?.data || error.message);
    }
  }, [API_URL, authState.token, projectDetails]);
  const fetchValues = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/datasourceroute/getSettingsData`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authState.token}`,
        },
      });
      const data = response.data.settings['substrConcatAllEntities'];
      if (data) {
        setDefaultSettings({ distinctCount: data.distinctCount || '', nrows_source_var: data.nrowsSource || '', nrows_other_source_var: data.nrowsOtherSource || '' });
      }

    }
    catch (error) {
      console.error('Error fetching settings values:', error);
    }
  }

  useEffect(() => {
    if (preSaveSettings?.distinctCount || preSaveSettings?.nrows_source_var || preSaveSettings?.nrows_other_source_var) {
      setSubstrEntitiesSettings(preSaveSettings);
    } else if (defaultSettings?.distinctCount || defaultSettings?.nrows_source_var || defaultSettings?.nrows_other_source_var) {
      setSubstrEntitiesSettings(defaultSettings);
    }
  }, [preSaveSettings, defaultSettings]);


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
      link.download = selectedOut.replace(/\.(xlsx|csv)$/, '.csv');
      link.click();
    }

  };

  const callAction = async () => {
    const formData = new FormData();
    const selectedFiles = [...new Set(
      checkedEntities
        .filter(item => item.datasource === "Computer_Files")
        .map(item => item.tableName)
    )];

    const selectedFolderFiles = folderFiles.filter(file =>
      selectedFiles.includes(file.name)
    );

    selectedFolderFiles.forEach(file => {
      formData.append("files", file);
    });
    const inputFiles = selectedFolderFiles.map(({ name }) => ({ name }));
    const jsonData = {
      projectDetails,
      config,
      checkedEntities,
      inputFiles,
      substrEntitiesSettings
    }
    formData.append('data', JSON.stringify(jsonData));

    setExecution(true);

    try {
      const response = await axios.post(`${API_URL}/api/databaseAnalyticsRoute/substrConcatAllEntities`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${authState.token}`,
        },
      });
      setOutData(response.data.outputData);
      selectOutFile('');
    } catch (error) {
      console.error('Error in executing Script:', error.response?.data || error.message);
    } finally {
      setExecution(false);
    }
  };
  const isChecked = (source, name) => checkedEntities.some(item => item.key === `${source}_${name}`);

  return (
    <>
      <aside className={`${sidebarStyles["secondary-sidebar"]} scrollbar`}>
        <form className={sidebarStyles['datasource-container-form']} onSubmit={handleDatasourceSubmit}>
          <SelectDatasource icon={postgresIcon} selectedValue={config.postgres} options={postgresDatasources.map(item => item.datasource)} onChange={(e) => selectDatasource(e, "postgres")} />
          <SelectDatasource icon={mysqlIcon} options={mysqlDatasources.map(item => item.datasource)} selectedValue={config.mySql} onChange={(e) => selectDatasource(e, "mySql")} />
          <SelectDatasource icon={folderIcon} options={foldersource.map(item => item.datasource)} selectedValue={config.folderSource} onChange={(e) => selectDatasource(e, "folderSource")} />
          <button type="submit" className="sidebar-btn">Fetch</button>
        </form>
        {(Object.keys(fetchedTables).length > 0 || folder) && (
          <div className={sidebarStyles["entity-container"]}>
            <p className={sidebarStyles['entity-title']}>Tables & Files</p>
            {fetchedTables && Object.entries(fetchedTables).map(([datasource, tables]) => (
              <div className={sidebarStyles["entity-block"]} key={datasource}>
                <p className={sidebarStyles['datasource-name']}>{datasource}</p>
                {tables.map((table, tabIndex) => (
                  <div className={sidebarStyles['entity-detail']} key={`${table.tableName}_${tabIndex}`}>
                    <span
                      className={`checkbox ${checkedEntities.some(item => item.key === `${datasource}_${table.tableName}`) ? 'checked' : ''}`}
                      onClick={() => handleCheckboxChange(datasource, table.tableName)}
                    >
                      {checkedEntities.some(item => item.key === `${datasource}_${table.tableName}`) && (
                        <CheckIcon className="checkicon" />
                      )}
                    </span>
                    <span className={sidebarStyles["tableName"]}>{table.tableName}</span>
                  </div>
                ))}
              </div>
            ))}

            {folder && (<div className="entity-block">
              <div onClick={handleLabelClick} style={{ display: "flex", gap: "0.5rem", cursor: "pointer" }}>
                <FontAwesomeIcon icon={faFileCsv} style={{ fontSize: '1rem', color: '#A84' }} />
                <p className={sidebarStyles['datasource-name']}>Computer_Files</p>
                <input
                  type="file"
                  name="files"
                  onChange={changeHandler}
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  multiple
                />
              </div>
              {folderFiles.length > 0 && folderFiles.map((item, tabIndex) => {
                let fileName = item.name.replace(/\.(csv|xlsx)$/i, '');
                fileName = fileName.length > 20
                  ? `${fileName.slice(0, 10)}...${fileName.slice(-6)}`
                  : fileName;
                return (
                  <div className={sidebarStyles['entity-detail']} key={item.name}>
                    <span
                      className={`checkbox ${isChecked('Computer_Files', item.name) ? 'checked' : ''}`}
                      onClick={() => handleCheckboxChange('Computer_Files', item.name)}
                    >
                      {isChecked('Computer_Files', item.name) && (
                        <CheckIcon className="checkicon" />
                      )}
                    </span>
                    <span className={sidebarStyles["tableName"]}>{fileName}</span>
                    <span className="remove-file" onClick={() => removeFile(item)}><ClearIcon className='remove-icon' style={{ fontSize: "14px" }} /></span>
                  </div>
                );
              })}
            </div>)}
          </div>
        )}
        <button className={sidebarStyles['module-btn']} disabled={executing} onClick={callAction}>Submit</button>
      </aside>
      <main className={styles.moduleContent}>
        <div className={styles.optionBox}>
          <div className={styles.optionGroup}>
            <label htmlFor="distinctValues" className={styles.settingsLabel}>
              Count of distinct values per column
            </label>
            <input
              type="number"
              id="distinctValues"
              className={styles.inputBox}
              min="0"
              placeholder="e.g., 5"
              value={substrEntitiesSettings.distinctCount}
              onChange={(e) => setSubstrEntitiesSettings(prev => ({ ...prev, distinctCount: e.target.value }))}
            />
          </div>
          <div className={styles.optionGroup}>
            <label htmlFor="sourceVar" className={styles.settingsLabel}>
              nrows_source_var
            </label>
            <input
              type="number"
              id="sourceVar"
              className={styles.inputBox}
              min="0"
              placeholder="e.g., 5"
              value={substrEntitiesSettings.nrows_source_var}
              onChange={(e) => setSubstrEntitiesSettings(prev => ({ ...prev, nrows_source_var: e.target.value }))}
            />
          </div>
          <div className={styles.optionGroup}>
            <label htmlFor="otherSource" className={styles.settingsLabel}>
              nrows_other_source_var
            </label>
            <input
              type="number"
              id="otherSource"
              className={styles.inputBox}
              min="0"
              placeholder="e.g., 5"
              value={substrEntitiesSettings.nrows_other_source_var}
              onChange={(e) => setSubstrEntitiesSettings(prev => ({ ...prev, nrows_other_source_var: e.target.value }))}
            />
          </div>
        </div>

        <div className={styles.tablePanel}>
          <CustomSelect options={outputData.map((item) => item['fileName'])} onChange={(e) => selectOutFile(e.target.value)} selectedValue={selectedOut} placeholder={'select output file'} customStyles={{ container: { minWidth: "270px" } }} />
          <div className={styles.tableOptions}>
            <CustomSelect options={["csv", "xlsx"]} onChange={(e) => setExtension(e.target.value)} selectedValue={extension} placeholder={'select output extension'} customStyles={{ container: { maxWidth: "80px", borderTop: "0", borderRadius: "40%" }, list: { borderRadius: "10px" }, }} />
            <span className='download-cover' onClick={downloadFile}><FileDownloadIcon className='download-icon' /></span>
          </div>
        </div>
        {tableData.length > 0 && <div className="relation-table module-table">
          <table>
            <thead>
              <tr>
                {Object.keys(tableData[0]).map((header, idx) => <th key={idx}>{header}</th>)}
              </tr>
            </thead>
            <tbody>
              {
                tableData.map((data, idx) => (
                  <tr key={idx}>
                    {Object.values(data).map((item, idx) => <td key={idx}>{item}</td>)}
                  </tr>
                ))
              }
            </tbody>
          </table>

        </div>}
      </main>
    </>
  )
}

export default SubstrAndConcatEntities