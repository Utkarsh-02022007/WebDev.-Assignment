const router = require("express").Router();
const controller = require("../controllers/productController");

router.route("/low-stock").get(controller.lowStock);
router.route("/summary").get(controller.categorySummary);
router.route("/")
  .post(controller.createProduct)
  .get(controller.getProducts);
router.route("/:id/stock").patch(controller.adjustStock);
router.route("/:id")
  .get(controller.getProduct)
  .put(controller.updateProduct)
  .delete(controller.deleteProduct);

module.exports = router;
