"use client";
import { ChevronRight, Flame, Sparkles, Star } from "lucide-react";
import Image from "next/image";
import { formatCurrency, generateSlugUrl } from "@/lib/utils";
import { Link } from "@/i18n/routing";
import { DishSuggestList } from "@/app/[locale]/(public)/page";
import { useTranslations } from "next-intl";

export default function PopularDishes({ data }: { data: DishSuggestList }) {
  const t = useTranslations("HomePage");
  const t2 = useTranslations("Others");

  return (
    <section className="relative py-16 md:py-14 px-4 sm:px-6 lg:px-33.75">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="absolute -bottom-32 left-0 h-96 w-96 rounded-full bg-orange-400/10 blur-3xl" />
      </div>

      <div className="text-center mb-12 md:mb-14">
        <p className="text-xs sm:text-sm uppercase tracking-[0.35em] text-orange-400 mb-3">
          {t("popularDishes")}
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold text-black dark:text-white mb-4">
          {t("popularDishesDescription")}
        </h2>
        <div className="flex items-center justify-center gap-3">
          <div className="h-1 w-14 bg-linear-to-r from-transparent via-orange-400 to-transparent rounded-full" />
          <div className="w-10 h-10 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
            <Flame className="w-5 h-5 text-orange-400" />
          </div>
          <div className="h-1 w-14 bg-linear-to-r from-transparent via-orange-400 to-transparent rounded-full" />
        </div>
      </div>

      <div className="mt-4 relative">
        {data.length > 0 ? (
          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-7">
            {data.map((dish, index) => (
              <div
                className="group relative rounded-2xl overflow-hidden transition-all duration-500 bg-white/70 dark:bg-[#111010] border border-black/5 dark:border-white/10 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(0,0,0,0.2)]"
                style={{ animationDelay: `${index * 100}ms` }}
                key={dish.id}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-0 bg-linear-to-br from-orange-500/10 via-transparent to-transparent" />
                </div>

                {/* Image */}
                <div className="relative h-64 sm:h-52 lg:h-56 xl:h-72 overflow-hidden">
                  <div className="absolute inset-0 bg-linear-to-t from-black/55 via-black/5 to-transparent z-10" />
                  <Image
                    src={dish.dish.image}
                    alt={dish.dish.name}
                    width={500}
                    height={450}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />

                  {/* Popular Badge */}
                  <div className="absolute top-4 right-4 z-20">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/95 backdrop-blur-sm rounded-full border border-orange-400/60 shadow-lg">
                      <Star className="w-4 h-4 text-white fill-white" />
                      <span className="text-white font-semibold text-xs tracking-wide">Hot</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="relative p-5">
                  <h3 className="text-orange-500 dark:text-orange-400 text-xl font-bold mb-2 line-clamp-1 transition-colors duration-300">
                    {dish.dish.name}
                  </h3>

                  <p className="text-black/70 dark:text-white/70 text-sm line-clamp-2 leading-relaxed h-12">
                    {dish.dish.description || "Món ăn đặc biệt với hương vị tuyệt vời"}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-xl font-bold text-gray-900 dark:text-white rounded-lg">
                      {formatCurrency(dish.price)}
                    </div>

                    {/* Action Button */}
                    <Link
                      href={`/dishes/${generateSlugUrl({
                        name: dish.dish.name,
                        id: dish.id,
                      })}`}
                      className="text-orange-500 dark:text-orange-300 text-sm font-semibold hover:underline transition-all duration-300 group/btn block"
                    >
                      <span>{t2("seenDetail")}</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-black/5 dark:bg-white/5 border border-white/10 mb-6">
              <Flame className="w-12 h-12 text-orange-400" />
            </div>
            <h3 className="text-2xl font-semibold text-black/60 dark:text-white/70 mb-2">
              {t("noPopularDishes")}
            </h3>
            <p className="text-black/50 dark:text-white/60">{t("noPopularDishesDescription")}</p>
          </div>
        )}
      </div>

      {/* View All Button */}
      {data.length > 0 && (
        <div className="text-center mt-12">
          <Link
            href="/menu"
            className="inline-flex items-center gap-3 px-8 py-4 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 hover:-translate-y-1 border border-orange-400/60"
          >
            <Sparkles className="w-5 h-5" />
            <span>{t("discoverAllDishes")}</span>
            <ChevronRight className="w-5 h-5" />
          </Link>
          <div className="mt-4 h-1 w-48 mx-auto bg-linear-to-r from-transparent via-orange-400 to-transparent rounded-full" />
        </div>
      )}
    </section>
  );
}
