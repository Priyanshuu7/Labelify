// JWT_SECRET is the base secret key used for signing JWT tokens
export const JWT_SECRET = "secret";
// WORKER_JWT_SECRET is derived from JWT_SECRET and is specifically used for worker-related JWT tokens
export const WORKER_JWT_SECRET = JWT_SECRET + "worker";
