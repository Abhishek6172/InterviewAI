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
    });

    return NextResponse.json({
      success: true,
      user: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to record user login" }, { status: 500 });
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
