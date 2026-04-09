import { NextResponse } from 'next/server';
import data from '../../../../data/api/finance.json';

export async function GET() {
  return NextResponse.json(data);
}
