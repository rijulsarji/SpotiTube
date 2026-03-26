// Extracting the base URL from the environment variables
// Note: Vite uses import.meta.env for environment variables instead of process.env
const BASE_URL = import.meta.env.VITE_BASE_URL;

export { BASE_URL };
