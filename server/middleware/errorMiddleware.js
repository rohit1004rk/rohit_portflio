export const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Not found - ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  const isProduction = process.env.NODE_ENV === "production";

  // Handle invalid MongoDB ObjectId values as a bad request
  // instead of returning an internal server error.
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 400;
  }

  let message = err.message || "An unexpected error occurred";

  if (err.name === "CastError" && err.kind === "ObjectId") {
    message = "Invalid resource ID";
  } else if (isProduction && statusCode >= 500) {
    // Keep unexpected server-side errors generic in production.
    message = "Internal server error";
  }

  if (isProduction && statusCode >= 500) {
    console.error("Internal server error:", err);
  }

  res.status(statusCode).json({
    message,
    ...(isProduction ? {} : { stack: err.stack }),
  });
};
