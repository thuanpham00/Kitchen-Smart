import { menuApiRequests } from "@/apiRequests/menu";
import PopularDishes from "@/components/popular-dishes";
import SlideImageHero from "@/components/slide-image-hero";
import { Link } from "@/i18n/routing";
import { htmlToTextForDescription } from "@/lib/server-utils";
import { wrapServerApi } from "@/lib/utils";
import { envConfig, Locale } from "@/utils/config";
import { Award, ChefHat, Sparkles, Users } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";

export type DishSuggestList = {
  id: number;
  menuId: number;
  dishId: number;
  price: number;
  status: "Available" | "OutOfStock" | "Hidden";
  dish: {
    id: number;
    name: string;
    price: number;
    description: string;
    image: string;
    status: "Active" | "Discontinued";
    categoryId: number;
    category: {
      id: number;
      name: string;
    };
    dietaryTags: string | null;
    spicyLevel: number;
    preparationTime: number;
    searchKeywords: string;
    popularity: number;
    createdAt: Date;
    updatedAt: Date;
    ingredients?: string[] | null | undefined;
  };
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}[];

// dùng api generateMetadata khi cần dịch - còn không cần dịch thì dùng metaData tĩnh
export async function generateMetadata(props: { params: Promise<{ locale: Locale }> }) {
  const params = await props.params;

  const { locale } = params;

  const t = await getTranslations({ locale, namespace: "HomePage" });
  const url = envConfig.NEXT_PUBLIC_URL + `/${locale}`;

  return {
    title: t("title"),
    description: htmlToTextForDescription(t("description")),
    alternates: {
      canonical: url,
    },
  };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const locale = (await params).locale;
  setRequestLocale(locale);

  const t = await getTranslations("HomePage");
  const resultSuggested = await wrapServerApi(() => menuApiRequests.getMenuSuggested());
  const listDishSuggested = resultSuggested?.payload.data;

  return (
    <div className="w-full space-y-6">
      <section className="relative overflow-hidden bg-[#0b0a0a]">
        <div className="absolute inset-0">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />
          <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-orange-400/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,140,0,0.2),transparent_45%),radial-gradient(circle_at_80%_10%,rgba(255,140,0,0.12),transparent_40%)]" />
        </div>

        <div className="relative z-10 px-4 sm:px-8 lg:px-16 xl:px-24 py-20 lg:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left">
              <p className="inline-flex items-center gap-2 text-orange-300 text-sm font-semibold mb-5 tracking-widest uppercase">
                <span className="h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_12px_rgba(255,140,0,0.9)]" />
                {t("hello")}
              </p>
              <h1 className="text-white text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-5">
                {t("title")}
              </h1>
              <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto md:mx-0">{t("description")}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link
                  href="/menu"
                  className="inline-flex items-center justify-center px-7 py-4 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-orange-500/40 transition-all duration-300"
                >
                  {t("exploreMenu")}
                </Link>
              </div>
            </div>
            <div className="relative flex justify-center md:justify-end">
              <div className="absolute -inset-6 rounded-[32px] bg-linear-to-br from-orange-500/20 via-orange-500/5 to-transparent blur-2xl" />
              <div className="relative z-10 lg:mr-10 rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-xl p-4 shadow-[0_25px_80px_rgba(0,0,0,0.35)]">
                <SlideImageHero />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Most Popular Food Section */}
      <PopularDishes data={listDishSuggested || []} />

      {/* Booking & Location Section */}
      <section className="py-10 px-6 sm:px-8 lg:px-33.75">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="relative overflow-hidden rounded-2xl border border-white/10">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('/images/restaurant_banner.png')` }}
            />
            <div className="absolute inset-0 bg-linear-to-br from-black/80 via-black/70 to-orange-900/40" />
            <div className="relative z-10 p-10 text-center text-white h-full flex flex-col justify-center">
              <p className="text-orange-200 text-sm uppercase tracking-[0.3em] mb-3">{t("findUs")}</p>
              <h3 className="text-2xl sm:text-3xl font-semibold mb-6">{t("visitRestaurant")}</h3>
              <div className="space-y-2 text-white/80">
                <p>123 HV HCM City</p>
                <p>+0123 456 7890</p>
                <p>phamminhthuan912@gmail.com</p>
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-orange-400/40 bg-linear-to-br from-orange-500 to-orange-700 p-10">
            <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <h3 className="text-white text-2xl sm:text-3xl font-semibold mb-6 text-center">
              {t("openingHours")}
            </h3>
            <div className="space-y-4 text-white text-center">
              <div className="flex flex-col items-center">
                <span className="font-semibold text-lg">{t("mondayToSunday")}</span>
                <span className="mt-2 px-5 py-2 rounded-full bg-white text-orange-700 font-bold text-xl shadow-lg inline-block">
                  8:00 - 22:00
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 px-6 sm:px-8 lg:px-33.75">
        <div className="text-center mb-16">
          <p className="text-xs sm:text-sm uppercase tracking-[0.35em] text-orange-400 mb-3">
            {t("visitRestaurant")}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-black dark:text-white">
            {t("visitRestaurantDescription")}
          </h2>
          <div className="mt-5 h-1 w-32 mx-auto bg-linear-to-r from-transparent via-orange-400 to-transparent rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <div className="relative group overflow-hidden rounded-2xl border border-black/5 shadow-lg">
              <Image
                src="/images/restaurant.png"
                alt="Nội thất nhà hàng"
                width={250}
                height={300}
                className="w-full h-71.25 object-cover transition-transform duration-500 group-hover:scale-105 group-hover:shadow-2xl"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent px-4 py-3">
                <span className="text-white text-base font-semibold">{t("restaurantSpace")}</span>
              </div>
            </div>
            <div className="relative group overflow-hidden rounded-2xl border border-black/5 shadow-lg">
              <Image
                src="/images/restaurant_banner.png"
                alt="Nội thất nhà hàng"
                width={250}
                height={300}
                className="w-full h-71.25 object-cover transition-transform duration-500 group-hover:scale-105 group-hover:shadow-2xl"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent px-4 py-3">
                <span className="text-white text-base font-semibold">{t("lobby")}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-6">
            <div className="relative group overflow-hidden rounded-2xl border border-black/5 shadow-lg h-71.25 lg:h-146.5">
              <Image
                src="/images/house.png"
                alt="Nội thất nhà hàng"
                width={250}
                height={300}
                className="w-full h-full lg:h-146.5 object-cover transition-transform duration-500 group-hover:scale-105 group-hover:shadow-2xl"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent px-4 py-3">
                <span className="text-white text-base font-semibold">{t("mainDiningRoom")}</span>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="relative group overflow-hidden rounded-2xl border border-black/5 shadow-lg">
              <Image
                src="/images/Dish.png"
                alt="Món ăn"
                width={250}
                height={300}
                className="w-full h-71.25 object-cover transition-transform duration-500 group-hover:scale-105 group-hover:shadow-2xl"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent px-4 py-3">
                <span className="text-white text-base font-semibold">{t("featuredDish")}</span>
              </div>
            </div>
            <div className="relative group overflow-hidden rounded-2xl border border-black/5 shadow-lg">
              <Image
                src="/images/chef.png"
                alt="Đầu bếp"
                width={250}
                height={300}
                className="w-full h-71.25 object-cover transition-transform duration-500 group-hover:scale-105 group-hover:shadow-2xl"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent px-4 py-3">
                <span className="text-white text-base font-semibold">{t("professionalChef")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Banner */}
      <section className="relative overflow-hidden pt-12 pb-16">
        <div className="absolute inset-0 opacity-15">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,140,0,0.35),transparent_55%)]" />
        </div>

        <div className="relative z-10 px-6 sm:px-8 lg:px-33.75">
          {/* Section Header */}
          <div className="text-center mb-12">
            <p className="text-xs sm:text-sm uppercase tracking-[0.35em] text-orange-400 mb-3">
              {t("whyChooseUs")}
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-black dark:text-white mb-3">
              {t("greatTaste")}
            </h2>
            <div className="mt-4 h-1 w-32 mx-auto bg-linear-to-r from-transparent via-orange-400 to-transparent rounded-full" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              {
                Icon: Sparkles,
                title: t("greatTaste"),
                description: t("featuredDish"),
                color: "text-yellow-400",
                bgColor: "bg-yellow-500/20",
                borderColor: "border-yellow-400/30",
                shadowColor: "shadow-yellow-500/20",
              },
              {
                Icon: Users,
                title: t("selfService"),
                description: t("fastConvenient"),
                color: "text-blue-400",
                bgColor: "bg-blue-500/20",
                borderColor: "border-blue-400/30",
                shadowColor: "shadow-blue-500/20",
              },
              {
                Icon: Award,
                title: t("bestDish"),
                description: t("topQuality"),
                color: "text-green-400",
                bgColor: "bg-green-500/20",
                borderColor: "border-green-400/30",
                shadowColor: "shadow-green-500/20",
              },
              {
                Icon: ChefHat,
                title: t("professionalChef"),
                description: t("experiencedChef"),
                color: "text-red-400",
                bgColor: "bg-red-500/20",
                borderColor: "border-red-400/30",
                shadowColor: "shadow-red-500/20",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group flex flex-col items-center cursor-pointer transition-all duration-500 hover:scale-105"
              >
                {/* Icon Container */}
                <div
                  className={`relative w-24 h-24 md:w-28 md:h-28 mb-5 rounded-2xl ${feature.bgColor} backdrop-blur-md flex items-center justify-center shadow-2xl ${feature.shadowColor} group-hover:shadow-3xl transition-all duration-500 border-2 ${feature.borderColor} overflow-hidden`}
                >
                  {/* Animated gradient background */}
                  <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Rotating border effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 animate-spin-slow bg-linear-to-r from-white/40 via-transparent to-transparent rounded-2xl" />
                  </div>

                  {/* Icon */}
                  <feature.Icon
                    className={`relative z-10 w-12 h-12 md:w-14 md:h-14 ${feature.color} group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 drop-shadow-lg`}
                    strokeWidth={2.5}
                  />

                  {/* Glow effect */}
                  <div className="absolute inset-0 rounded-2xl bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl" />
                </div>

                {/* Text Content */}
                <div className="text-center">
                  <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-black/60 dark:text-white mb-1 transition-colors duration-300 drop-shadow-md">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-white/80 transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
