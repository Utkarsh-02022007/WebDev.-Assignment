const router = require("express").Router();
const { authenticate, authorize } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");
const c = require("../controllers/adminController");
router.use(authenticate, authorize("admin"));
router.post("/sellers", c.createSeller);
router.get("/users", c.listUsers);
router.get("/dashboard", c.dashboard);
module.exports = router;
