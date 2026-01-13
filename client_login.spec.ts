import { test, expect, chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

type Client = {
  name: string;
  url: string;
  username: string;
  password_key: string;
};

const csvPath = path.join(__dirname, 'client.csv');
if (!fs.existsSync(csvPath)) {
  throw new Error(`CSV file not found at ${csvPath}`);
}const csv = fs.readFileSync(csvPath, 'utf-8');

const CLIENTS: Client[] = csv
  .split('\n')
  .slice(1)
  .filter(Boolean)
  .map(line => {
    const [name, url, username, password_key] = line.split(',');
    return { name, url, username, password_key };
  });

CLIENTS.forEach(client => {
  test(`${client.name} login test`, async ({ page }) => {
    const password = process.env[client.password_key];
    expect(password, `Missing password for ${client.name}`).toBeTruthy();

    try {
      await page.goto(client.url, { waitUntil: 'networkidle' });
      await page.fill('#userEmail', client.username);
      await page.fill('#userPassword', password!);
      await page.click('#sso-continue');

      await expect(page).toHaveURL(
      /^https:\/\/.*\.radixhealth\.com\/dash\/dash\d+\/#\/patient-search$/,
      { timeout: 30000 }
    );

      console.log(`✔ ${client.name} login OK`);
    } catch (e) {
      // take screenshot if the page is still open
      if (!page.isClosed()) {
        await page.screenshot({ path: `/Users/darsh/Documents/2026/RL/Screenshots/error-${client.name}.png` });
      }
      console.error(`✖ ${client.name} login failed`);
      throw e;
    }
  });
});