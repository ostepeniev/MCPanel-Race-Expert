import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(request) {
  try {
    const jsonPath = path.join(process.cwd(), 'data', 'api', 'orders.json');
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    return NextResponse.json(data);
  } catch (error) {
    console.error('Orders API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
