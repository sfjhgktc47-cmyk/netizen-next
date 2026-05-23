import { prisma } from "@/lib/db";

export type AdminStaffRole = "owner" | "admin" | "manager" | "content" | "support";

export const adminRoleOptions: { value: AdminStaffRole; label: string; description: string }[] = [
  { value: "owner", label: "Владелец", description: "Полный доступ ко всем разделам и настройкам." },
  { value: "admin", label: "Администратор", description: "Управление товарами, заказами, клиентами и контентом." },
  { value: "manager", label: "Менеджер", description: "Заявки, клиенты, позиции и статусы заказов." },
  { value: "content", label: "Контент-менеджер", description: "Категории, карточки товаров, фото и описания." },
  { value: "support", label: "Поддержка", description: "Обращения клиентов и коммуникация." },
];

export type AdminStaffMember = {
  id: string;
  login: string;
  name: string;
  role: AdminStaffRole;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

function normalizeRole(value: string | null | undefined): AdminStaffRole {
  if (value === "admin" || value === "manager" || value === "content" || value === "support") {
    return value;
  }

  return "owner";
}

export async function getAdminStaff(): Promise<AdminStaffMember[]> {
  const staff = await prisma.adminUser.findMany({
    orderBy: [{ isActive: "desc" }, { createdAt: "asc" }],
    select: {
      id: true,
      login: true,
      name: true,
      role: true,
      permissions: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return staff.map((member) => ({
    ...member,
    role: normalizeRole(member.role),
    createdAt: member.createdAt.toISOString(),
    updatedAt: member.updatedAt.toISOString(),
  }));
}
