import { renderPwaIcon } from "@/lib/pwa-icon";

export const dynamic = "force-static";

const VARIANTS: Record<string, { size: number; rounded: boolean }> = {
  "192": { size: 192, rounded: true },
  "512": { size: 512, rounded: true },
  maskable: { size: 512, rounded: false },
};

export function generateStaticParams() {
  return Object.keys(VARIANTS).map((variant) => ({ variant }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ variant: string }> }) {
  const { variant } = await params;
  const spec = Object.hasOwn(VARIANTS, variant) ? VARIANTS[variant] : undefined;
  if (!spec) return new Response("Not found", { status: 404 });
  return renderPwaIcon(spec.size, spec.rounded);
}
