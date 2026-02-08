import { chromium, FullConfig } from '@playwright/test';

/**
 * Global Setup for E2E Tests
 *
 * This setup runs before all tests to verify:
 * 1. Test user credentials are configured
 * 2. Test user can login
 * 3. Required seed data exists
 *
 * CI Mode (process.env.CI):
 * - Strict validation: fails fast on missing data
 * - Skips gracefully if TEST_USER credentials are not set
 *
 * Local Mode:
 * - Warnings only, tests can still run
 *
 * The seed script (npm run e2e:seed) should be run before this.
 * In CI, the seed runs automatically before tests.
 */

interface ValidationResult {
  name: string;
  status: 'ok' | 'warn' | 'fail';
  message?: string;
}

async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL || 'http://localhost:3000';
  const isStrict = !!process.env.CI;

  // Check for required environment variables
  const testEmail = process.env.TEST_USER_EMAIL;
  const testPassword = process.env.TEST_USER_PASSWORD;

  if (!testEmail || !testPassword) {
    console.warn(`
\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
\u2551 \u26a0\ufe0f  MISSING TEST CREDENTIALS                                        \u2551
\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563
\u2551 TEST_USER_EMAIL and TEST_USER_PASSWORD are not set.               \u2551
\u2551 Skipping login validation. E2E tests that require auth will fail.\u2551
\u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d
`);
    // Skip setup gracefully - tests requiring auth will fail individually
    return;
  }

  console.log('\n\ud83d\udd0d Running E2E global setup...');
  console.log(`  Base URL: ${baseURL}`);
  console.log(`  Test User: ${testEmail}`);
  console.log(`  Mode: ${isStrict ? 'STRICT (CI)' : 'LENIENT (local)'}`);

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  const results: ValidationResult[] = [];

  try {
    // Step 1: Navigate to auth page
    console.log('  \u2192 Navigating to /auth...');
    await page.goto(`${baseURL}/auth`, { timeout: 30000 });

    // Wait for form to be visible
    await page.waitForSelector('form', { timeout: 10000 });

    // Step 2: Login
    console.log('  \u2192 Logging in...');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');

    // Wait for navigation after login
    try {
      await page.waitForURL(/\/(patients|transcripts|inbox|settings)?$/, { timeout: 15000 });
      results.push({ name: 'Login', status: 'ok' });
    } catch (e) {
      // Check if there's an error message
      const errorVisible = await page.locator('text=incorrect').or(page.locator('text=invalide')).isVisible();
      if (errorVisible) {
        results.push({ name: 'Login', status: 'fail', message: 'Invalid credentials' });
      } else {
        results.push({ name: 'Login', status: 'fail', message: 'Navigation timeout after login' });
      }
    }

    // Step 3: Check transcripts data
    if (results.some(r => r.name === 'Login' && r.status === 'ok')) {
      console.log('  \u2192 Checking transcripts data...');
      await page.goto(`${baseURL}/transcripts`, { timeout: 15000 });
      await page.waitForLoadState('networkidle');

      const readyTranscript = page.locator('[data-testid="transcript-card"][data-status="ready"]');
      const anyTranscript = page.locator('[data-testid="transcript-card"]');

      const hasReadyTranscript = await readyTranscript.count() > 0;
      const hasAnyTranscript = await anyTranscript.count() > 0;

      if (!hasAnyTranscript) {
        const msg = 'No transcript cards found. Run: npm run e2e:seed';
        results.push({ name: 'Transcripts', status: isStrict ? 'fail' : 'warn', message: msg });
      } else if (!hasReadyTranscript) {
        const msg = `No "ready" transcript found (${await anyTranscript.count()} exist)`;
        results.push({ name: 'Ready Transcript', status: isStrict ? 'fail' : 'warn', message: msg });
      } else {
        results.push({ name: 'Transcripts', status: 'ok' });
      }

      // Step 4: Check inbox data
      console.log('  \u2192 Checking inbox data...');
      await page.goto(`${baseURL}/inbox`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('[data-testid="inbox-message"], :has-text("Aucun message")', { timeout: 5000 }).catch(() => {});

      const inboxMessage = page.locator('[data-testid="inbox-message"]');
      const hasInboxMessage = await inboxMessage.count() > 0;

      if (!hasInboxMessage) {
        const msg = 'No inbox messages found. Run: npm run e2e:seed';
        results.push({ name: 'Inbox Messages', status: isStrict ? 'fail' : 'warn', message: msg });
      } else {
        results.push({ name: 'Inbox Messages', status: 'ok' });
      }
    }

    // Print summary
    console.log('\n\ud83d\udcca Validation Summary:');
    console.log('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500');

    let okCount = 0;
    let warnCount = 0;
    let failCount = 0;

    for (const result of results) {
      const icon = result.status === 'ok' ? '\u2705' : result.status === 'warn' ? '\u26a0\ufe0f' : '\u274c';
      console.log(`  ${icon} ${result.name}${result.message ? `: ${result.message}` : ''}`);

      if (result.status === 'ok') okCount++;
      else if (result.status === 'warn') warnCount++;
      else failCount++;
    }

    console.log('  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500');
    console.log(`  OK: ${okCount} | WARN: ${warnCount} | FAIL: ${failCount}`);

    // In strict mode, fail if any validation failed
    if (isStrict && failCount > 0) {
      throw new Error(`CI STRICT MODE: ${failCount} validation(s) failed. Seed data is missing.`);
    }

    if (warnCount > 0) {
      console.log('\n\u26a0\ufe0f Global setup completed with warnings.');
      console.log('  Some tests may fail or be skipped.');
      console.log('  To fix: npm run e2e:seed\n');
    } else {
      console.log('\n\u2705 Global setup complete! All seed data verified.\n');
    }
  } catch (error) {
    await context.close();
    await browser.close();
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
}

export default globalSetup;
