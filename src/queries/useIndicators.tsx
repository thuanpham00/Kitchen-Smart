import indicatorApiRequest from "@/apiRequests/indicators";
import { DashboardIndicatorQueryParamsType } from "@/schemaValidations/indicator.schema";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const useDashboardIndicator = (queryParams: DashboardIndicatorQueryParamsType) => {
  return useQuery({
    queryKey: ["dashboardIndicators", queryParams],
    queryFn: () => {
      return indicatorApiRequest.getDashboardIndicators(queryParams);
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
