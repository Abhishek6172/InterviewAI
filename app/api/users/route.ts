import { NextResponse } from "next/server";
import { UserStore } from "@/lib/admin/user-store";

export async function GET() {
  const users = UserStore.getServerUsers();
  return NextResponse.json({
    total: users.length,
    users,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.email) {
      return NextResponse.json({ error: "Missing user email" }, { status: 400 });
    }

    const updated = UserStore.upsertUser({
      id: body.id,
      name: body.name,
      email: body.email,
      image: body.image,
      lastRole: body.lastRole,
      sessions: body.sessions,
    });

    return NextResponse.json({
      success: true,
      user: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to record user login" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (body.users && Array.isArray(body.users)) {
      const merged = UserStore.mergeIncomingUsers(body.users);
      return NextResponse.json({
        success: true,
        total: merged.length,
        users: merged,
      });
    }
    return NextResponse.json({ error: "Invalid users array" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    if (!body.email) {
      return NextResponse.json({ error: "Missing email to delete" }, { status: 400 });
    }

    UserStore.deleteUser(body.email);

    return NextResponse.json({
      success: true,
      message: `User ${body.email} deleted successfully`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
