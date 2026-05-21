import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import db from '@/lib/db';
import { staff } from '@/db/schema';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'cola_goa_jwt_super_secret_2025';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Look up staff by email
    const [member] = await db.select().from(staff).where(eq(staff.email, email)).limit(1);

    if (!member || !member.password) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, member.password);
    if (!isValid) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Create JWT
    const token = jwt.sign(
      { id: member.id, email: member.email, role: member.role, name: member.name },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    const response = Response.json({
      success: true,
      user: { id: member.id, name: member.name, email: member.email, role: member.role },
    });

    // Set HttpOnly cookie
    const cookieOptions = [
      `admin_token=${token}`,
      'HttpOnly',
      'Path=/',
      'SameSite=Lax',
      'Max-Age=43200', // 12h
      process.env.NODE_ENV === 'production' ? 'Secure' : '',
    ].filter(Boolean).join('; ');

    response.headers.set('Set-Cookie', cookieOptions);
    return response;
  } catch (err) {
    console.error('Login error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
