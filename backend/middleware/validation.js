const { body, validationResult } = require("express-validator")
const { AppError } = require("../utils/appError")

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg)
    return next(new AppError(errorMessages.join(". "), 400))
  }
  next()
}

const validateLogin = [
  body("username")
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  handleValidationErrors,
]

const validateVisitorRequest = [
  body("visitorName")
    .notEmpty()
    .withMessage("Visitor name is required")
    .isLength({ max: 100 })
    .withMessage("Visitor name cannot exceed 100 characters"),
  body("visitorId")
    .notEmpty()
    .withMessage("Visitor ID is required")
    .isLength({ max: 50 })
    .withMessage("Visitor ID cannot exceed 50 characters"),
  body("visitorPhone")
    .notEmpty()
    .withMessage("Visitor phone is required")
    .matches(/^[+]?[1-9][\d]{0,15}$/)
    .withMessage("Please enter a valid phone number"),
  body("purpose")
    .notEmpty()
    .withMessage("Purpose of visit is required")
    .isLength({ max: 500 })
    .withMessage("Purpose cannot exceed 500 characters"),
  body("scheduledDate")
    .notEmpty()
    .withMessage("Scheduled date is required")
    .isISO8601()
    .withMessage("Please enter a valid date"),
  body("scheduledTime")
    .notEmpty()
    .withMessage("Scheduled time is required")
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Please enter time in HH:MM format"),
  handleValidationErrors,
]

module.exports = {
  validateLogin,
  validateVisitorRequest,
  handleValidationErrors,
}
