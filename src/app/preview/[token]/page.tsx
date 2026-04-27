import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";

const PREVIEW_TOKEN = "2cd5c4e999e31960";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DesignerPreviewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  if (token !== PREVIEW_TOKEN) notFound();
  redirect("/demo/dashboard");
}
