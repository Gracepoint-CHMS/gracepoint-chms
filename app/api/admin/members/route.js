import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET: Fetch all members for dashboard
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ members: data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT: Update an existing member record
export async function PUT(req) {
  try {
    const body = await req.json();
    const id = body.id || body.user_id;

    if (!id) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    const updatePayload = {
      full_name: body.full_name || body.fullName || body.name,
      phone: body.phone,
      prefix: body.prefix,
      gender: body.gender,
      dob: body.dob,
      marital_status: body.marital_status || body.maritalStatus,
      date_joined: body.date_joined || body.dateJoined,
      date_baptized: body.date_baptized || body.dateBaptized,
      core_dept: body.core_dept || body.coreDept || body.department,
      sub_dept: body.sub_dept || body.subDept || body.subDepartment,
      emergency_contact: body.emergency_contact || body.emergencyContact,
      emergency_phone: body.emergency_phone || body.emergencyPhone,
      role: body.role,
    };

    // Remove undefined properties
    Object.keys(updatePayload).forEach(
      (key) => updatePayload[key] === undefined && delete updatePayload[key]
    );

    const { data, error } = await supabase
      .from('members')
      .update(updatePayload)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Update Error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Member updated successfully', data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: Delete a member record
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }

    const { error } = await supabase.from('members').delete().eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ message: 'Member deleted successfully' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
