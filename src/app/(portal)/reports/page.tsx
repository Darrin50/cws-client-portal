import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import Link from "next/link";

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Reports</h1>
        <p className="text-slate-400 mt-2">
          View comprehensive project and performance reports
        </p>
      </div>

      {/* Upgrade Overlay */}
      <div className="relative">
        {/* Blurred Content */}
        <div className="blur-sm pointer-events-none">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-6 h-40 bg-slate-700" />
            ))}
          </div>
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm rounded-lg flex items-center justify-center">
          <div className="text-center space-y-4">
            <Lock className="w-12 h-12 text-slate-400 mx-auto" />
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                Upgrade to unlock Reports
              </h3>
              <p className="text-slate-400 mb-6 max-w-sm">
                Get access to detailed reports including performance summaries,
                milestone tracking, and progress analytics.
              </p>
            </div>
            <Link href="/settings/billing">
              <Button>View Upgrade Options</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Available in Growth+ */}
      <Card className="p-6 bg-blue-900/10 border-blue-700">
        <h3 className="font-semibold text-white mb-4">
          Reports Available in Growth+ Plan
        </h3>
        <ul className="space-y-2 text-sm text-slate-300">
          <li>Monthly performance summary</li>
          <li>Project milestone tracking</li>
          <li>Content performance analysis</li>
          <li>SEO health report</li>
          <li>Custom PDF reports</li>
          <li>Scheduled report delivery</li>
        </ul>
      </Card>
    </div>
  );
}
