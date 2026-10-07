import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Use Service Role Key to bypass client limitations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req) {
  try {
    const body = await req.json();

    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true, // Auto-confirms user instantly
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user.id;

    // 2. Insert member record into 'members' table
    const memberPayload = {
      id: userId,
      user_id: userId,
      email: body.email,
      full_name: body.fullName || body.name || `${body.prefix || ''} ${body.fullName || ''}`.trim(),
      phone: body.phone,
      prefix: body.prefix,
      gender: body.gender,
      dob: body.dob,
      marital_status: body.maritalStatus,
      date_joined: body.dateJoined,
      date_baptized: body.dateBaptized,
      core_dept: body.coreDept || body.department,
      sub_dept: body.subDept,
      emergency_contact: body.emergencyContact,
      emergency_phone: body.emergencyPhone,
      photo: body.photo || body.photoUrl,
      role: 'member',
    };

    // Remove empty/undefined properties
    Object.keys(memberPayload).forEach(
      (key) => memberPayload[key] === undefined && delete memberPayload[key]
    );

    const { error: dbError } = await supabase
      .from('members')
      .upsert(memberPayload);

    if (dbError) {
      console.error('Database Insert Error:', dbError);
      return NextResponse.json({ error: dbError.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Registration successful', userId });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
