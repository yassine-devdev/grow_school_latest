import { NextRequest, NextResponse } from 'next/server';
import { handleCreativeProjectsRequest } from '../../../../backend/api/creative-assistant';

export async function GET(request: NextRequest) {
  return handleCreativeProjectsRequest(request);
}

export async function PUT(request: NextRequest) {
  return handleCreativeProjectsRequest(request);
}

export async function DELETE(request: NextRequest) {
  return handleCreativeProjectsRequest(request);
}