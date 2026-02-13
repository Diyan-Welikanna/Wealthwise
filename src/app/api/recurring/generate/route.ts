import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateNextOccurrence, shouldGenerateExpense } from "@/utils/recurringExpenses";

// POST /api/recurring/generate - Generate expenses from recurring items
export async function POST() {
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

    // Fetch active recurring expenses with category info
    const recurring = await prisma.recurringExpense.findMany({
      where: { 
        userId: user.id,
        isActive: true
      },
      include: {
        category: true
      }
    });

    let generated = 0;

    for (const item of recurring) {
      if (shouldGenerateExpense(new Date(item.nextOccurrence), null)) {
        // Find or create category
        const category = await prisma.category.findUnique({
          where: { id: item.categoryId }
        });

        if (category) {
          // Create transaction (expense)
          await prisma.transaction.create({
            data: {
              userId: user.id,
              categoryId: category.id,
              amount: item.amount,
              description: item.description ? `${item.description} (Auto-generated)` : 'Recurring expense (Auto-generated)',
              transactionDate: item.nextOccurrence,
              transactionType: 'expense'
            }
          });

          // Update next occurrence
          const nextOccurrence = calculateNextOccurrence(
            new Date(item.nextOccurrence), 
            item.frequency as 'daily' | 'weekly' | 'monthly' | 'yearly'
          );
          
          await prisma.recurringExpense.update({
            where: { id: item.id },
            data: { nextOccurrence }
          });

          generated++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Generated ${generated} expense(s)`,
      generated,
    });
  } catch (error) {
    console.error("Error generating expenses:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate expenses" },
      { status: 500 }
    );
  }
}
