"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Mail, Copy, Check } from "lucide-react";
import { useState } from "react";

// TODO: Replace with real data fetch
const mockTeamMembers = [
  {
    id: "1",
    name: "Sarah Chen",
    email: "sarah@caliberwebstudio.com",
    role: "Project Manager",
    joinDate: "Jan 15, 2026",
  },
  {
    id: "2",
    name: "Mike Johnson",
    email: "mike@caliberwebstudio.com",
    role: "Designer",
    joinDate: "Jan 15, 2026",
  },
  {
    id: "3",
    name: "Alex Rodriguez",
    email: "alex@caliberwebstudio.com",
    role: "Developer",
    joinDate: "Feb 1, 2026",
  },
];

// TODO: Replace with real data fetch
const mockInvitedUsers = [
  {
    id: "inv-1",
    email: "pending@example.com",
    role: "Viewer",
    invitedDate: "3 days ago",
    status: "pending",
  },
];

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState(mockTeamMembers);
  const [invitedUsers, setInvitedUsers] = useState(mockInvitedUsers);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Viewer");
  const [isInviting, setIsInviting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    try {
      // TODO: Call server action to send invite
      console.log("Inviting:", inviteEmail, inviteRole);
      await new Promise((resolve) => setTimeout(resolve, 500));

      setInvitedUsers([
        ...invitedUsers,
        {
          id: `inv-${Date.now()}`,
          email: inviteEmail,
          role: inviteRole,
          invitedDate: "just now",
          status: "pending",
        },
      ]);

      setInviteEmail("");
      setInviteRole("Viewer");
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = (id: string) => {
    // TODO: Call server action to remove member
    setTeamMembers(teamMembers.filter((m) => m.id !== id));
  };

  const handleCopyInvite = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedId(email);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Team Members</h1>
        <p className="text-slate-400 mt-2">
          Manage your team and invite new collaborators
        </p>
      </div>

      {/* Invite Form */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Invite Team Member</h2>
        <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
          <Input
            type="email"
            placeholder="Email address"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="flex-1"
          />
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-blue-500"
          >
            <option>Viewer</option>
            <option>Editor</option>
            <option>Admin</option>
          </select>
          <Button type="submit" disabled={!inviteEmail.trim() || isInviting}>
            {isInviting ? "Inviting..." : "Send Invite"}
          </Button>
        </form>
      </Card>

      {/* Team Members */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Active Members</h2>
        <Card className="overflow-hidden">
          {teamMembers.length > 0 ? (
            <div className="divide-y divide-slate-700">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="p-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-white">{member.name}</p>
                    <p className="text-sm text-slate-400">{member.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-blue-900/30 text-blue-300 border border-blue-700 rounded px-2 py-0.5">
                        {member.role}
                      </span>
                      <span className="text-xs text-slate-500">
                        Joined {member.joinDate}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-slate-400">No team members yet</p>
            </div>
          )}
        </Card>
      </div>

      {/* Pending Invitations */}
      {invitedUsers.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Pending Invitations</h2>
          <Card className="overflow-hidden">
            <div className="divide-y divide-slate-700">
              {invitedUsers.map((user) => (
                <div
                  key={user.id}
                  className="p-4 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-white flex items-center gap-2">
                      <Mail className="w-4 h-4 text-yellow-500" />
                      {user.email}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-yellow-900/30 text-yellow-300 border border-yellow-700 rounded px-2 py-0.5">
                        {user.role}
                      </span>
                      <span className="text-xs text-slate-500">
                        Invited {user.invitedDate}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyInvite(user.email)}
                  >
                    {copiedId === user.email ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Role Permissions Info */}
      <Card className="p-6 bg-blue-900/10 border-blue-700">
        <h3 className="font-semibold text-white mb-3">Role Permissions</h3>
        <div className="space-y-2 text-sm text-slate-300">
          <p>
            <strong>Viewer:</strong> Can view all content but cannot make changes
          </p>
          <p>
            <strong>Editor:</strong> Can view and edit content but cannot manage
            team or billing
          </p>
          <p>
            <strong>Admin:</strong> Full access to all features and settings
          </p>
        </div>
      </Card>
    </div>
  );
}
