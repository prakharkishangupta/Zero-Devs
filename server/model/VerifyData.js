const mongoose = require('mongoose')
const { Schema } = mongoose;
const VerificatioSchema = new Schema({
    user:{type: mongoose.Schema.Types.ObjectId, ref:'user'},
    isVerified: { type: Boolean, default: false},
    idPhoto: { type: String, required: true},
    liveVideo: { type: String, required: true },
    photo: {type: String, required: true},
    date:{type:Date, default:Date.now}
  });

module.exports = mongoose.model('verify-data', VerificatioSchema)