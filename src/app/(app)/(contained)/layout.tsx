// Standard centred page. Routes that need full-bleed content (movie detail) sit outside this group.
export default function ContainedLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="mx-auto flex w-full max-w-content flex-col gap-6 px-4 pt-4 md:gap-8 md:px-8 md:pt-8">
      {children}
    </div>
  );
}
