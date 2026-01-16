import MenuOrder from "@/app/guest/menu/menu-order";

export default async function MenuPage() {
  return (
    <div className="max-w-125 w-full mx-auto space-y-4">
      <h1 className="text-center text-xl font-bold">🍕 Menu quán</h1>
      <MenuOrder />
    </div>
  );
}
