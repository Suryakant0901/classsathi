const mongoose = require('mongoose');

const attendanceRecordItemSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    rollNo: {
      type: Number,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    fatherName: {
      type: String,
      required: true
    },
    status: {
      type: String,
      required: true,
      enum: ['Present', 'Absent', 'Late', 'Leave'],
      default: 'Present'
    },
    remarks: {
      type: String,
      default: '',
      trim: true
    }
  },
  { _id: false }
);

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ['CREATED', 'CORRECTED'],
      default: 'CORRECTED'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    changedBy: {
      type: String,
      default: 'Admin'
    },
    reason: {
      type: String,
      default: 'Attendance correction'
    },
    changes: [
      {
        rollNo: Number,
        name: String,
        oldStatus: String,
        newStatus: String,
        oldRemarks: String,
        newRemarks: String
      }
    ]
  },
  { _id: true }
);

const attendanceSchema = new mongoose.Schema(
  {
    date: {
      type: String, // Stored as YYYY-MM-DD
      required: [true, 'Attendance date is required']
    },
    studentClass: {
      type: String,
      required: [true, 'Class is required'],
      enum: ['9', '10']
    },
    records: [attendanceRecordItemSchema],
    summary: {
      total: { type: Number, default: 0 },
      present: { type: Number, default: 0 },
      absent: { type: Number, default: 0 },
      late: { type: Number, default: 0 },
      leave: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 }
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    auditTrail: [auditLogSchema]
  },
  { timestamps: true }
);

// Compound index to guarantee uniqueness of attendance per (date + class)
attendanceSchema.index({ date: 1, studentClass: 1 }, { unique: true });

// Helper to compute summary before saving
attendanceSchema.methods.calculateSummary = function () {
  let present = 0;
  let absent = 0;
  let late = 0;
  let leave = 0;

  this.records.forEach((rec) => {
    if (rec.status === 'Present') present++;
    else if (rec.status === 'Absent') absent++;
    else if (rec.status === 'Late') late++;
    else if (rec.status === 'Leave') leave++;
  });

  const total = this.records.length;
  // In attendance calculations, Present counts as 1, Late counts as present (or partial), Leave is exempt/leave
  // Standard school percentage: (Present + Late) / Total * 100
  const effectivePresent = present + late;
  const percentage = total > 0 ? Number(((effectivePresent / total) * 100).toFixed(1)) : 0;

  this.summary = {
    total,
    present,
    absent,
    late,
    leave,
    percentage
  };
};

module.exports = mongoose.model('Attendance', attendanceSchema);
