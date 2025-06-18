const mongoose = require("mongoose")

const visitorRequestSchema = new mongoose.Schema(
  {
    visitorName: {
      type: String,
      required: [true, "Visitor name is required"],
      trim: true,
      maxlength: [100, "Visitor name cannot exceed 100 characters"],
    },
    visitorId: {
      type: String,
      required: [true, "Visitor ID is required"],
      trim: true,
      maxlength: [50, "Visitor ID cannot exceed 50 characters"],
    },
    visitorPhone: {
      type: String,
      required: [true, "Visitor phone is required"],
      match: [/^[+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"],
    },
    visitorEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    purpose: {
      type: String,
      required: [true, "Purpose of visit is required"],
      maxlength: [500, "Purpose cannot exceed 500 characters"],
    },
    itemsBrought: [
      {
        type: String,
        trim: true,
        maxlength: [100, "Item description cannot exceed 100 characters"],
      },
    ],
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Requested by is required"],
    },
    visitDuration: {
      hours: {
        type: Number,
        default: 0,
        min: [0, "Hours cannot be negative"],
        max: [23, "Hours cannot exceed 23"],
      },
      days: {
        type: Number,
        default: 0,
        min: [0, "Days cannot be negative"],
        max: [30, "Days cannot exceed 30"],
      },
    },
    scheduledDate: {
      type: Date,
      required: [true, "Scheduled date is required"],
      validate: {
        validator: (date) => date >= new Date().setHours(0, 0, 0, 0),
        message: "Scheduled date cannot be in the past",
      },
    },
    scheduledTime: {
      type: String,
      required: [true, "Scheduled time is required"],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please enter time in HH:MM format"],
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "approved", "declined", "checked_in", "checked_out", "expired"],
        message: "Status must be pending, approved, declined, checked_in, checked_out, or expired",
      },
      default: "pending",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
    reviewComments: {
      type: String,
      maxlength: [500, "Review comments cannot exceed 500 characters"],
    },
    approvalCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for better query performance
visitorRequestSchema.index({ status: 1 })
visitorRequestSchema.index({ department: 1 })
visitorRequestSchema.index({ scheduledDate: 1 })
visitorRequestSchema.index({ requestedBy: 1 })
visitorRequestSchema.index({ approvalCode: 1 })

// Generate approval code when approved
visitorRequestSchema.pre("save", function (next) {
  if (this.isModified("status") && this.status === "approved" && !this.approvalCode) {
    this.approvalCode = "VIS" + Date.now().toString().slice(-6) + Math.random().toString(36).substr(2, 3).toUpperCase()
  }
  next()
})

// Auto-expire old pending requests
visitorRequestSchema.pre("save", function (next) {
  if (this.status === "pending" && this.scheduledDate < new Date()) {
    this.status = "expired"
  }
  next()
})

module.exports = mongoose.model("VisitorRequest", visitorRequestSchema)
