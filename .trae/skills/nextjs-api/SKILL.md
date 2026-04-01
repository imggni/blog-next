---
name: nextjs-api-generator
description: 生成 Next.js API（App Router route.ts + 请求封装）｜触发：nextjs api/生成nextjs接口/nextjs api路由/nextjs请求封装
---

# Next.js API路由生成技能（Trae Skill）

## 指令（Trae执行规则）
1. 接收API路由路径、请求方法（GET/POST/PUT/DELETE等）、参数、返回值类型，生成完整API路由文件（route.ts）及请求封装函数
2. 严格遵循nextjs-specific规则，适配Next.js 14+ App Router API路由规范，统一请求/响应格式，做参数校验
3. 结构固定：API路由（route.ts）→参数校验→业务逻辑→异常捕获→响应返回；请求封装→请求拦截→参数处理→响应解析→异常处理
4. 自动导入必要依赖（next/navigation、zod等），封装公共请求方法，可直接在客户端/服务端调用
5. 生成请求示例、异常处理示例、参数校验示例，提示API路由安全注意事项

## 示例输出模板（API路由：route.ts）
```tsx
// app/api/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyPassword } from "@/lib/auth";
import { getEnv } from "@/lib/config";

// 参数校验 schema
const loginSchema = z.object({
  username: z.string().min(3, "用户名至少3个字符"),
  password: z.string().min(6, "密码至少6个字符"),
});

// POST请求处理
export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body = await request.json();
    
    // 参数校验
    const validatedData = loginSchema.parse(body);
    const { username, password } = validatedData;
    
    // 业务逻辑（示例：验证密码）
    const isPasswordValid = await verifyPassword(username, password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { code: 401, msg: "用户名或密码错误", data: null },
        { status: 401 }
      );
    }
    
    // 生成token（示例）
    const token = `${getEnv("NEXT_PUBLIC_TOKEN_SECRET")}-${username}`;
    
    return NextResponse.json({
      code: 200,
      msg: "登录成功",
      data: { token, username },
    });
  } catch (error) {
    // 异常处理
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { code: 400, msg: "参数校验失败", data: error.errors },
        { status: 400 }
      );
    }
    console.error("登录API异常：", error);
    return NextResponse.json(
      { code: 500, msg: "服务器内部错误", data: null },
      { status: 500 }
    );
  }
}

// 禁止GET请求
export async function GET() {
  return NextResponse.json(
    { code: 405, msg: "不允许GET请求，请使用POST", data: null },
    { status: 405 }
  );
}
```

## 示例输出模板（请求封装）
```tsx
// lib/api/login.ts
import { getEnv } from "@/lib/config";

// 登录请求参数类型
export interface LoginParams {
  username: string;
  password: string;
}

// 登录响应类型
export interface LoginResponse {
  code: number;
  msg: string;
  data: {
    token: string;
    username: string;
  } | null;
}

/**
 * 登录请求封装
 * @param params 登录参数
 * @returns 登录响应数据
 */
export async function loginRequest(params: LoginParams): Promise<LoginResponse> {
  try {
    const response = await fetch(`${getEnv("NEXT_PUBLIC_BASE_URL")}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    });
    
    const data = await response.json() as LoginResponse;
    
    if (!response.ok) {
      throw new Error(data.msg || "登录请求失败");
    }
    
    return data;
  } catch (error) {
    console.error("登录请求异常：", error);
    throw new Error(error instanceof Error ? error.message : "网络异常，请稍后重试");
  }
}
```
