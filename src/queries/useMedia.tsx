import { mediaApiRequests } from "@/apiRequests/media";
import { useMutation } from "@tanstack/react-query";

export const useUploadMutation = () => {
  return useMutation({
    mutationFn: (formData: FormData) => {
      return mediaApiRequests.upload(formData);
    },
  });
};
