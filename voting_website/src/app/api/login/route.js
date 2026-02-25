import bcrypt from "bcryptjs";

export async function POST(req) {
  const { username, password } = await req.json();

  const envUser = process.env.ADMIN_USERNAME?.trim();
  const envHash = process.env.ADMIN_PASSWORD?.trim();

  if (!envUser || !envHash) {
    return new Response(JSON.stringify({ error: "Missing env vars" }), { status: 500 });
  }

  const isUser = username === envUser;
  const isPass = await bcrypt.compare(password, envHash);

  if (!isUser || !isPass) {
    return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}