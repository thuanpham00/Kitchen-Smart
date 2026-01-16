import { UploadImageResType } from "@/schemaValidations/media.schema";
import http from "@/utils/http";

export const mediaApiRequests = {
  upload: (formdata: FormData) => {
    return http.post<UploadImageResType>("/media/upload", formdata);
  },
};
