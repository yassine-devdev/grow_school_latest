import { NextRequest, NextResponse } from 'next/server';
import { handleCreativeProjectsRequest } from '../../../backend/api/creative-assistant';

export async function GET(request: NextRequest) {
  return handleCreativeProjectsRequest(request);
}

export async function POST(request: NextRequest) {
  return handleCreativeProjectsRequest(request);
}