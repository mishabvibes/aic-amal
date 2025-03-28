// models/institutionSchema.js
import mongoose from 'mongoose';

const institutionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  featuredImage: {
    type: Buffer, // Store image as binary data
    default: null,
  },
  facts: [{
    label: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
  }],
  established: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  
  },
}, {
  timestamps: true,
});

export default mongoose.models.Institution || mongoose.model('Institution', institutionSchema);