export default function OnboardingLayout({ children }) {
  return (
    <main className="min-h-[calc(100vh-60px)] bg-riotBgSecondary px-6 py-10 md:py-12">
      <section className="mx-auto max-w-[720px]">
        <article className="rounded-[24px] border border-riotBorder bg-white p-6 shadow-riot md:p-10">
          {children}
        </article>
      </section>
    </main>
  );
}
