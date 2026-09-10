import axios from "axios";

// IMPORTANT: "localhost" does not work on a physical phone (Expo Go).
// Replace this IP with your computer's current LAN IP if it changes.
// Find it on Windows using: ipconfig  (look for "IPv4 Address")
const LOCAL_IP = "192.168.43.204";
const PORT = 5000;

export const API_BASE_URL = `http://${LOCAL_IP}:${PORT}/api`;
export const SERVER_ORIGIN = `http://${LOCAL_IP}:${PORT}`;

// Uploaded images are served from the server origin (e.g. /uploads/foo.png),
// not under /api. Backend responses only ever return that relative path.
export const resolveAssetUrl = (path: string | null | undefined): string | undefined =>
  path ? `${SERVER_ORIGIN}${path}` : undefined;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export default api;
