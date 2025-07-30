import { NextRequest, NextResponse } from 'next/server';
import { handleCreativeSessionsRequest } from '../../../../backend/api/creative-assistant';

export async function GET(request: NextRequest) {
  return handleCreativeSessionsRequest(request);
}

export async function PUT(request: NextRequest) {
  return handleCreativeSessionsRequest(request);
}

export async function DELETE(request: NextRequest) {
  return handleCreativeSessionsRequest(request);
}