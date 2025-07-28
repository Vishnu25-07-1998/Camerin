import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    config: {
        postgres: '',
        mySql: '',
        folder: '',
    },
    fetchedTables: {},
    checkedEntities: [],
    computerFiles: []
};


export const etlSlice = createSlice({
    name: "etl",
    initialState,
    reducers: {
        setConfig(state, action) {
            state.config = { ...state.config, ...action.payload };
        },
        setFetchedTables(state, action) {
            state.fetchedTables = action.payload;
        },
        setCheckedEntities(state, action) {
            state.checkedEntities = action.payload;
        },
        addCheckedEntity(state, action) {
            state.checkedEntities.push(action.payload);
        },
        removeCheckedEntity(state, action) {
            state.checkedEntities = state.checkedEntities.filter(item => item.key !== action.payload.key);
        },
        setComputerFiles(state, action) {
            state.computerFiles = action.payload;
        },
        addComputerFile(state, action) {
            const exists = state.computerFiles.find(f => f.name === action.payload.name);
            if (!exists) state.computerFiles.push(action.payload);
        },
        removeComputerFile(state, action) {
            state.computerFiles = state.computerFiles.filter(file => file.name !== action.payload.name);
        },
        resetETLState(state) {
            Object.assign(state, initialState);
        }
    }

})

export const {
    setConfig, setFetchedTables, setCheckedEntities,
    addCheckedEntity, removeCheckedEntity,
    setComputerFiles, addComputerFile, removeComputerFile,
    resetETLState
  } = etlSlice.actions;

export default etlSlice.reducer;