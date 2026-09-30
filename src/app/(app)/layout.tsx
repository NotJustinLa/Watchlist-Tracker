import { AppNav } from '@/components/AppNav';

export default function AppLayout({ children }: LayoutProps<'/'>) {
  return (
    <>
      <AppNav profileHref="/u/me" />
      <main className="pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-12">
        {children}
      </main>
    </>
  );
}
