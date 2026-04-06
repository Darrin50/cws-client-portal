import { SignUp } from "@clerk/nextjs";

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white">Join the portal</h1>
        <p className="text-slate-400">
          Get access to your CWS projects and assets
        </p>
      </div>

      <div className="bg-blue-900 border border-blue-700 rounded-lg p-4 text-sm">
        <p className="text-blue-100">
          <span className="font-semibold">Invite required:</span> You'll need an
          invitation code from Caliber Web Studio to complete signup.
        </p>
      </div>

      <SignUp
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
          },
        }}
      />

      <p className="text-center text-slate-400 text-sm">
        Already have an account?{" "}
        <a href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
          Sign in here
        </a>
      </p>
    </div>
  );
}
