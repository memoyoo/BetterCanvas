export const metadata = {
  title: "Delete Account",
};

export default function DeleteAccountPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-16">
      <section className="space-y-4">
        <p className="text-primary text-sm font-semibold uppercase tracking-[4px]">
          BetterCanvas
        </p>
        <h1 className="text-4xl font-bold text-white">Delete Your Account</h1>
        <p className="text-muted leading-7">
          You can delete your BetterCanvas account directly in the mobile app.
          Open Settings, choose Delete BetterCanvas account, and confirm the
          deletion prompt.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">What Gets Deleted</h2>
        <p className="text-muted leading-7">
          Account deletion removes your BetterCanvas user record, Canvas
          connection, encrypted Canvas token, synced coursework, conversations,
          personal tasks, tutor threads, and tutor messages from BetterCanvas.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Need Help?</h2>
        <p className="text-muted leading-7">
          If you cannot access the app, email support@bettercanvas.app with the
          subject Account Deletion Request. We will use the information you
          provide only to verify and complete the request.
        </p>
      </section>
    </main>
  );
}
