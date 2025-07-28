const mongoose = require("mongoose");

const distinctLenSchema = new mongoose.Schema({
    distinctCount: { type: Number, default: 10 },
}, { _id: false });

const distinctValuesSchema = new mongoose.Schema({
    distinctCount: { type: Number, default: 10 },
}, { _id: false });

const substrConcatColumnsSchema = new mongoose.Schema({
    distinctCount: { type: Number, default: 10 },
}, { _id: false });

const equalColumnsSchema = new mongoose.Schema({
    distinctCount: { type: Number, default: 10 },
}, { _id: false });

const columnCharEachCountSchema = new mongoose.Schema({
    distinctCount: { type: Number, default: 10 },
    maxCharLoop: { type: Number, default: 100 },
}, { _id: false });

const substrConcatAllEntitiesSchema = new mongoose.Schema({
    distinctCount: { type: Number, default: 10 },
    nrowsSource: { type: Number, default: 1000 },
    nrowsOtherSource: { type: Number, default: 500 },
}, { _id: false });

const uniqueKeySettingsSchema = new mongoose.Schema({
    maxUniqueKeys: { type: Number, default: 5 },
    maxColumnsInKey: { type: Number, default: 3 },
    maxKeyCombosCheck: { type: Number, default: 100 },
    maxKeyCombosIdentified: { type: Number, default: 10 },
}, { _id: false });

const settingsSchema = new mongoose.Schema(
    {
        // User reference
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

        // Sections
        distinctLength: distinctLenSchema,
        distinctValues: distinctValuesSchema,
        equalColumns: equalColumnsSchema,
        columnCharEachCount: columnCharEachCountSchema,
        substrConcatColumns: substrConcatColumnsSchema,
        substrConcatAllEntities: substrConcatAllEntitiesSchema,
        uniqueKeys: uniqueKeySettingsSchema,
    },
    { timestamps: true }
);
const SettingsValues = mongoose.model('SettingsValues', settingsSchema);
module.exports = SettingsValues;