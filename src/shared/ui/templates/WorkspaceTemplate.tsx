import type { ReactNode } from "react";

export function WorkspaceTemplate({
  sidebar,
  topBar,
  overlays,
  children,
}: {
  sidebar: ReactNode;
  topBar: ReactNode;
  overlays?: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <div className="flex min-h-dvh">
        {sidebar}
        <div className="flex min-w-0 flex-1 flex-col">
          {topBar}
          <main className="flex-1 p-4 md:p-6 xl:p-10">
            <div className="mx-auto max-w-[1440px]">{children}</div>
          </main>
        </div>
      </div>
      {overlays}
    </>
  );
}
