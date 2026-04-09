export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

export const notFoundHandler = (req, res) => {
  res.status(404).json({ error: "Route not found" });
};

export const errorHandler = (err, req, res, next) => {
  const statusCode =
    err.statusCode ||
    (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError" ? 401 : 500);

  const message = err.isOperational ? err.message : "Something went wrong";

  if (statusCode >= 500) {
    console.error(err.stack);
  }

  res.status(statusCode).json({ error: message });
};
