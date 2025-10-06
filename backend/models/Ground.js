import mongoose from 'mongoose';

const groundSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ground name is required'],
    minlength: [3, 'Name must be at least 3 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: [50, 'Description must be at least 50 characters']
  },
  price: {
    type: Number,
    required: true,
    min: [1, 'Price must be at least ₹1']
  },
  openingTime: String,
  closingTime: String,
  is24x7: Boolean,
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: {
      type: String,
      required: true,
      validate: {
        validator: v => /^\d{6}$/.test(v),
        message: 'Invalid pincode (6 digits required)'
      }
    },
    landmark: String
  },
  gallery: [String],
  cover: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },isActive: {
    type: Boolean,
    default: true
  },
}, { timestamps: true });

const Ground = mongoose.model('Ground', groundSchema);
export default Ground;