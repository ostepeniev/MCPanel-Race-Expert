import { NextResponse } from 'next/server';
import data from '../../../../data/api/orders.json';

export async function GET() {
  return NextResponse.json(data);
}
