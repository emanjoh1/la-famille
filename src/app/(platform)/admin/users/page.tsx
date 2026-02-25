"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Shield, User, Crown } from "lucide-react";

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      });
  }, []);

  const handleRoleChange = async (userId: string, role: string) => {
    await fetch("/api/admin/users/role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role }),
    });
    router.refresh();
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10">
        <p className="text-[#717171]">Loading...</p>
      </div>
    );
  }

  const admins = users.filter((u) => u.role === "admin");
  const hosts = users.filter((u) => u.role === "host");
  const guests = users.filter((u) => u.role === "guest" || !u.role);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <Link href="/admin" className="flex items-center gap-2 text-[#717171] hover:text-[#222222] mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <h1 className="text-3xl font-semibold text-[#222222] mb-2">User Management</h1>
      <p className="text-[#717171] mb-8">Manage users and roles</p>

      <div className="grid grid-cols-3 gap-4 mb-10">
        <StatCard icon={<Crown className="w-5 h-5" />} label="Admins" value={admins.length} color="bg-purple-50 text-purple-600" />
        <StatCard icon={<Shield className="w-5 h-5" />} label="Hosts" value={hosts.length} color="bg-blue-50 text-blue-600" />
        <StatCard icon={<User className="w-5 h-5" />} label="Guests" value={guests.length} color="bg-gray-50 text-gray-600" />
      </div>

      <div className="space-y-8">
        <Section title="Admins" users={admins} onRoleChange={handleRoleChange} />
        <Section title="Hosts" users={hosts} onRoleChange={handleRoleChange} />
        <Section title="Guests" users={guests} onRoleChange={handleRoleChange} />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  return (
    <div className="border border-[#DDDDDD] rounded-xl p-4">
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-2`}>
        {icon}
      </div>
      <p className="text-sm text-[#717171]">{label}</p>
      <p className="text-2xl font-bold text-[#222222]">{value}</p>
    </div>
  );
}

function Section({ title, users, onRoleChange }: any) {
  if (users.length === 0) return null;

  return (
    <div>
      <h2 className="text-lg font-semibold text-[#222222] mb-4">{title} ({users.length})</h2>
      <div className="space-y-3">
        {users.map((user: any) => (
          <div key={user.id} className="border border-[#DDDDDD] rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {user.imageUrl && (
                <img src={user.imageUrl} alt={user.firstName} className="w-12 h-12 rounded-full" />
              )}
              <div>
                <p className="font-semibold text-[#222222]">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-[#717171]">{user.email}</p>
              </div>
            </div>
            <select
              value={user.role}
              onChange={(e) => onRoleChange(user.id, e.target.value)}
              className="px-3 py-2 border border-[#DDDDDD] rounded-lg text-sm"
            >
              <option value="guest">Guest</option>
              <option value="host">Host</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
