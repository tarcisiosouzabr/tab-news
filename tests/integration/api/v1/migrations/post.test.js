import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
});

describe("POST to api/v1/migrations", () => {
  describe("Anonymous user", () => {
    describe("Running pending migrations", () => {
      test("For the first time", async () => {
        let response = await fetch("http://localhost:3000/api/v1/migrations", {
          method: "POST",
        });
        expect(response.status).toBe(201);
        const responseBody = await response.json();
        expect(Array.isArray(responseBody)).toBe(true);
        expect(responseBody.length).toBeGreaterThan(0);
      });
      test("For the second time", async () => {
        let secondResponse = await fetch(
          "http://localhost:3000/api/v1/migrations",
          {
            method: "POST",
          },
        );
        expect(secondResponse.status).toBe(200);
        const secondResponseBody = await secondResponse.json();
        expect(Array.isArray(secondResponseBody)).toBe(true);
        expect(secondResponseBody.length).toBe(0);
      });
    });
  });
});
