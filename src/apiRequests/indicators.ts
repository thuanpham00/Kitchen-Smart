import {
  DashboardIndicatorQueryParamsType,
  DashboardIndicatorResType,
} from "@/schemaValidations/indicator.schema";
import http from "@/utils/http";
import queryString from "query-string";

const indicatorApiRequest = {
  getDashboardIndicators: (queryParams: DashboardIndicatorQueryParamsType) => {
    return http.get<DashboardIndicatorResType>(
      "/indicators/dashboard?" +
        queryString.stringify({
          fromDate: queryParams.fromDate?.toISOString(),
          toDate: queryParams.toDate?.toISOString(),
        })
    );
  },
};

export default indicatorApiRequest;
