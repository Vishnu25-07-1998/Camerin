import MappingColumns from '../../datas/MappingColumns';
import defaultMappingData from '../../datas/defaultMappingData';
import mappingHeaders from '../../datas/mappingHeaders';
import { useState, useRef, useMemo, useEffect } from "react";
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import FilterList from "@mui/icons-material/FilterList";
import Papa from 'papaparse';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import FixedDropdown from '../../widgets/customWidgets/fixeddropdown/FixedDropdown';
import AutoComplete from '../../widgets/customWidgets/autocomplete/AutoComplete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PropTypes from "prop-types";
import './mappingsheet.css';

const MappingSheet = ({ schemaEntries, filteredSchema, setFilteredSchema }) => {
    const columns = MappingColumns();
    const defaultData = defaultMappingData;
    const [dropdownOptions, setDropdownOptions] = useState({
        datasource: [],
        sourceEntity: [],
        sourceAttribute: [],
    });
    const [editingIndex, setEditingIndex] = useState(null);
    const [initialRowData, setRowData] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const mappingSheetRef = useRef(null);
    const filterConditions = [
        "= 'x'",
        "in ('x','x')",
        "Text contains",
        "Text does not contain",
        "Text starts with",
        "Text ends with",
        "Numeric >",
        "Numeric >=",
        "Numeric <",
        "Numeric <=",
        "Numeric Not equal to",
        "Numeric Between",
        "Numeric Not in between",
        "Date before",
        "Date after",
        "is null",
        "is not null"
    ];
    const filteredRows = useMemo(() => {
        return filteredSchema.filter((row) =>
            columns.some((col) =>
                (row[col.accessorKey] || "").toString().toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [filteredSchema, columns, searchTerm]);
    useEffect(() => {
        const datasource = [...new Set(schemaEntries.map(item => item.datasource))];

        const sourceEntity = schemaEntries
            .filter(entry => entry.datasource === initialRowData.datasource)
            .map(item => item.sourceEntity);

        const sourceAttribute = schemaEntries
            .filter(entry => entry.datasource === initialRowData.datasource &&
                entry.sourceEntity === initialRowData.sourceEntity)
            .reduce((acc, item) => acc.concat(item.sourceAttributes), []);

        setDropdownOptions({
            datasource,
            sourceEntity,
            sourceAttribute,
        });

    }, [initialRowData, schemaEntries]);
    const addRows = () => {
        setFilteredSchema(prevData => {
            const newId = prevData.length + 1;
            return [...prevData, { ...defaultData, id: newId }];
        });
    };
    const changeHandler = (event) => {
        const files = event.target.files[0];
        if (!files) return;

        Papa.parse(files, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => {

                const fileHeaders = result.meta.fields;

                // Check if all file headers exist in mappingHeaders
                const isValid = fileHeaders.every(header => Object.keys(mappingHeaders).includes(header));

                if (!isValid) {
                    console.error("Error: Uploaded file headers do not match expected headers.");
                    alert("Invalid file format. Please upload a file with the correct headers.");
                    return;
                }

                const parsedData = result.data.map((row, index) => {
                    const mappedRow = {};
                    for (const key in row) {
                        if (mappingHeaders[key]) {
                            mappedRow[mappingHeaders[key]] = row[key];
                        }
                    }
                    mappedRow.id = filteredSchema.length + index + 1;
                    return mappedRow;
                });
                setFilteredSchema((prevSchema) => [...prevSchema, ...parsedData]);
            },
            error: (error) => {
                console.error("Parsing Error:", error.message);
            },
        });

        event.target.value = null;
    };
    useEffect(() => {
        const needsUpdate = filteredSchema.some((item, index) => item.id !== index + 1);
        if (needsUpdate) {
            const updatedSchema = filteredSchema.map((item, index) => ({
                ...item,
                id: index + 1,
            }));
            setFilteredSchema(updatedSchema);
        }
    }, [filteredSchema, setFilteredSchema]);

    const handleSpanClick = () => {
        mappingSheetRef.current.click();
    };
    const editMappingTable = (row) => {
        setEditingIndex(row.id);
        setRowData({ ...row });
    }

    const cancelEdit = () => {
        setEditingIndex(null);
        setRowData({});
    }

    const handleDelete = (row) => {
        setFilteredSchema((prevSchema) => prevSchema.filter((item) => item.id !== row.id));
    };
    const handleChange = (e, field) => {
        let value = e.target.value;
        if (field === 'sourceEntityAlias') {
            value = value.replace(/\s+/g, '_');
        }
        setRowData((prevData) => {
            const newData = { ...prevData, [field]: value };
            if (field === 'datasource') {
                newData.sourceEntity = '';
            }

            if (field === 'datasource' || field === 'sourceEntity') {
                newData.sourceEntityAlias = '';
                newData.sourceAttribute = '';
            }

            return newData;
        });
    };
    const saveChanges = () => {
        setEditingIndex(null);
        if (!initialRowData.sourceEntityAlias) {
            initialRowData.sourceEntityAlias = initialRowData.sourceEntity;
        }
        setFilteredSchema(prevSchema =>
            prevSchema.map(item =>
                item.id === initialRowData['id'] ? initialRowData : item
            )
        );
        setRowData({});
    }
    return (
        <div className="mappingsheet">
            <div className="etl-table-panel">
                <span className="addRows" onClick={addRows}>
                    Add Rows
                </span>
                <div className="table-options">
                    <span className="label-box" onClick={handleSpanClick}>Upload Mappingsheet</span>
                    <input type="file"
                        name="mappingFiles"
                        onChange={changeHandler}
                        ref={mappingSheetRef}
                        style={{ display: 'none' }}
                    />
                    <input type="text" className='search-input' placeholder='Search' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    <span className='download-cover'><FileDownloadIcon className='download-icon' /></span>
                    <FilterList
                        sx={{
                            marginRight: 2,
                            cursor: "pointer",
                            border: "1px solid #ccc",
                            backgroundColor: "#007bff",
                            fontSize: "36px",
                            padding: "4px",
                            color: "#fff",
                        }}
                        className="filter-icon"
                    />
                </div>
            </div>
            <div className="relation-table">
                <table>
                    <thead>
                        <tr>
                            <th>Actions</th>
                            {columns.filter(column => !column.hidden).map((column) => (
                                <th key={column.header}>{column.header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRows.map((row) => (
                            <tr key={row.id}>
                                <td>
                                    {editingIndex === row.id ? (
                                        <div style={{ display: 'flex' }}>
                                            <span onClick={saveChanges}><CheckIcon style={{ color: 'green', marginRight: '10px', cursor: 'pointer', fontSize: 'large' }} /></span>
                                            <span onClick={cancelEdit}><CloseIcon style={{ color: 'red', cursor: 'pointer', fontSize: 'large' }} /></span>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex' }}>
                                            <span onClick={() => editMappingTable(row)}><EditIcon style={{ color: 'blue', marginRight: '10px', cursor: 'pointer', fontSize: 'medium' }} /></span>
                                            <span onClick={() => handleDelete(row)}><DeleteOutlineIcon style={{ color: 'red', cursor: 'pointer', fontSize: 'medium' }} /></span>
                                        </div>
                                    )}
                                </td>
                                {columns.filter(column => !column.hidden).map((column) => {
                                    const isEditable = editingIndex === row.id && column.editable;
                                    const cellValue = initialRowData[column.accessorKey] || '';

                                    if (isEditable) {
                                        if (dropdownOptions[column.accessorKey]) {
                                            return (
                                                <td key={column.accessorKey}>
                                                    <FixedDropdown selectedValue={cellValue} options={dropdownOptions[column.accessorKey]} onChange={(e) => handleChange(e, column.accessorKey)} placeholder={column.header} />
                                                </td>
                                            );
                                        } else if (column.multiLine & column.accessorKey !== 'filterCondition') {
                                            return (
                                                <td key={column.accessorKey}>
                                                    <textarea value={cellValue} onChange={(e) => handleChange(e, column.accessorKey)} className="tableTextArea" placeholder={column.header} autoComplete="off" ></textarea>
                                                </td>
                                            );
                                        } else if (column.accessorKey === 'filterCondition') {
                                            return (
                                                <td key={column.accessorKey}>
                                                    <AutoComplete
                                                        selectedValue={cellValue}
                                                        options={filterConditions.filter((option) =>
                                                            option.toLowerCase().includes(cellValue.toLowerCase())
                                                        )}
                                                        onChange={(e) => handleChange(e, column.accessorKey)}
                                                        placeholder={column.header}
                                                    />
                                                </td>
                                            );
                                        }
                                        else if (column.accessorKey === 'sourceEntityAlias') {
                                            return (
                                                <td key={column.accessorKey}>
                                                    <input type="text" value={cellValue || initialRowData.sourceEntity} onChange={(e) => handleChange(e, column.accessorKey)} className="tableTextInput" placeholder={column.header} autoComplete="off" />
                                                </td>
                                            );
                                        }
                                        else {
                                            return (
                                                <td key={column.accessorKey}>
                                                    <input type="text" value={cellValue} onChange={(e) => handleChange(e, column.accessorKey)} className="tableTextInput" placeholder={column.header} autoComplete="off" />
                                                </td>
                                            );
                                        }
                                    }
                                    return (
                                        <td key={column.accessorKey}>
                                            {typeof row[column.accessorKey] === 'string'
                                                ? row[column.accessorKey].split('\n').map((line, index) => (
                                                    <span key={index}>
                                                        {line}
                                                        <br />
                                                    </span>
                                                ))
                                                : row[column.accessorKey]}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

MappingSheet.propTypes = {
    filteredSchema: PropTypes.array,
    setFilteredSchema: PropTypes.func.isRequired,
    schemaEntries: PropTypes.array.isRequired,
};

export default MappingSheet