import { mediaApiRequests } from "@/apiRequests/media"
import { UploadImageResType } from "@/schemaValidations/media.schema";
import { useMutation } from "@tanstack/react-query"

export const useUploadMutation = () => {
  return useMutation({
    mutationFn: (formData: FormData) => {
      return mediaApiRequests.upload(formData);
    }
  })
}