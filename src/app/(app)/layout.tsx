import { AppNav } from '@/components/AppNav';

export default function AppLayout({ children }: LayoutProps<'/'>) {
  return (
    <>
      <AppNav profileHref="/u/me" />
      <main className="mx-auto flex w-full max-w-content flex-col gap-6 px-4 pt-4 pb-[calc(6rem+env(safe-area-inset-bottom))] md:gap-8 md:px-8 md:pt-8 md:pb-12">
        {children}
      </main>
    </>
  );
}
