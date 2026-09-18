import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: true,
  use: {
    baseURL: "http://127.0.0.1:4322",
    browserName: "chromium",
    viewport: { width: 1280, height: 900 },
  },
  webServer: {
    command: "node tests/serve.mjs",
    url: "http://127.0.0.1:4322",
    reuseExistingServer: false,
  },
  reporter: "list",
});
