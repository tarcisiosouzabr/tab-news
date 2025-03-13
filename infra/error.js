export class InternalServerError extends Error {
  constructor({ cause }) {
    super("Um erro interno não esperado aconteceu.", {
      cause: cause,
    });
    this.name = "InternalServerError";
    this.action = "Entre em contato com suporte.";
    this.statusCode = 500;
  }

  toJSON() {
    return {
      message: this.message,
      name: this.name,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}
