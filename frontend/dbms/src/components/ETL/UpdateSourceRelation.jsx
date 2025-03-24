import {useMemo} from 'react'
import CustomSelect from '../../widgets/customWidgets/customSelect/CustomSelect';

const UpdateSourceRelation = ({ sourceRelation, updatedSourceRelation, updateSourceRelation }) => {

    const tempTypeDatastoreOptions = ['My Computer', 'MySQL', 'Postgres'];
    const targetTempOutputs = useMemo(() => {
        return sourceRelation.length > 0
            ? [...new Set(sourceRelation.map(item => item.targetTempOutputNumber))].filter(Boolean)
            : [];
    }, [sourceRelation]);
    const updateOutput = (e, field, subField) => {
        const { value } = e.target;

        updateSourceRelation(prevState => ({
            ...prevState,
            [field]: {
                ...(prevState[field] || {}),
                [subField]: value,
            }
        }));
    };

    return (
        <>
            {targetTempOutputs.length > 0 &&
                targetTempOutputs.map((output, index) => (
                    <div className="update-source-relation" key={index}>
                        <h3 className='relation-title'>{output}</h3>
                        <div className="relation-details">
                            <div className="relation-detail-item">
                                <label>Temp Type Datastore</label>
                                <CustomSelect
                                    selectedValue={updatedSourceRelation[output]?.targetTempTypeOfDataStore || sourceRelation.find(item => item.targetTempOutputNumber === output)?.targetTempTypeOfDataStore}
                                    options={tempTypeDatastoreOptions}
                                    placeholder="Select Temp Type"
                                    onChange={(e) => updateOutput(e, output, "targetTempTypeOfDataStore")}
                                />
                            </div>
                            <div className="relation-detail-item">
                                <label>Target Name</label>
                                <CustomSelect
                                    selectedValue={updatedSourceRelation[output]?.targetName || sourceRelation.find(item => item.targetTempOutputNumber === output)?.targetName}
                                    options={tempTypeDatastoreOptions}
                                    placeholder="Select Target Name"
                                    onChange={(e) => updateOutput(e, output, "targetName")}
                                />
                            </div>
                            <div className="relation-detail-item">
                                <label >Target Datasource Name</label>
                                <CustomSelect
                                    selectedValue={updatedSourceRelation[output]?.targetDatasourceName || sourceRelation.find(item => item.targetTempOutputNumber === output)?.targetDatasourceName}
                                    options={[...new Set(
                                        sourceRelation.flatMap(item => [item.leftDatasource, item.rightDatasource])
                                    )]}
                                    placeholder="Target Datasource Name"
                                    onChange={(e) => updateOutput(e, output, "targetDatasourceName")}
                                />
                            </div>
                            <div className="relation-detail-item">
                                <label >Load Option</label>
                                <CustomSelect
                                    selectedValue={updatedSourceRelation[output]?.loadOption || sourceRelation.find(item => item.targetTempOutputNumber === output)?.loadOption}
                                    options={['Replace', 'Append']}
                                    placeholder="Load Option"
                                    onChange={(e) => updateOutput(e, output, "loadOption")}
                                />
                            </div>
                        </div>
                    </div>
                ))}
        </>
    )
}

export default UpdateSourceRelation