"use client";
import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";
import ExportTable from "@/app/[locale]/manage/import-export-inventory/export-table";
import ImportTable from "@/app/[locale]/manage/import-export-inventory/import-table";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/routing";

export default function ImportExportInventory() {
  const t = useTranslations("ManageImportExportInventory");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentType = searchParams.get("type") || "export";
  const [selectedTabPage, setSelectedTabPage] = useState<string>(currentType);

  // Sync state với URL khi searchParams thay đổi
  useEffect(() => {
    setSelectedTabPage(currentType);
  }, [currentType]);

  const handleTabChange = (val: string) => {
    // Tạo URLSearchParams mới từ searchParams hiện tại
    const params = new URLSearchParams(searchParams.toString());
    params.set("type", val);

    // Push URL mới với query string
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div>
      <Tabs value={selectedTabPage} onValueChange={handleTabChange} className="mb-4">
        <TabsList variant="default">
          <TabsTrigger value="export">
            <span>{t("exportTab")}</span>
          </TabsTrigger>
          <TabsTrigger value="import">
            <span>{t("importTab")}</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {selectedTabPage === "export" ? (
        <div>
          <ExportTable />
        </div>
      ) : (
        <div>
          <ImportTable />
        </div>
      )}
    </div>
  );
}
