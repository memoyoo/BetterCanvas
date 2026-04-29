export const metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-16">
      <section className="space-y-4">
        <p className="text-primary text-sm font-semibold uppercase tracking-[4px]">
          BetterCanvas
        </p>
        <h1 className="text-4xl font-bold text-white">Privacy Policy</h1>
        <p className="text-muted leading-7">
          BetterCanvas helps students connect Canvas, review coursework, manage
          tasks, read course messages, and ask course-specific tutor questions.
          This draft policy is intended for TestFlight and must be reviewed
          before public App Store submission.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Information We Collect</h2>
        <p className="text-muted leading-7">
          We collect the account information needed to create your BetterCanvas
          session, your Canvas domain, an encrypted Canvas access token, synced
          course data, assignments, calendar items, notifications, conversations,
          personal tasks, and tutor messages or course snippets you choose to use
          with tutoring features.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">How We Use Information</h2>
        <p className="text-muted leading-7">
          We use this information to provide app functionality: syncing Canvas,
          showing coursework and messages, saving personal tasks, refreshing
          course context, and generating course-grounded tutor responses when AI
          features are enabled.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Security And Retention</h2>
        <p className="text-muted leading-7">
          Canvas tokens are encrypted at rest. User data is retained while the
          account is active and removed when the account deletion flow is
          completed, except where limited retention is required for security,
          abuse prevention, or legal obligations.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Your Choices</h2>
        <p className="text-muted leading-7">
          You can disconnect Canvas or delete your BetterCanvas account from the
          mobile app settings. You can also request help at
          support@bettercanvas.app.
        </p>
      </section>
    </main>
  );
}
