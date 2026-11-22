const router = require("express").Router();
const { authenticate, authorize } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");
const c = require("../controllers/reportController");
router.use(authenticate, authorize("seller", "admin"));
router.get("/sales", asyncHandler(c.sales));
router.get("/inventory", asyncHandler(c.inventory));
module.exports = router;
