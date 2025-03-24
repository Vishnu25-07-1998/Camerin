import SourceRelationColumns from '../../datas/SourceRelationColumns';
import defaultSourceRelationData from '../../datas/defaultSourceRelationData';
import sourceHeaders from '../../datas/sourceHeaders';
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

const SourceRelationSheet = ({ schemaEntries, filteredSchema, sourceRelation, setSourceRelation }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [initialRowData, setRowData] = useState({});
  const sourceSheetRef = useRef(null);
  const columns = SourceRelationColumns();
  const changeHandler = (event) => {
    const files = event.target.files[0];
    if (!files) return;

    Papa.parse(files, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {

        const fileHeaders = result.meta.fields;

        // Check if all file headers exist in mappingHeaders
        const isValid = fileHeaders.every(header => Object.keys(sourceHeaders).includes(header));

        if (!isValid) {
          console.error("Error: Uploaded file headers do not match expected headers.");
          alert("Invalid file format. Please upload a file with the correct headers.");
          return;
        }

        const parsedData = result.data.map((row, index) => {
          const mappedRow = {};
          for (const key in row) {
            if (sourceHeaders[key]) {
              mappedRow[sourceHeaders[key]] = row[key];
            }
          }
          mappedRow.id = sourceRelation.length + index + 1;
          return mappedRow;
        });
        setSourceRelation((prevSchema) => [...prevSchema, ...parsedData]);
      },
      error: (error) => {
        console.error("Parsing Error:", error.message);
      },
    });

    event.target.value = null;
  };
  const handleSpanClick = () => {
    sourceSheetRef.current.click();
  };
  const filteredRows = useMemo(() => {
    return sourceRelation.filter((row) =>
      columns.some((col) =>
        (row[col.accessorKey] || "").toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [sourceRelation, columns, searchTerm]);
  const addRows = () => {
    setSourceRelation(prevData => {
      const newId = prevData.length + 1;
      return [...prevData, { ...defaultSourceRelationData, id: newId }];
    });
  };
  useEffect(() => {
    const needsUpdate = sourceRelation.some((item, index) => item.id !== index + 1);
    if (needsUpdate) {
      const updatedSchema = sourceRelation.map((item, index) => ({
        ...item,
        id: index + 1,
      }));
      setSourceRelation(updatedSchema);
    }
  }, [sourceRelation, setSourceRelation]);
  const editSourceRelationTable = (row) => {
    setEditingIndex(row.id);
    setRowData({ ...row });
  }
  const cancelEdit = () => {
    setEditingIndex(null);
    setRowData({});
  }
  const handleDelete = (row) => {
    setSourceRelation((prevSchema) => prevSchema.filter((item) => item.id !== row.id));
  };
  const handleChange = (e, field) => {
    const { value } = e.target;
    setRowData((prevData) => {
      const newData = { ...prevData, [field]: value };

      if (field === 'leftDatasource' || field === 'leftSourceEntity') {
        newData.leftSourceEntityAlias = '';
      }

      if (field === 'rightDatasource' || field === 'rightSourceEntity') {
        newData.rightSourceEntityAlias = '';
      }

      return newData;
    });
  };
  const saveChanges = () => {
    setEditingIndex(null);
    if (!initialRowData.sourceEntityAlias) {
      initialRowData.sourceEntityAlias = initialRowData.sourceEntity;
    }
    setSourceRelation(prevSchema =>
      prevSchema.map(item =>
        item.id === initialRowData['id'] ? initialRowData : item
      )
    );
    setRowData({});
  }

  const datasources = Array.from(new Set(filteredSchema.map(entry => entry.datasource)));
  if (initialRowData.id > 1) {
    datasources.push('Tool_Temp');
  }
  const isTooltempLeft = initialRowData.leftDatasource === 'Tool_Temp';
  const isTooltempRight = initialRowData.rightDatasource === 'Tool_Temp';
  const uniqueTargetTempOutputNumbers = Array.from(
    new Set(sourceRelation.filter(item => item.id < initialRowData.id).map(item => item.targetTempOutputNumber))
  );
  const leftUniqueRelations = [
    ...new Set(
      sourceRelation
        .filter(item => item.targetTempOutputNumber === initialRowData.leftSourceEntity && item.id < initialRowData.id)
        .flatMap(({ leftDatasource, leftSourceEntity, rightDatasource, rightSourceEntity }) => [
          { datasource: leftDatasource, sourceEntity: leftSourceEntity },
          { datasource: rightDatasource, sourceEntity: rightSourceEntity }
        ])
        .map(item => JSON.stringify(item))
    )
  ].map(item => JSON.parse(item));
  const leftTempSourceAttributes = leftUniqueRelations.flatMap(({ datasource, sourceEntity }) =>
    filteredSchema
      .filter(schemaItem => schemaItem.datasource === datasource && schemaItem.sourceEntity === sourceEntity)
      .map(schemaItem => `${schemaItem.datasource}_${schemaItem.sourceAttribute}`)
  )
  const rightUniqueRelations = [
    ...new Set(
      sourceRelation
        .filter(item => item.targetTempOutputNumber === initialRowData.rightSourceEntity && item.id < initialRowData.id)
        .flatMap(({ leftDatasource, leftSourceEntity, rightDatasource, rightSourceEntity }) => [
          { datasource: leftDatasource, sourceEntity: leftSourceEntity },
          { datasource: rightDatasource, sourceEntity: rightSourceEntity }
        ])
        .map(item => JSON.stringify(item))
    )
  ].map(item => JSON.parse(item));
  const rightTempSourceAttributes = rightUniqueRelations.flatMap(({ datasource, sourceEntity }) =>
    filteredSchema
      .filter(schemaItem => schemaItem.datasource === datasource && schemaItem.sourceEntity === sourceEntity)
      .map(schemaItem => `${schemaItem.datasource}_${schemaItem.sourceAttribute}`)
  )
  const leftSourceEntity = isTooltempLeft
    ? uniqueTargetTempOutputNumbers
    : filteredSchema
      .filter(entry => entry.datasource === initialRowData.leftDatasource)
      .map(item => item.sourceEntity);

  const leftSourceEntityAlias = (isTooltempLeft && initialRowData.leftSourceEntity)
    ? [initialRowData.leftSourceEntity]
    : filteredSchema
      .filter(item => item.datasource === initialRowData.leftDatasource && item.sourceEntity === initialRowData.leftSourceEntity)
      .map(item => item.sourceEntityAlias)
      .filter((value, index, self) => self.indexOf(value) === index);


  const leftAttributes = (isTooltempLeft && initialRowData.leftSourceEntity && initialRowData.leftSourceEntityAlias)
    ? leftTempSourceAttributes
    : schemaEntries
      .filter(entry => entry.datasource === initialRowData.leftDatasource && entry.sourceEntity === initialRowData.leftSourceEntity)
      .flatMap(item => item.sourceAttributes);

  const rightSourceEntity = isTooltempRight
    ? uniqueTargetTempOutputNumbers
    : filteredSchema
      .filter(entry => entry.datasource === initialRowData.rightDatasource)
      .map(item => item.sourceEntity)

  const rightSourceEntityAlias = (isTooltempRight && initialRowData.rightSourceEntity)
    ? [initialRowData.rightSourceEntity]
    : filteredSchema
      .filter(item => item.datasource === initialRowData.rightDatasource && item.sourceEntity === initialRowData.rightSourceEntity)
      .map(item => item.sourceEntityAlias).filter((value, index, self) => self.indexOf(value) === index);

  const rightSourceAttribute = (isTooltempRight && initialRowData.rightSourceEntity && initialRowData.rightSourceEntityAlias)
    ? rightTempSourceAttributes
    : schemaEntries
      .filter(entry => entry.datasource === initialRowData.rightDatasource && entry.sourceEntity === initialRowData.rightSourceEntity)
      .flatMap(item => item.sourceAttributes);
  const dropdownOptions = ({
    leftDatasource: datasources,
    leftSourceEntity,
    leftSourceEntityAlias,
    leftSourceAttribute: leftAttributes,
    rightDatasource: datasources,
    rightSourceEntity,
    rightSourceEntityAlias,
    rightSourceAttribute,
  });
  return (
    <div className='source-relation-sheet'>
      <div className="etl-table-panel">
        <span className="addRows" onClick={addRows}>
          Add Rows
        </span>
        <div className="table-options">
          <span className="label-box" onClick={handleSpanClick}>Upload Source Relation Sheet</span>
          <input type="file"
            name="sourceFiles"
            onChange={changeHandler}
            ref={sourceSheetRef}
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
                      <span onClick={() => editSourceRelationTable(row)}><EditIcon style={{ color: 'blue', marginRight: '10px', cursor: 'pointer', fontSize: 'medium' }} /></span>
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
                    } else if (column.multiLine) {
                      return (
                        <td key={column.accessorKey}>
                          <textarea value={cellValue} onChange={(e) => handleChange(e, column.accessorKey)} className="tableTextArea" placeholder={column.header} autoComplete="off" ></textarea>
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
                      {row[column.accessorKey]?.toString()?.split("\n").map((line, index) => (
                        <span key={index}>
                          {line}
                          <br />
                        </span>
                      ))}
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

SourceRelationSheet.propTypes = {
  sourceRelation: PropTypes.array,
  setSourceRelation: PropTypes.func,
  schemaEntries: PropTypes.array.isRequired,
  filteredSchema: PropTypes.array.isRequired,
};

export default SourceRelationSheet