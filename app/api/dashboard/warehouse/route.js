import { NextResponse } from 'next/server';
import data from '../../../../data/api/warehouse.json';

export async function GET() {
  return NextResponse.json(data);
}
