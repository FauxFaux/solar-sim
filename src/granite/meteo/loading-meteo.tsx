import type { ComponentChildren } from 'preact';

export function LoadingMeteo({
  children,
  meteo,
}: {
  children: ComponentChildren;
  meteo: { success: false; error: Error } | undefined;
}) {
  return (
    <div>
      {children}
      {/* eyeballed from current content */}
      <div class={'skeleton'} style={'min-height: 560px;'} />
    </div>
  );
}
