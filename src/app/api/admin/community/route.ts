import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const entity = searchParams.get("entity") || "review";
    const productId = searchParams.get("productId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const skip = (page - 1) * limit;

    const productWhere = productId ? { id: productId } : undefined;

    const items =
      entity === "question"
        ? Promise.resolve([])
        : Promise.resolve([]);

    return NextResponse.json(items);
  } catch (error) {
    console.error("Community error:", error);
    return NextResponse.json(
      { error: "Failed to fetch community data" },
      { status: 500 }
    );
  }
}
