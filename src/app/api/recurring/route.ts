import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateNextOccurrence, shouldGenerateExpense } from "@/utils/recurringExpenses";

// GET /api/recurring - Get all recurring expenses
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Fetch recurring expenses using Prisma model
    const recurring = await prisma.recurringExpense.findMany({
      where: { userId: user.id },
      orderBy: { nextOccurrence: 'asc' }
    });

    return NextResponse.json({ success: true, recurring });
  } catch (error) {
    console.error("Error fetching recurring expenses:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch recurring expenses" },
      { status: 500 }
    );
  }
}

// POST /api/recurring - Create recurring expense
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const { amount, category, description, frequency, startDate, endDate } = await request.json();

    if (!amount || !category || !frequency || !startDate) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find category ID
    const categoryRecord = await prisma.category.findFirst({
      where: { name: category }
    });

    if (!categoryRecord) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const nextOccurrence = calculateNextOccurrence(start, frequency);

    await prisma.recurringExpense.create({
      data: {
        userId: user.id,
        categoryId: categoryRecord.id,
        amount: amount,
        description: description || null,
        frequency: frequency,
        nextOccurrence: nextOccurrence,
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      message: "Recurring expense created successfully",
    });
  } catch (error) {
    console.error("Error creating recurring expense:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create recurring expense" },
      { status: 500 }
    );
  }
}

// DELETE /api/recurring?id=123 - Delete recurring expense
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing expense ID" },
        { status: 400 }
      );
    }

    await prisma.$executeRaw`
      DELETE FROM recurring_expenses WHERE id = ${parseInt(id)}
    `;

    return NextResponse.json({
      success: true,
      message: "Recurring expense deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting recurring expense:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete recurring expense" },
      { status: 500 }
    );
  }
}
