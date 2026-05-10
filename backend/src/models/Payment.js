import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  transactionId: {
    type: String,
    required: [true, 'Transaction ID is required'],
    unique: true,
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'refunded'],
    required: [true, 'Payment status is required'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    trim: true
  }
}, {
  timestamps: true,
  collection: 'payments'
});

paymentSchema.index({ userId: 1, createdAt: -1 });

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
