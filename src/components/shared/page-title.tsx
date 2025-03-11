export function PageTitle({ title }: { title: string }) {
  const text = title.split(" - ")[0];
  return (
    <div className="fixed left-1/2 top-4 z-40 -translate-x-1/2 px-10 py-1 text-center text-sm font-medium text-gray-500 2xs:px-3">
      {text}
    </div>
  );
}
