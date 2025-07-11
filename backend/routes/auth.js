const express = require("express")
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const { register, login, getCurrentUser, logout } = require("../controllers/authController")
const { auth, authorize } = require("../middleware/auth")
const { validateLogin, validateRegistration } = require("../middleware/validation")

const router = express.Router()

// Public routes
router.post("/login", validateLogin, login)
router.post("/register", validateRegistration, register) // Public registration route with validation

// Protected routes
router.use(auth) // All routes below require authentication

router.get("/me", getCurrentUser)
router.post("/logout", logout)

// Admin only routes
// router.post("/register", authorize("admin"), register)

module.exports = router
