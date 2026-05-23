import { SiteEditorForm } from "@/components/admin/site-editor-form";
import { getSiteEditorSettings } from "@/lib/site-settings-db";

export const dynamic = "force-dynamic";

export default async function AdminSiteEditorPage() {
  const settings = await getSiteEditorSettings();

  return <SiteEditorForm initialSettings={settings} />;
}
