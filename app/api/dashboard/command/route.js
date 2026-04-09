import { NextResponse } from 'next/server';
import data from '../../../../data/api/command.json';

export async function GET() {
  return NextResponse.json(data);
}
