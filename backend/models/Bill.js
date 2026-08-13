const mongoose = require('mongoose');

const treatmentItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    charge: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const billSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    treatments: { type: [treatmentItemSchema], default: [] },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentStatus: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },
    paymentMethod: { type: String, enum: ['cash', 'card', 'insurance', 'online'], default: 'cash' },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

billSchema.pre('validate', function (next) {
  if (this.treatments && this.treatments.length > 0) {
    this.totalAmount = this.treatments.reduce((sum, t) => sum + t.charge, 0);
  }
  next();
});

module.exports = mongoose.model('Bill', billSchema);
