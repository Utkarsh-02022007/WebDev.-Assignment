const router = require("express").Router();
const { authenticate } = require("../middleware/auth");
const c = require("../controllers/userController");
router.use(authenticate);
router.get("/me", c.me);
router.patch("/me", c.updateMe);
module.exports = router;
