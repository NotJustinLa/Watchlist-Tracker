/**
 * Contained layout: the centred, padded column most pages sit in.
 *
 * Search, your lists, Taste, Feed and the social pages all use it. The movie
 * page and Reels sit outside it on purpose, because their artwork runs edge to
 * edge.
 */

/**
 * Centres the page content and gives it comfortable padding on phone and
 * desktop.
 */
export default function ContainedLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="mx-auto flex w-full max-w-content flex-col gap-6 px-4 pt-4 md:gap-8 md:px-8 md:pt-8">
      {children}
    </div>
  );
}
