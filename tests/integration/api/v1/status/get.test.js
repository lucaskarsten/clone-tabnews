test("GET /api/v1/status should return 200", async () => {
  const response = await fetch("http://localhost:3000/api/v1/status");
  expect(response.status).toBe(200);

  const responseBody = await response.json();

  const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString(); // Check if it's a valid date
  expect(responseBody.updated_at).toEqual(parsedUpdatedAt);
  expect(responseBody.dependencies.database.version).toEqual("16.0");

  expect(responseBody.dependencies.database.max_connections).toEqual(100); // Default max_connections for PostgreSQL
  expect(responseBody.dependencies.database.open_connection).toEqual(1);

  //expect(responseBody.postgres_version).toBeDefined();
  //expect(responseBody.max_connections).toBeDefined();
  //expect(responseBody.current_connections).toBeDefined();
});
