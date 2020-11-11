class CustomError extends Error {
  statusCode: number;
  constructor(name, statusCode) {
    super(name);

    this.name = name;
    this.statusCode = statusCode;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default CustomError;
