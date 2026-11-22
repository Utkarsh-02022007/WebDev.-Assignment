const router = require("express").Router();
const { authenticate, authorize } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");
const c = require("../controllers/categoryController");
router.get("/", asyncHandler(c.list));
router.post("/", authenticate, authorize("admin"), c.create);
router.patch("/:id", authenticate, authorize("admin"), c.update);
router.delete("/:id", authenticate, authorize("admin"), c.remove);
module.exports = router;
