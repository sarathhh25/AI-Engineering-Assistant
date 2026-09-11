import { test, expect } from '@playwright/test';

test.describe('Authentication & Integrations UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept NextAuth session API by default to prevent aborted fetches and console warnings
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({}),
      });
    });
  });

  test('Login page renders the "Continue with Google" button', async ({ page }) => {
    await page.goto('/login');
    
    const googleButton = page.locator('button', { hasText: 'Continue with Google' });
    await expect(googleButton).toBeVisible();
  });

  test('Integrations Hub displays "Connected" and "Manage GitHub Settings" when GitHub session is mocked active', async ({ page }) => {
    // Intercept and mock NextAuth session endpoint to return an active GitHub accessToken
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            name: 'Sarath',
            email: 'sarath@example.com',
            image: 'https://avatars.githubusercontent.com/u/12345?v=4',
          },
          expires: '2030-01-01T00:00:00.000Z',
          accessToken: 'mock-github-access-token',
        }),
      });
    });

    // Go to the main dashboard page
    await page.goto('/');

    // Navigate to the Integrations Hub by clicking the sidebar link
    const integrationsTabButton = page.getByRole('button', { name: 'Integrations', exact: true });
    await integrationsTabButton.click();

    // Verify the Integrations Hub title is displayed to confirm tab switch
    await expect(page.locator('h1', { hasText: 'Integrations Hub' })).toBeVisible();

    // Locate the GitHub integration card
    const githubCard = page.locator('div.bg-card', { has: page.locator('h3', { hasText: 'GitHub' }) });
    
    // Assert the status badge shows "Connected"
    const connectedBadge = githubCard.locator('span', { hasText: 'Connected' });
    await expect(connectedBadge).toBeVisible();

    // Assert the "Manage GitHub Settings" button is visible
    const manageSettingsButton = githubCard.getByRole('button', { name: 'Manage GitHub Settings', exact: true });
    await expect(manageSettingsButton).toBeVisible();

    // Assert that the connect button "+ Connect GitHub" is not visible
    const connectButton = githubCard.getByRole('button', { name: '+ Connect GitHub', exact: true });
    await expect(connectButton).not.toBeVisible();
  });
});
