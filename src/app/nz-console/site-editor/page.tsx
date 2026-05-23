import { SiteEditorForm } from "@/components/admin/site-editor-form";
import { getPageBuilderState } from "@/lib/page-builder-db";
import { getSiteEditorSettings } from "@/lib/site-settings-db";

export const dynamic = "force-dynamic";

export default async function AdminSiteEditorPage() {
  const [settings, pageBuilder] = await Promise.all([
    getSiteEditorSettings(),
    getPageBuilderState(),
  ]);

  return <SiteEditorForm initialSettings={settings} initialPageBuilder={pageBuilder} />;
}
