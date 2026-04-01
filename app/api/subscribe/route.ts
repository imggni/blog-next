const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email: string) {
  return emailPattern.test(email);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: unknown };
    const email = typeof body.email === "string" ? body.email.trim() : "";

    if (!email) {
      return Response.json({ message: "邮箱不能为空。" }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return Response.json({ message: "请输入有效的邮箱地址。" }, { status: 400 });
    }

    return Response.json(
      {
        message: "订阅成功，后续可在此接入邮件服务。",
        email,
      },
      { status: 200 },
    );
  } catch {
    return Response.json({ message: "请求格式不正确。" }, { status: 400 });
  }
}
