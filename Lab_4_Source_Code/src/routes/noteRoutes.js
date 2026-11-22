const router = require("express").Router();
const controller = require("../controllers/noteController");
const { authenticate } = require("../middleware/auth");
router.use(authenticate);
router.route("/").post(controller.create).get(controller.list);
router.route("/:id").get(controller.get).put(controller.update).delete(controller.remove);
module.exports = router;
