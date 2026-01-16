import { tableApiRequests } from "@/apiRequests/table";
import { CreateTableBodyType, UpdateTableBodyType } from "@/schemaValidations/table.schema";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetListTableQuery = () => {
  return useQuery({
    queryKey: ["tables"],
    queryFn: () => {
      return tableApiRequests.list();
    },
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useGetTableDetailQuery = ({ id, enabled }: { id: number; enabled: boolean }) => {
  return useQuery({
    queryKey: ["table-detail", id],
    queryFn: () => {
      return tableApiRequests.getTableById(id);
    },
    enabled,
  });
};

export const useAddTableMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateTableBodyType) => {
      return tableApiRequests.addTable(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
  });
};

export const useUpdateTableMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateTableBodyType }) => {
      return tableApiRequests.updateTable(id, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
  });
};

export const useDeleteTableMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => {
      return tableApiRequests.deleteTable(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
  });
};
