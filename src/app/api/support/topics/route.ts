import { NextResponse } from "next/server";
import { supportTopics } from "@/lib/support-topics";
import { listSupportTopicsWithCounts } from "@/lib/support-store";

export async function GET() {
  const counts = await listSupportTopicsWithCounts();

  return NextResponse.json({
    topics: supportTopics,
    counts,
  });
}
