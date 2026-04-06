import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import Link from "next/link";

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <p className="text-slate-400 mt-2">
          Track performance metrics and visitor insights
        </p>
      </div>

      {/* Upgrade Overlay */}
      <div className="relative">
        {/* Blurred Content */}
        <div className="blur-sm pointer-events-none">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-6 h-32 bg-slate-700" />
            ))}
          </div>

          <Card className="p-6 h-80 bg-slate-700" />
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm rounded-lg flex items-center justify-center">
          <div className="text-center space-y-4">
            <Lock className="w-12 h-12 text-slate-400 mx-auto" />
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                Upgrade to unlock Analytics
              </h3>
              <p className="text-slate-400 mb-6 max-w-sm">
                Get detailed insights into your website performance, visitor
                behavior, and conversion metrics.
              </p>
            </div>
            <Link href="/settings/billing">
              <Button>View Upgrade Options</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Feature List */}
      <Card className="p-6 bg-blue-900/10 border-blue-700">
        <h3 className="font-semibold text-white mb-4">Analytics Features</h3>
        <ul className="space-y-2 text-sm text-slate-300">
          <li>Real-time visitor tracking</li>
          <li>Traffic source analysis</li>
          <li>Page performance metrics</li>
          <li>Conversion tracking</li>
          <li>User journey insights</li>
          <li>Custom report generation</li>
        </ul>
      </Card>
    </div>
  );
}
