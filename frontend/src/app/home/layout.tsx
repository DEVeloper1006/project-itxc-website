import CircleCursor from "@/components/CircleCursor";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CircleCursor />
      {children}
    </>
  );
}
