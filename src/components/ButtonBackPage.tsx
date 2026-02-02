"use client";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ButtonBackPage() {
  const router = useRouter();
  return (
    <div className="hidden sm:block">
      <button
        onClick={() => router.back()}
        aria-label="Go back"
        className={
          "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium " +
          "text-gray-700 bg-white border border-gray-200 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors " +
          "dark:bg-slate-800 dark:text-gray-100 dark:border-slate-700"
        }
      >
        <ArrowLeft className="w-4 h-4 stroke-current" />
        <span>Back</span>
      </button>
    </div>
  );
}
