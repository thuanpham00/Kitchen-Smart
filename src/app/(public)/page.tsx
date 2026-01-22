import { menuApiRequests } from "@/apiRequests/menu";
import { formatCurrency } from "@/lib/utils";
import { MenuActiveResType } from "@/schemaValidations/menu.schema";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export default async function Home() {
  let menuActive: MenuActiveResType["data"] | null = null;
  try {
    const {
      payload: { data },
    } = await menuApiRequests.menuActive();
    menuActive = data;
  } catch (error) {
    console.log(error);
    return <div>Lỗi fetch data</div>;
  }

  if (!menuActive || menuActive.menuItems.length === 0) {
    return <div className="text-center py-10">Chưa có menu nào được kích hoạt</div>;
  }

  // Group menu items by category
  const groupedByCategory = menuActive.menuItems.reduce(
    (acc, menuItem) => {
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
    <div className="w-full space-y-4">
      <div className="relative w-full h-100 z-[-1]">
        <span className="absolute top-0 left-0 w-full h-full bg-black opacity-50 z-10"></span>
        <Image
          src="/images/restaurant_banner.png"
          width={800}
          height={400}
          quality={100}
          alt="Banner"
          className="absolute top-0 left-0 w-full h-full object-cover rounded-xl"
        />
        <div className="z-20 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white">
          <h1 className="text-center text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold">Kitchen Smart</h1>
          <p className="text-center text-sm sm:text-base mt-4">Gọi món thông minh - trải nghiệm tinh tế</p>
        </div>
      </div>

      <section className="space-y-10 mt-16">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-primary">{menuActive.name}</h2>
          {menuActive.description && (
            <p className="text-muted-foreground max-w-2xl mx-auto">{menuActive.description}</p>
          )}
          <div className="flex items-center justify-center gap-2">
            <Badge variant="secondary">Phiên bản {menuActive.version}</Badge>
            <Badge variant="default">{menuActive.menuItems.length} món ăn</Badge>
          </div>
        </div>

        {/* Render by Category */}
        <div className="space-y-16">
          {Object.entries(groupedByCategory).map(([categoryName, items], index) => (
            <div key={categoryName} className="space-y-6">
              {/* Category Header */}
              <div className="relative">
                <div className="flex items-center gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xl font-bold text-primary">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-foreground">{categoryName}</h3>
                    <p className="text-sm text-muted-foreground">{items.length} món ăn</p>
                  </div>
                  <div className="hidden md:block flex-1 h-px bg-linear-to-r from-border to-transparent"></div>
                </div>
              </div>

              {/* Category Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map((menuItem) => {
                  const dish = menuItem.dish;
                  const hasDiscount = menuItem.price < dish.price;

                  return (
                    <div
                      className="group relative flex flex-col rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-2 cursor-pointer overflow-hidden"
                      key={menuItem.id}
                    >
                      {/* Discount Badge */}
                      {hasDiscount && (
                        <div className="absolute top-3 left-3 z-10">
                          <Badge variant="destructive" className="text-xs font-semibold shadow-lg">
                            Giảm giá
                          </Badge>
                        </div>
                      )}

                      {/* Image Container */}
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

                      {/* Content */}
                      <div className="p-5 space-y-3 flex-1 flex flex-col">
                        <div className="space-y-2 flex-1">
                          <h4 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-1">
                            {dish.name}
                          </h4>
                          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                            {dish.description}
                          </p>
                          {menuItem.notes && (
                            <p className="text-xs text-orange-500 italic font-medium">💡 {menuItem.notes}</p>
                          )}
                        </div>

                        {/* Price Section */}
                        <div className="pt-3 border-t border-border/50">
                          <div className="flex items-end justify-between">
                            <div className="space-y-1">
                              {hasDiscount && (
                                <p className="text-xs text-muted-foreground line-through">
                                  {formatCurrency(dish.price)}
                                </p>
                              )}
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
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
