export default function OnboardingLayout({ children }) {
  return (
    <main className="min-h-[calc(100vh-76px)] bg-atelier-paper px-6 py-10 md:py-16">
      <section className="mx-auto max-w-[720px]">
        <article className="border border-atelier-ink/20 bg-atelier-paper p-6 md:p-12">
          {children}
        </article>
      </section>
    </main>
  );
}
