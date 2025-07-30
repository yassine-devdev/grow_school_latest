import { NextRequest, NextResponse } from 'next/server';
import { handleCreativeSessionsRequest } from '../../../backend/api/creative-assistant';

export async function GET(request: NextRequest) {
  return handleCreativeSessionsRequest(request);
}

export async function POST(request: NextRequest) {
  return handleCreativeSessionsRequest(request);
}