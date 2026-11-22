const router = require("express").Router();
const asyncHandler = require("../utils/asyncHandler");
const c = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");
router.post("/register", asyncHandler(c.register));
router.post("/login", asyncHandler(c.login));
router.post("/refresh", asyncHandler(c.refresh));
router.post("/logout", authenticate, asyncHandler(c.logout));
module.exports = router;
