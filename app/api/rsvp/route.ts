import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Name is required' },
        { status: 400 }
      )
    }

    // TODO: Save to database (Supabase, Prisma, etc.)
    console.log('✓ RSVP received:', {
      name: body.name,
      attending: body.attending,
      timestamp: body.timestamp,
    })

    return NextResponse.json(
      { success: true, message: 'RSVP confirmed' },
      { status: 200 }
    )
  } catch (error) {
    console.error('RSVP error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
