import { dishApiRequests } from "@/apiRequests/dish";
import { formatCurrency } from "@/lib/utils";
import { DishListResType, DishResType } from "@/schemaValidations/dish.schema";
import Image from "next/image";

type DishItem = DishResType["data"];

export default async function Home() {
  let listDish: DishListResType["data"] = [];
  try {
    const {
      payload: { data },
    } = await dishApiRequests.list();
    listDish = data;
  } catch (error) {
    console.log(error);
    return <div>Lỗi fetch data</div>;
  }

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
        <h2 className="text-center text-2xl font-bold">Đa dạng các món ăn</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {listDish.map((item, index) => {
            const dish = item as DishItem;
            return (
              <div
                className="group flex gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 cursor-pointer"
                key={index}
              >
                <div className="shrink-0 relative overflow-hidden rounded-lg">
                  <Image
                    alt={dish.name}
                    src={dish.image}
                    width={150}
                    height={150}
                    unoptimized
                    className="object-cover w-37.5 h-37.5 rounded-lg transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                </div>
                <div className="flex flex-col justify-between space-y-2 flex-1">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                      {dish.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{dish.description}</p>
                  </div>
                  <p className="text-lg font-bold text-primary">{formatCurrency(dish.price)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
