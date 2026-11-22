function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
}
function errorHandler(err, _req, res, _next) {
  let status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || "Internal server error";
  if (err.name === "CastError") { status = 400; message = "Invalid resource ID"; }
  if (err.name === "ValidationError") { status = 400; message = Object.values(err.errors).map(e => e.message).join(", "); }
  if (err.code === 11000) { status = 409; message = "SKU already exists"; }
  res.status(status).json({ success: false, message });
}
module.exports = { notFound, errorHandler };
