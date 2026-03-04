// @vitest-environment node
import { test, expect, vi, beforeEach } from "vitest";
import { jwtVerify } from "jose";

vi.mock("server-only", () => ({}));

const mockCookieSet = vi.fn();
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({ set: mockCookieSet })),
}));

// Import after mocks are set up
const { createSession } = await import("@/lib/auth");

const JWT_SECRET = new TextEncoder().encode("development-secret-key");

beforeEach(() => {
  mockCookieSet.mockClear();
});

test("createSession sets the auth-token cookie", async () => {
  await createSession("user-1", "test@example.com");

  expect(mockCookieSet).toHaveBeenCalledOnce();
  expect(mockCookieSet.mock.calls[0][0]).toBe("auth-token");
});

test("createSession cookie contains a valid JWT", async () => {
  await createSession("user-1", "test@example.com");

  const token = mockCookieSet.mock.calls[0][1] as string;
  const { payload } = await jwtVerify(token, JWT_SECRET);

  expect(payload).toBeDefined();
});

test("createSession JWT payload contains userId and email", async () => {
  await createSession("user-42", "hello@example.com");

  const token = mockCookieSet.mock.calls[0][1] as string;
  const { payload } = await jwtVerify(token, JWT_SECRET);

  expect(payload.userId).toBe("user-42");
  expect(payload.email).toBe("hello@example.com");
});

test("createSession JWT expires in ~7 days", async () => {
  const before = Date.now();
  await createSession("user-1", "test@example.com");
  const after = Date.now();

  const token = mockCookieSet.mock.calls[0][1] as string;
  const { payload } = await jwtVerify(token, JWT_SECRET);

  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const expMs = (payload.exp as number) * 1000;

  expect(expMs).toBeGreaterThanOrEqual(before + sevenDaysMs - 1000);
  expect(expMs).toBeLessThanOrEqual(after + sevenDaysMs + 1000);
});

test("createSession sets httpOnly on the cookie", async () => {
  await createSession("user-1", "test@example.com");

  const options = mockCookieSet.mock.calls[0][2] as Record<string, unknown>;
  expect(options.httpOnly).toBe(true);
});

test("createSession sets sameSite to lax", async () => {
  await createSession("user-1", "test@example.com");

  const options = mockCookieSet.mock.calls[0][2] as Record<string, unknown>;
  expect(options.sameSite).toBe("lax");
});

test("createSession sets path to /", async () => {
  await createSession("user-1", "test@example.com");

  const options = mockCookieSet.mock.calls[0][2] as Record<string, unknown>;
  expect(options.path).toBe("/");
});

test("createSession sets secure to false outside production", async () => {
  const original = process.env.NODE_ENV;
  // jsdom test environment is not "production"
  await createSession("user-1", "test@example.com");

  const options = mockCookieSet.mock.calls[0][2] as Record<string, unknown>;
  expect(options.secure).toBe(false);
});

test("createSession cookie expires in ~7 days", async () => {
  const before = new Date();
  await createSession("user-1", "test@example.com");
  const after = new Date();

  const options = mockCookieSet.mock.calls[0][2] as Record<string, unknown>;
  const expires = options.expires as Date;

  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  expect(expires.getTime()).toBeGreaterThanOrEqual(before.getTime() + sevenDaysMs - 1000);
  expect(expires.getTime()).toBeLessThanOrEqual(after.getTime() + sevenDaysMs + 1000);
});
