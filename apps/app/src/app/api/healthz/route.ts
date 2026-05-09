export async function GET() {
  return Response.json({
    status: "ok",
    version: "0.1.0",
    app: "curriculum7-app",
  });
}
