import { NextResponse } from 'next/server';
import data from '../../../../data/api/sales.json';

export async function GET() {
  return NextResponse.json(data);
}
