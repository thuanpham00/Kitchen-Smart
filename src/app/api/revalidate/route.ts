import { revalidateTag } from "next/cache";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const tag = request.nextUrl.searchParams.get("tag");
  if (tag) {
    revalidateTag(tag, "max"); // trang nào dùng api chứa tag đó sẽ build lại khi có request mới
  }
  return Response.json({ revalidated: true, now: Date.now() });
}

/**
Trong Next 15, revalidateTag(tag, "max") không xoá cache ngay mà chỉ đánh dấu cũ.
👉 F5 lần 1: vẫn trả data cũ, đồng thời fetch data mới ở nền.
👉 F5 lần 2: cache đã cập nhật nên UI mới thấy data mới.
 */