const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    rollNo: {
      type: Number,
      required: [true, 'Roll number is required'],
      min: [1, 'Roll number must be at least 1']
    },
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true
    },
    fatherName: {
      type: String,
      required: [true, "Father's name is required"],
      trim: true
    },
    studentClass: {
      type: String,
      required: [true, 'Class is required (9 or 10)'],
      enum: {
        values: ['9', '10'],
        message: 'Class must be either 9 or 10'
      }
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      default: 'Male'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Prevent duplicate roll numbers in the same class
studentSchema.index({ rollNo: 1, studentClass: 1 }, { unique: true });

module.exports = mongoose.model('Student', studentSchema);
