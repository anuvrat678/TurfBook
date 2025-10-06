import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ground: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ground',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  timeSlots: {
    type: [String],
    required: true,
    validate: {
      validator: function(slots) {
        // Check if slots are consecutive
        const timestamps = slots.map(s => parseInt(s.split(':')[0]));
        for (let i = 1; i < timestamps.length; i++) {
          if (timestamps[i] !== timestamps[i-1] + 2) return false;
        }
        return true;
      },
      message: 'Slots must be consecutive 2-hour blocks'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  totalAmount: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;