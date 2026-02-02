import { menuApiRequests } from "@/apiRequests/menu";
import { Badge } from "@/components/ui/badge";
import { MenuItemStatus } from "@/constants/type";
import { formatCurrency, wrapServerApi } from "@/lib/utils";
import { MenuActiveResType } from "@/schemaValidations/menu.schema";
import Image from "next/image";
import bgLogin from "../../../../public/images/food_example.jpg";
import logoFavourite from "../../../../public/images/favorites.png";
import Link from "next/link";

export default async function MenuPage() {
  let menuActive: MenuActiveResType["data"] | null = null;

  const resultMenuActive = await wrapServerApi(() => menuApiRequests.menuActive());
  menuActive = resultMenuActive?.payload.data || null;

  const resultSuggested = await wrapServerApi(() => menuApiRequests.getMenuSuggested());
  const listDishSuggested = resultSuggested?.payload.data;

  if (!menuActive || menuActive.menuItems.length === 0) {
    return <div className="text-center py-10">Chưa có menu nào được kích hoạt</div>;
  }

  const groupedByCategory = menuActive.menuItems.reduce(
    (acc, menuItem) => {
      if (menuItem.status === MenuItemStatus.HIDDEN) return acc;
      const categoryName = menuItem.dish.category.name;
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(menuItem);
      return acc;
    },
    {} as Record<string, typeof menuActive.menuItems>,
  );

  return (
    <section className="space-y-10 p-4 md:p-8">
      <div
        className="text-center space-y-4 p-32 rounded-xl"
        style={{
          backgroundImage: `url(${bgLogin.src})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
        }}
      >
        <h2 className="text-3xl font-bold text-primary">{menuActive.name}</h2>
        {menuActive.description && <p className="text-white max-w-2xl mx-auto">{menuActive.description}</p>}
        <div className="flex items-center justify-center">
          <Badge variant="default">{menuActive.menuItems.length} món ăn</Badge>
        </div>
      </div>

      <div className="space-y-16">
        <div className="space-y-6">
          <div className="relative">
            <div className="flex items-center gap-4">
              <div className="shrink-0 flex items-center justify-center">
                <Image src={logoFavourite.src} height={40} width={40} alt="logo favourite" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-foreground">Nên thử</h3>
                <p className="text-sm text-muted-foreground">{listDishSuggested?.length} món ăn</p>
              </div>
              <div className="hidden md:block flex-1 h-px bg-linear-to-r from-border to-transparent"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-x-4 gap-y-6">
            {listDishSuggested?.map((menuItem) => {
              const dish = menuItem.dish;

              return (
                <Link
                  className="group relative flex flex-col bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-2 cursor-pointer overflow-hidden rounded-lg"
                  key={menuItem.id}
                  href={`/dishes/${menuItem.id}`}
                >
                  <div className="relative overflow-hidden h-48 bg-muted">
                    <Image
                      src={logoFavourite.src}
                      height={40}
                      width={40}
                      alt="logo favourite"
                      className="absolute top-1 right-2 h-12.5 w-12.5 opacity-70 z-10"
                    />

                    <Image
                      alt={dish.name}
                      src={dish.image}
                      width={400}
                      height={300}
                      unoptimized
                      className="object-cover w-full h-full transition-all duration-500 group-hover:scale-110 group-hover:rotate-1"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  <div className="p-5 space-y-3 flex-1 flex flex-col">
                    <div className="space-y-2 flex-1">
                      <h4 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                        {dish.name}
                      </h4>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {dish.description}
                      </p>
                      {menuItem.notes && (
                        <p className="text-xs text-orange-500 italic font-medium">💡 {menuItem.notes}</p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-border/50">
                      <div className="flex items-end justify-between">
                        <div className="space-y-1">
                          <p className="text-2xl font-bold bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                            {formatCurrency(menuItem.price)}
                          </p>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="text-xs text-primary font-semibold">Xem chi tiết →</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {Object.entries(groupedByCategory).map(([categoryName, items]) => (
          <div key={categoryName} className="space-y-6">
            <div className="relative">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-foreground">{categoryName}</h3>
                  <p className="text-sm text-muted-foreground">{items.length} món ăn</p>
                </div>
                <div className="hidden md:block flex-1 h-px bg-linear-to-r from-border to-transparent"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-x-4 gap-y-6">
              {items.map((menuItem) => {
                const dish = menuItem.dish;

                return (
                  <Link
                    className="group relative flex flex-col bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-2 cursor-pointer overflow-hidden rounded-lg"
                    key={menuItem.id}
                    href={`/dishes/${menuItem.id}`}
                  >
                    <div className="relative overflow-hidden h-48 bg-muted">
                      <Image
                        alt={dish.name}
                        src={dish.image}
                        width={400}
                        height={300}
                        unoptimized
                        className="object-cover w-full h-full transition-all duration-500 group-hover:scale-110 group-hover:rotate-1"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    <div className="p-5 space-y-3 flex-1 flex flex-col">
                      <div className="space-y-2 flex-1">
                        <h4 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                          {dish.name}
                        </h4>
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {dish.description}
                        </p>
                        {menuItem.notes && (
                          <p className="text-xs text-orange-500 italic font-medium">💡 {menuItem.notes}</p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-border/50">
                        <div className="flex items-end justify-between">
                          <div className="space-y-1">
                            <p className="text-2xl font-bold bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                              {formatCurrency(menuItem.price)}
                            </p>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="text-xs text-primary font-semibold">Xem chi tiết →</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
