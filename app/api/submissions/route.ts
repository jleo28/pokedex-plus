import { NextResponse } from 'next/server';
import { createSubmission } from '@/lib/pokemon/submissions';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const submission = await createSubmission(body);
    return NextResponse.json(submission);
  } catch {
    return NextResponse.json({ error: 'Failed to save submission.' }, { status: 500 });
  }
}
