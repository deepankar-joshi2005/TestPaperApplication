import axios from "axios";

// Live backend (Render). To point at a local dev server instead (e.g. while
// running `npm run dev` in Backend/), comment this out and uncomment the
// LOCAL_IP block below — "localhost" does not work from a physical phone in
// Expo Go, so a LAN IP is needed for local testing.
const SERVER_ORIGIN_VALUE = "https://testpaperbackend.onrender.com";

// const LOCAL_IP = "192.168.43.204"; // Find it on Windows via: ipconfig
// const PORT = 5000;
// const SERVER_ORIGIN_VALUE = `http://${LOCAL_IP}:${PORT}`;

export const SERVER_ORIGIN = SERVER_ORIGIN_VALUE;
export const API_BASE_URL = `${SERVER_ORIGIN}/api`;

// Uploaded images are served from the server origin (e.g. /uploads/foo.png),
// not under /api. Backend responses only ever return that relative path.
export const resolveAssetUrl = (path: string | null | undefined): string | undefined =>
  path ? `${SERVER_ORIGIN}${path}` : undefined;

const api = axios.create({
  baseURL: API_BASE_URL,
  // Render's free tier spins the server down when idle and can take 30-50s
  // to wake up on the first request after a period of inactivity.
  timeout: 60000,
});

export default api;
