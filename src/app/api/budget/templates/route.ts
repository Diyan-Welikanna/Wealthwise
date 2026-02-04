import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { budgetTemplates, getTemplateById } from "@/utils/budgetTemplates";

// GET /api/budget/templates - Get all templates or a specific one
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get("id");

    if (templateId) {
      const template = getTemplateById(templateId);
      if (!template) {
        return NextResponse.json(
          { success: false, error: "Template not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, template });
    }

    return NextResponse.json({ success: true, templates: budgetTemplates });
  } catch (error) {
    console.error("Error fetching budget templates:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}
