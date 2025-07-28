import { configureStore } from "@reduxjs/toolkit";
import etlReducer from './etlSlice';
import dbmsReducer from './dbSlice';

export default configureStore({
    reducer: {
        etl: etlReducer,
        dbms: dbmsReducer,
    },
})