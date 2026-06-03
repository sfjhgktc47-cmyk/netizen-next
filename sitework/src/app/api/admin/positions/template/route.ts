import * as XLSX from "xlsx";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = [
    {
      sku: "IP17PRO-256-ORANGE",
      model: "iPhone 17 Pro",
      brand: "Apple",
      category: "Смартфон",
      name: "Смартфон iPhone 17 Pro 256 GB Orange",
      price: 100990,
      oldPrice: "",
      stock: 5,
      status: "active",
      color: "Orange",
      colorHex: "#f97316",
      memory: "256 GB",
      sim: "eSIM",
      images: "https://example.com/iphone-17-pro-orange.png",
      productSortOrder: 40,
      description: "",
      seoTitle: "",
      seoDescription: "",
      seoKeywords: "",
    },
    {
      sku: "S26ULTRA-512-WHITE",
      model: "Samsung S26 Ultra",
      brand: "Samsung",
      category: "Смартфон",
      name: "Смартфон Samsung S26 Ultra 512 GB White",
      price: 0,
      oldPrice: "",
      stock: 0,
      status: "out_of_stock",
      color: "White",
      colorHex: "#ffffff",
      memory: "512 GB",
      sim: "2 SIM",
      images: "https://example.com/samsung-s26-ultra-white.png",
      productSortOrder: 10,
      description: "",
      seoTitle: "",
      seoDescription: "",
      seoKeywords: "",
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet["!cols"] = [
    { wch: 24 },
    { wch: 24 },
    { wch: 14 },
    { wch: 16 },
    { wch: 44 },
    { wch: 12 },
    { wch: 12 },
    { wch: 10 },
    { wch: 14 },
    { wch: 14 },
    { wch: 12 },
    { wch: 12 },
    { wch: 10 },
    { wch: 52 },
    { wch: 16 },
    { wch: 32 },
    { wch: 32 },
    { wch: 38 },
    { wch: 28 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "positions");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="positions-import-template.xlsx"',
      "Cache-Control": "no-store",
    },
  });
}
