import { createSlice } from '@reduxjs/toolkit'

const savedProjectData = JSON.parse(localStorage.getItem('projectDetails')) || {};
export const dbSlice = createSlice({
    name: 'dbms',
    initialState: {
        projectDetails: {
            projectName: savedProjectData.projectName || '',
            groupName: savedProjectData.groupName || '',
            moduleName: '',
            subModule: '',
        },
        datasources: [],
        config: {
            postgres: '',
            mySql: '',
            folderSource: '',
        },
        folder: false,
        checkedEntities: [],
        computerFiles: [],
        fetchedTables: [],
        modalScreen: false,
    },

    reducers: {
        setModalScreen: (state, action) => {
            state.modalScreen = action.payload;
        },
        updateProjectDetails: (state, action) => {
            const { field, value } = action.payload;
            state.projectDetails[field] = value;

            if (field === 'projectName' || field === 'groupName') {
                const toSave = {
                    projectName: field === 'projectName' ? value : state.projectDetails.projectName,
                    groupName: field === 'groupName' ? value : state.projectDetails.groupName
                };
                localStorage.setItem('projectDetails', JSON.stringify(toSave));
            }
        },
        setDatasources: (state, action) => {
            state.datasources = action.payload;
        },
        setConfig: (state, action) => {
            state.config = { ...state.config, ...action.payload };
        },
        setFolder: (state, action) => {
            state.folder = action.payload;
        },
        setFetchedTables: (state, action) => {
            state.fetchedTables = action.payload;
        },
        toggleCheckedEntity: (state, action) => {
            const { datasource, tableName } = action.payload;
            const key = `${datasource}_${tableName}`;
            const existingIndex = state.checkedEntities.findIndex(item => item.key === key);
            if (existingIndex > -1) {
                state.checkedEntities.splice(existingIndex, 1);
            } else {
                state.checkedEntities.push({ key, datasource, tableName });
            }
        },
        setCheckedEntities: (state, action) => {
            state.checkedEntities = action.payload;
        },
        resetState: (state) => {
            state.projectDetails = {
                projectName: '',
                groupName: '',
                moduleName: '',
                subModule: '',
            };
        }
    }
})

export const { setModalScreen, updateProjectDetails, setDatasources, setConfig, setFolder, setFetchedTables, toggleCheckedEntity, setCheckedEntities, resetState } = dbSlice.actions;

export default dbSlice.reducer