import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm tracking-tight">CWS</span>
            </div>
            <span className="text-white font-bold text-xl">Caliber Web Studio</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white">Welcome back</h1>
        <p className="text-slate-400">
          Sign in to access your CWS Client Portal
        </p>
      </div>

      <SignIn
        afterSignInUrl="/dashboard"
        fallbackRedirectUrl="/dashboard"
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "bg-slate-800 border border-slate-700 shadow-2xl",
            headerTitle: "text-white font-bold text-lg",
            headerSubtitle: "text-slate-400 text-sm",
            socialButtonsBlockButton:
              "bg-slate-700 hover:bg-slate-600 text-white border border-slate-600",
            formFieldInput:
              "bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500",
            formFieldLabel: "text-slate-300 font-medium",
            footerActionLink: "text-blue-400 hover:text-blue-300",
            dividerLine: "bg-slate-700",
            dividerText: "text-slate-400",
            buttonPrimary:
              "bg-blue-600 hover:bg-blue-700 text-white font-semibold",
            otpCodeFieldInput:
              "bg-slate-700 border border-slate-600 text-white focus:border-blue-500",
            badge: "!hidden",
            footer: "!hidden",
          },
        }}
      />

      <p className="text-center text-slate-400 text-sm">
        Don't have an account?{" "}
        <a href="/signup" className="text-blue-400 hover:text-blue-300 font-medium">
          Sign up here
        </a>
      </p>
    </div>
  );
}
