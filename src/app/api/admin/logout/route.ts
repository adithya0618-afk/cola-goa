export async function POST() {
  const response = Response.json({ success: true });
  response.headers.set(
    'Set-Cookie',
    'admin_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax'
  );
  return response;
}
