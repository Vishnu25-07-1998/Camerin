const mongoose = require('mongoose');

const PreSaveSchema = new mongoose.Schema({
    projectName: { type: String, required: true },
    groupName: { type: String, required: true },
    moduleName: { type: String, required: true },
    subModule: { type: String, required: true },
    config: { type: Object },
    checkedEntities: [{ type: Object }],
    inputFiles: [{ type: Object }],
    distinctCount: { type: Number },
    maxCharLoop: { type: Number },
    nrowsSource: { type: Number },
    nrowsOtherSource: { type: Number },
    maxUniqueKeys: { type: Number },
    maxColumnsInKey: { type: Number },
    maxKeyCombosCheck: { type: Number },
    maxKeyCombosIdentified: { type: Number },
    outputFiles: [{ type: String }],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
});

const PreSave = mongoose.model('PreSave', PreSaveSchema);

module.exports = PreSave;