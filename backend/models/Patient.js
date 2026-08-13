const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 0, max: 150 },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    phone: { type: String, required: true },
    email: { type: String, lowercase: true, trim: true },
    address: { type: String },
    medicalHistory: [
      {
        condition: String,
        diagnosedOn: Date,
        notes: String,
      },
    ],
    bloodGroup: { type: String },
    registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

patientSchema.index({ name: 'text', phone: 'text' });

module.exports = mongoose.model('Patient', patientSchema);
