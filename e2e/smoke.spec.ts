import { test, expect } from "@playwright/test";

test.describe("Sign-in page", () => {
  test("renders the sign-in page with Canvas auth options", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page).toHaveTitle(/BetterCanvas/);
  });

  test("unauthenticated user is redirected to sign-in", async ({ page }) => {
    await page.goto("/dashboard");
    // Should redirect to sign-in since there's no session
    await page.waitForURL(/sign-in/, { timeout: 10_000 });
    await expect(page).toHaveURL(/sign-in/);
  });
});

test.describe("Public pages", () => {
  test("has correct metadata", async ({ page }) => {
    await page.goto("/sign-in");

    // Verify OG meta tags are present
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute("content", "BetterCanvas");

    const ogDescription = page.locator('meta[property="og:description"]');
    await expect(ogDescription).toHaveAttribute("content", /Canvas companion/);

    const ogImage = page.locator('meta[property="og:image"]');
    await expect(ogImage).toHaveAttribute("content", /og-image/);
  });

  test("manifest.json is accessible", async ({ request }) => {
    const response = await request.get("/manifest.json");
    expect(response.ok()).toBeTruthy();

    const manifest = await response.json();
    expect(manifest.name).toBe("BetterCanvas");
    expect(manifest.display).toBe("standalone");
    expect(manifest.theme_color).toBe("#cfbcff");
  });

  test("og-image.png is accessible", async ({ request }) => {
    const response = await request.get("/og-image.png");
    expect(response.ok()).toBeTruthy();
    expect(response.headers()["content-type"]).toContain("image");
  });

  test("apple-touch-icon.png is accessible", async ({ request }) => {
    const response = await request.get("/apple-touch-icon.png");
    expect(response.ok()).toBeTruthy();
    expect(response.headers()["content-type"]).toContain("image");
  });
});

test.describe("API health", () => {
  test("v1 API returns 401 without auth", async ({ request }) => {
    const response = await request.get("/api/v1/me");
    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body.error).toBe("Unauthorized");
  });

  test("v1 dashboard returns 401 without auth", async ({ request }) => {
    const response = await request.get("/api/v1/dashboard");
    expect(response.status()).toBe(401);
  });

  test("v1 calendar returns 401 without auth", async ({ request }) => {
    const response = await request.get("/api/v1/calendar");
    expect(response.status()).toBe(401);
  });

  test("v1 todo returns 401 without auth", async ({ request }) => {
    const response = await request.get("/api/v1/todo");
    expect(response.status()).toBe(401);
  });

  test("v1 notifications returns 401 without auth", async ({ request }) => {
    const response = await request.get("/api/v1/notifications");
    expect(response.status()).toBe(401);
  });

  test("v1 inbox returns 401 without auth", async ({ request }) => {
    const response = await request.get("/api/v1/inbox");
    expect(response.status()).toBe(401);
  });
});
