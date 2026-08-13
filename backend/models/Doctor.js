const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      required: true,
    },
    startTime: { type: String, required: true }, // "09:00"
    endTime: { type: String, required: true }, // "17:00"
  },
  { _id: false }
);

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    specialization: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    availability: { type: [availabilitySchema], default: [] },
    consultationFee: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    linkedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

doctorSchema.index({ specialization: 1 });

module.exports = mongoose.model('Doctor', doctorSchema);
