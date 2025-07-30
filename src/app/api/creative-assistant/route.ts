import { NextRequest, NextResponse } from 'next/server';
import { handleCreativeAssistanceRequest } from '../../../backend/api/creative-assistant';

export async function POST(request: NextRequest) {
  return handleCreativeAssistanceRequest(request);
}