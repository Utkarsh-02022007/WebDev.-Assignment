const router = require("express").Router();
const { authenticate, authorize } = require("../middleware/auth");
const { listUsers } = require("../controllers/adminController");

router.get("/users", authenticate, authorize("admin"), listUsers);
module.exports = router;
