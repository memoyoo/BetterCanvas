export const metadata = {
  title: "Support",
};

export default function SupportPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-16">
      <section className="space-y-4">
        <p className="text-primary text-sm font-semibold uppercase tracking-[4px]">
          BetterCanvas
        </p>
        <h1 className="text-4xl font-bold text-white">Support</h1>
        <p className="text-muted leading-7">
          For TestFlight support, Canvas connection help, privacy questions, or
          account deletion questions, contact support@bettercanvas.app.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Canvas Access Tokens</h2>
        <p className="text-muted leading-7">
          BetterCanvas currently supports Canvas personal access tokens for
          TestFlight review. Open your Canvas profile settings, create a token,
          then paste your Canvas domain and token into the mobile app.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Review Access</h2>
        <p className="text-muted leading-7">
          App reviewers can use the personal access token flow with a Canvas test
          account. If a test Canvas account is unavailable, contact support for
          review credentials before evaluating Canvas-backed screens.
        </p>
      </section>
    </main>
  );
}
