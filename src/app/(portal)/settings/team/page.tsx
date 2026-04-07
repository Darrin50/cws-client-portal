"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Mail, Check, AlertCircle, UserCircle2 } from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

interface Member {
  id: string;
  userId: string;
  role: "owner" | "member";
  joinedAt: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  avatarUrl: string | null;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function memberDisplayName(m: Member): string {
  const name = [m.firstName, m.lastName].filter(Boolean).join(" ");
  return name || m.email;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [membersError, setMembersError] = useState<string | null>(null);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"owner" | "member">("member");
  const [isInviting, setIsInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    setLoadingMembers(true);
    setMembersError(null);
    try {
      const res = await fetch("/api/team/members");
      if (!res.ok) throw new Error("Failed to load team members");
      const json = await res.json();
      setMembers(json.data ?? []);
    } catch {
      setMembersError("Failed to load team members. Please refresh.");
    } finally {
      setLoadingMembers(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    setInviteError(null);
    setInviteSuccess(null);

    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      const json = await res.json();

      if (!res.ok) {
        setInviteError(json.error ?? "Failed to send invite");
        return;
      }

      setInviteSuccess(`Invitation sent to ${inviteEmail.trim()}`);
      setInviteEmail("");
      setInviteRole("member");
      // Refresh members list in case the invitee was already in the system
      fetchMembers();
    } catch {
      setInviteError("Network error. Please try again.");
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveMember = async (member: Member) => {
    if (
      !window.confirm(
        `Remove ${memberDisplayName(member)} from the organization?`,
      )
    )
      return;

    setRemovingId(member.userId);
    try {
      const res = await fetch(`/api/team/${member.userId}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (!res.ok) {
        alert(json.error ?? "Failed to remove member");
        return;
      }

      setMembers((prev) => prev.filter((m) => m.userId !== member.userId));
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Team Members
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Manage your team and invite new collaborators
        </p>
      </div>

      {/* Invite Form */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Invite Team Member
        </h2>
        <form
          onSubmit={handleInvite}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Input
            type="email"
            placeholder="Email address"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="flex-1"
            required
          />
          <select
            value={inviteRole}
            onChange={(e) =>
              setInviteRole(e.target.value as "owner" | "member")
            }
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          >
            <option value="member">Member</option>
            <option value="owner">Owner (Admin)</option>
          </select>
          <Button
            type="submit"
            disabled={!inviteEmail.trim() || isInviting}
            className="bg-teal-600 hover:bg-teal-700 text-white whitespace-nowrap"
          >
            {isInviting ? "Sending..." : "Send Invite"}
          </Button>
        </form>

        {inviteSuccess && (
          <div className="mt-3 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <Check className="w-4 h-4" />
            {inviteSuccess}
          </div>
        )}
        {inviteError && (
          <div className="mt-3 flex items-center gap-2 text-sm text-red-500">
            <AlertCircle className="w-4 h-4" />
            {inviteError}
          </div>
        )}
      </Card>

      {/* Team Members */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Active Members
        </h2>

        <Card className="overflow-hidden">
          {loadingMembers ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 flex items-center gap-4">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                </div>
              ))}
            </div>
          ) : membersError ? (
            <div className="p-8 text-center">
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {membersError}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchMembers}
                className="mt-3"
              >
                Retry
              </Button>
            </div>
          ) : members.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Avatar placeholder */}
                    <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center flex-shrink-0">
                      {member.avatarUrl ? (
                        <Image
                          src={member.avatarUrl}
                          alt=""
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <UserCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">
                        {memberDisplayName(member)}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                        {member.email}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-xs rounded px-2 py-0.5 border font-medium ${
                            member.role === "owner"
                              ? "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-700"
                              : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700"
                          }`}
                        >
                          {member.role === "owner" ? "Owner" : "Member"}
                        </span>
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          Joined {formatDate(member.joinedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveMember(member)}
                    disabled={removingId === member.userId}
                    aria-label={`Remove ${memberDisplayName(member)} from organization`}
                    className="ml-4 text-slate-400 hover:text-red-400 disabled:opacity-40 transition-colors flex-shrink-0 focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:outline-none rounded min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <Trash2 className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Mail className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                No team members yet. Invite someone to get started.
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Role Permissions Info */}
      <Card className="p-6 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-700">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
          Role Permissions
        </h3>
        <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
          <p>
            <strong>Member:</strong> Can view all content but cannot manage team
            or billing
          </p>
          <p>
            <strong>Owner (Admin):</strong> Full access to all features,
            settings, and team management
          </p>
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Seat limits: Starter — 2 members · Growth — 5 members · Domination —
          20 members
        </p>
      </Card>
    </div>
  );
}
