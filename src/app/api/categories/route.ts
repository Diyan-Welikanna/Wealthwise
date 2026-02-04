import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        id: 'asc',
      },
    })
    
    return NextResponse.json({
      success: true,
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        color: cat.color,
        icon: cat.icon,
      })),
    })
  } catch (error) {
    console.error("Get categories error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
