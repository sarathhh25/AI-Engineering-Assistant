import { test, expect } from '@playwright/test';

test.describe('Chat Interaction E2E Tests', () => {
  test('User can compose a message, attach a file, and dispatch correctly formatted payload to the backend', async ({ page }) => {
    // Intercept NextAuth session API to keep UI consistent
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({}), // Unauthenticated session is fine
      });
    });

    // Mock the backend POST /api/chat request to return a successful reply
    await page.route('**/api/chat', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          reply: 'Mocked response successfully verified.',
          status: 'success',
        }),
      });
    });

    // Go to main entry point
    await page.goto('/');

    // Switch to Chat Workspace using the sidebar navigation
    const chatTabButton = page.getByRole('button', { name: 'Chat Workspace', exact: false });
    await chatTabButton.click();

    // Verify textarea is visible
    const textarea = page.locator('textarea[placeholder="Ask anything about your engineering flow..."]');
    await expect(textarea).toBeVisible();

    // Type query into the chat input
    const messageText = 'Analyze this mock config file for any performance bottlenecks.';
    await textarea.fill(messageText);

    // Prepare and attach a dummy JSON file to the file input
    const fileContent = JSON.stringify({
      version: '1.0.0',
      database: 'postgresql',
      poolSize: 20,
    }, null, 2);

    await page.setInputFiles('input[type="file"]', {
      name: 'dummy-config.json',
      mimeType: 'application/json',
      buffer: Buffer.from(fileContent),
    });

    // Verify the attached file name and type tags are rendered in the Attachment Manager UI
    const attachmentTag = page.locator('text=dummy-config.json');
    await expect(attachmentTag).toBeVisible();

    // Setup network interception to capture the POST request when form is submitted
    const submitButton = page.locator('button[type="submit"]');
    
    const [request] = await Promise.all([
      page.waitForRequest(req => req.url().includes('/api/chat') && req.method() === 'POST'),
      submitButton.click(),
    ]);

    // Parse the captured network payload
    const payload = JSON.parse(request.postData() || '{}');

    // Assert that the request contains correctly structured parameters
    expect(payload).toHaveProperty('message');
    expect(payload).toHaveProperty('repo');
    expect(payload).toHaveProperty('files');

    expect(payload.message).toBe(messageText);
    expect(payload.files).toHaveLength(1);
    expect(payload.files[0].fileName).toBe('dummy-config.json');
    expect(payload.files[0].content).toBe(fileContent);
  });
});
