import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  scenarios: {
    light_load: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "10s", target: 5 },  // subida progresiva
        { duration: "30s", target: 5 },  // carga estable
        { duration: "10s", target: 0 },  // bajada
      ],
      gracefulRampDown: "5s",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.02"],     // < 2% errores
    http_req_duration: ["p(95)<2000"],  // p95 < 2s (free tier)
  },
};

const BASE_URL = __ENV.BASE_URL || "https://hamari-backend.onrender.com";

// Usuario normal (NO admin)
const USER = {
  username: __ENV.USER_EMAIL || "23456789C",
  password: __ENV.USER_PASS || "provider123",
};

export default function () {
  // 1) Health check
  const health = http.get(`${BASE_URL}/health`);
  check(health, {
    "health status 200": (r) => r.status === 200,
  });

  // 2) Login
  const loginPayload = JSON.stringify(USER);
  const headers = { "Content-Type": "application/json" };

  const login = http.post(
    `${BASE_URL}/api/auth/login`,
    loginPayload,
    { headers }
  );

  check(login, {
    "login ok": (r) => r.status === 200 || r.status === 201,
  });

  // Extraer token si tu API lo devuelve
  let token = null;
  try {
    token = login.json("access_token") || login.json("token");
  } catch (e) {}

  if (token) {
    const authHeaders = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    // 3) Rutas protegidas reales
    const providers = http.get(
      `${BASE_URL}/api/providers`,
      authHeaders
    );
    check(providers, {
      "providers 200": (r) => r.status === 200,
    });

    const offers = http.get(
      `${BASE_URL}/api/offers`,
      authHeaders
    );
    check(offers, {
      "offers 200": (r) => r.status === 200,
    });
  }

  sleep(1);
}
