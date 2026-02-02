import { menuApiRequests } from "@/apiRequests/menu";
import { formatCurrency, wrapServerApi } from "@/lib/utils";
import { Award, ChefHat, ChevronRight, Flame, Sparkles, Star, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  const resultSuggested = await wrapServerApi(() => menuApiRequests.getMenuSuggested());
  const listDishSuggested = resultSuggested?.payload.data;

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
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
        <div className="z-20 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white">
          <h1 className="text-center text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold">Kitchen Smart</h1>
          <p className="text-center text-sm sm:text-base mt-4">Gọi món thông minh - trải nghiệm tinh tế</p>
        </div>
      </div>

      {/* Most Popular Food Section */}
      <section className="py-16 md:py-12 px-4 sm:px-6 lg:px-33.75">
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-orange-500/20 border-2 border-orange-500/30 flex items-center justify-center">
              <Flame className="w-6 h-6 text-orange-400" />
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-linear-to-r from-orange-400 to-orange-300 bg-clip-text text-transparent">
              Món ăn phổ biến
            </h2>
            <div className="w-12 h-12 rounded-full bg-orange-500/20 border-2 border-orange-500/30 flex items-center justify-center">
              <Star className="w-6 h-6 text-orange-400 fill-orange-400" />
            </div>
          </div>
          <p className="text-white text-lg md:text-xl max-w-3xl mx-auto leading-relaxed px-4">
            Khám phá danh sách các món ăn được yêu thích nhất, bao gồm món chính, đồ uống và tráng miệng, để
            có trải nghiệm ẩm thực đích thực!
          </p>
          <div className="mt-6 h-1 w-32 mx-auto bg-linear-to-r from-transparent via-orange-400 to-transparent rounded-full" />
        </div>

        {/* Loading State */}
        {Array.isArray(listDishSuggested) && listDishSuggested.length > 0 ? (
          <>
            {/* Dishes Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
              {listDishSuggested.map((dish, index) => (
                <div
                  key={dish.id}
                  className="group relative backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl border-2 border-gray-700/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Glow effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  {/* Image */}
                  <div className="relative h-64 md:h-72 overflow-hidden">
                    <div className="absolute inset-0 z-9" />
                    <Image
                      src={dish.dish.image}
                      alt={dish.dish.name}
                      width={300}
                      height={300}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />

                    {/* Popular Badge */}
                    <div className="absolute top-4 right-4 z-20">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/90 backdrop-blur-sm rounded-full border border-orange-400/50 shadow-lg">
                        <Star className="w-4 h-4 text-white fill-white" />
                        <span className="text-white font-semibold text-xs">Hot</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="relative p-6">
                    <h3 className="text-white text-xl md:text-2xl font-bold mb-3 line-clamp-1 group-hover:text-orange-400 transition-colors duration-300">
                      {dish.dish.name}
                    </h3>

                    <p className="text-gray-400 text-sm md:text-base mb-4 line-clamp-2 leading-relaxed">
                      {dish.dish.description || "Món ăn đặc biệt với hương vị tuyệt vời"}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-orange-400">
                          {formatCurrency(Number(dish.price))}
                        </span>
                      </div>

                      {/* Action Button */}
                      <Link
                        href={`/dishes/${dish.id}`}
                        className="text-white hover:underline transition-all duration-300 group/btn block"
                      >
                        <span>Xem chi tiết</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center">
              <Link
                href="/menu"
                className="inline-flex items-center gap-3 px-8 py-4 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-lg rounded-xl shadow-xl hover:shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 hover:-translate-y-1 border-2 border-orange-400/50"
              >
                <Sparkles className="w-5 h-5" />
                <span>Khám phá tất cả món ăn</span>
                <ChevronRight className="w-5 h-5" />
              </Link>
              <div className="mt-4 h-1 w-48 mx-auto bg-linear-to-r from-transparent via-orange-400 to-transparent rounded-full" />
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-800/50 border-2 border-gray-700 mb-6">
              <Flame className="w-12 h-12 text-gray-500" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-400 mb-2">Chưa có món ăn phổ biến</h3>
            <p className="text-gray-500">Hãy quay lại sau để khám phá những món ăn tuyệt vời!</p>
          </div>
        )}
      </section>

      {/* Booking & Location Section */}
      <section className="py-8 px-6 sm:px-8 lg:px-33.75">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="relative">
            <div
              className="absolute inset-0 bg-cover bg-center rounded-lg"
              style={{ backgroundImage: `url('/images/restaurant_banner.png')` }}
            />
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm rounded-lg" />
            <div className="relative z-10 p-10 text-center text-white border border-white/20 rounded-lg h-full flex flex-col justify-center">
              <h3 className="text-2xl font-medium mb-6">Tìm chúng tôi tại đây</h3>
              <div className="space-y-2">
                <p>123 HV HCM City</p>
                <p>+0123 456 7890</p>
                <p>phamminhthuan912@gmail.com</p>
              </div>
            </div>
          </div>
          <div className="bg-orange-400 p-10 rounded-lg">
            <h3 className="text-gray-900 text-2xl font-medium mb-6 text-center">Giờ mở cửa</h3>
            <div className="space-y-4 text-gray-900 text-center">
              <div className="flex flex-col items-center">
                <span className="font-semibold text-lg">Thứ Hai - Chủ Nhật</span>
                <span className="mt-1 px-4 py-2 rounded-full bg-orange-100 text-orange-700 font-bold text-xl shadow inline-block">
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
          <h2 className="text-white text-xl md:text-2xl lg:text-3xl font-medium mb-6">
            Ghé thăm nhà hàng của chúng tôi
          </h2>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Thực đơn phong cách đồng quê chất lượng, dịch vụ thân thiện và hiệu quả, kết hợp với giá trị thực
            sự đã khiến nhà hàng của chúng tôi phục vụ các gia đình như bạn trong hơn 5 năm.
          </p>
          <div className="mt-4 h-1 w-32 mx-auto bg-linear-to-r from-transparent via-orange-400 to-transparent rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <div className="relative group overflow-hidden shadow-lg">
              <Image
                src="/images/restaurant.png"
                alt="Nội thất nhà hàng"
                width={250}
                height={300}
                className="w-full h-71.25 object-cover transition-transform duration-500 group-hover:scale-105 group-hover:shadow-2xl"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-gray-900/80 to-transparent px-4 py-2">
                <span className="text-white text-base font-semibold">Không gian nhà hàng</span>
              </div>
            </div>
            <div className="relative group overflow-hidden shadow-lg">
              <Image
                src="/images/restaurant_banner.png"
                alt="Nội thất nhà hàng"
                width={250}
                height={300}
                className="w-full h-71.25 object-cover transition-transform duration-500 group-hover:scale-105 group-hover:shadow-2xl"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-gray-900/80 to-transparent px-4 py-2">
                <span className="text-white text-base font-semibold">Sảnh tiếp khách</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-6">
            <div className="relative group overflow-hidden shadow-lg h-71.25 lg:h-146.5">
              <Image
                src="/images/house.png"
                alt="Nội thất nhà hàng"
                width={250}
                height={300}
                className="w-full h-full lg:h-146.5 object-cover transition-transform duration-500 group-hover:scale-105 group-hover:shadow-2xl"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-gray-900/80 to-transparent px-4 py-2">
                <span className="text-white text-base font-semibold">Phòng ăn chính</span>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="relative group overflow-hidden shadow-lg">
              <Image
                src="/images/Dish.png"
                alt="Món ăn"
                width={250}
                height={300}
                className="w-full h-71.25 object-cover transition-transform duration-500 group-hover:scale-105 group-hover:shadow-2xl"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-gray-900/80 to-transparent px-4 py-2">
                <span className="text-white text-base font-semibold">Món ăn đặc sắc</span>
              </div>
            </div>
            <div className="relative group overflow-hidden shadow-lg">
              <Image
                src="/images/chef.png"
                alt="Đầu bếp"
                width={250}
                height={300}
                className="w-full h-71.25 object-cover transition-transform duration-500 group-hover:scale-105 group-hover:shadow-2xl"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-gray-900/80 to-transparent px-4 py-2">
                <span className="text-white text-base font-semibold">Đầu bếp chuyên nghiệp</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Banner */}
      <section className="relative overflow-hidden py-12">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.3),transparent_50%)]" />
        </div>

        <div className="relative z-10 px-6 sm:px-8 lg:px-33.75">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-3 drop-shadow-lg">
              Tại sao chọn chúng tôi?
            </h2>
            <div className="w-24 h-1 bg-white/80 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              {
                Icon: Sparkles,
                title: "Hương vị tuyệt vời",
                description: "Món ăn đặc sắc",
                color: "text-yellow-400",
                bgColor: "bg-yellow-500/20",
                borderColor: "border-yellow-400/30",
                shadowColor: "shadow-yellow-500/20",
              },
              {
                Icon: Users,
                title: "Tự phục vụ",
                description: "Nhanh chóng tiện lợi",
                color: "text-blue-400",
                bgColor: "bg-blue-500/20",
                borderColor: "border-blue-400/30",
                shadowColor: "shadow-blue-500/20",
              },
              {
                Icon: Award,
                title: "Món ăn ngon nhất",
                description: "Chất lượng hàng đầu",
                color: "text-green-400",
                bgColor: "bg-green-500/20",
                borderColor: "border-green-400/30",
                shadowColor: "shadow-green-500/20",
              },
              {
                Icon: ChefHat,
                title: "Đầu bếp chuyên nghiệp",
                description: "Kinh nghiệm lâu năm",
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
                  <h3 className="text-lg md:text-xl lg:text-2xl font-bold text-white mb-1 group-hover:text-yellow-100 transition-colors duration-300 drop-shadow-md">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-white/80 group-hover:text-white transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom decorative wave */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-white/30 to-transparent" />
      </section>
    </div>
  );
}
