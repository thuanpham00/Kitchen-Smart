import http from "@/utils/http";

const revalidateApiRequests = (tag: string) =>
  http.get("/api/revalidate?tag=" + tag, {
    baseUrl: "", // next server
  });
export default revalidateApiRequests;
