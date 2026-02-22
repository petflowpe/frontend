/**
 * Pruebas progresivas del API (backend Laravel).
 * Ejecutar: node scripts/test-api.mjs
 * Requiere: backend en http://localhost:8000
 */

const API_BASE = process.env.VITE_API_URL || 'http://localhost:8000/api';

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✅ ${name}`);
    return true;
  } catch (e) {
    console.log(`  ❌ ${name}: ${e.message}`);
    return false;
  }
}

async function main() {
  console.log('\n--- Pruebas API (Backend Laravel) ---\n');
  let passed = 0;
  let total = 0;

  total++;
  const r1 = await test('GET /api/system/info (público)', async () => {
    const res = await fetch(`${API_BASE}/system/info`, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.app_name && data.system_initialized === undefined) throw new Error('Respuesta inválida');
  });
  if (r1) passed++;

  let token = null;
  total++;
  const r2 = await test('POST /api/auth/login (público)', async () => {
    const email = process.env.TEST_EMAIL || 'admin@test.com';
    const password = process.env.TEST_PASSWORD || 'password';
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.access_token) {
      token = data.access_token;
      return;
    }
    if (res.status === 401 && data.message) return;
    if (res.status === 422) return;
    if (!res.ok && res.status !== 401) throw new Error(data.message || `HTTP ${res.status}`);
  });
  if (r2) passed++;

  const authHeader = () => ({ Accept: 'application/json', Authorization: `Bearer ${token}` });

  if (token) {
    total++;
    const r3 = await test('GET /api/v1/reports/stats (protegido)', async () => {
      const res = await fetch(`${API_BASE}/v1/reports/stats?company_id=1`, { headers: authHeader() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.success && !data.data) throw new Error('Respuesta inválida');
    });
    if (r3) passed++;

    total++;
    const r4 = await test('GET /api/v1/clients (protegido)', async () => {
      const res = await fetch(`${API_BASE}/v1/clients`, { headers: authHeader() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await res.json();
    });
    if (r4) passed++;

    total++;
    const r5 = await test('GET /api/v1/appointments (protegido)', async () => {
      const res = await fetch(`${API_BASE}/v1/appointments`, { headers: authHeader() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await res.json();
    });
    if (r5) passed++;

    total++;
    const r6 = await test('GET /api/v1/products (protegido)', async () => {
      const res = await fetch(`${API_BASE}/v1/products`, { headers: authHeader() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await res.json();
    });
    if (r6) passed++;

    total++;
    const r7 = await test('GET /api/v1/notifications (protegido)', async () => {
      const res = await fetch(`${API_BASE}/v1/notifications`, { headers: authHeader() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await res.json();
    });
    if (r7) passed++;
  } else {
    console.log('  ⏭️ Pruebas protegidas omitidas (sin token)');
  }

  console.log(`\n--- Resultado: ${passed}/${total} pruebas pasaron ---\n`);
  process.exit(passed === total ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
