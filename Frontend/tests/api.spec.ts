import { test, expect } from '@playwright/test';

test.describe('API Endpoint Tests', () => {
  test('GET /api/health returns 200 and a valid status/timestamp', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);

    const json = await response.json();
    expect(json).toHaveProperty('status');
    expect(json).toHaveProperty('timestamp');
    expect(json.status).toBe('ok');

    // Verify timestamp is a valid ISO date
    const date = new Date(json.timestamp);
    expect(date.getTime()).not.toBeNaN();
  });

  test('POST /api/chat processes chat query and returns expected response structure', async ({ request }) => {
    const chatPayload = {
      message: 'Explain authentication workflow.',
      repo: 'ai-engineering-assistant',
      files: [
        {
          fileName: 'auth-dummy.ts',
          content: 'export const dummy = "auth"',
        },
      ],
    };

    const response = await request.post('/api/chat', {
      data: chatPayload,
    });
    
    expect(response.status()).toBe(200);

    const json = await response.json();
    expect(json).toHaveProperty('reply');
    expect(json).toHaveProperty('status');
    expect(typeof json.reply).toBe('string');
    
    // Status can be success or fallback depending on if FastAPI is online
    expect(['success', 'fallback']).toContain(json.status);
  });
});
