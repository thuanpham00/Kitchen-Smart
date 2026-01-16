import {
  CreateTableBodyType,
  TableListResType,
  TableResType,
  UpdateTableBodyType,
} from "@/schemaValidations/table.schema";
import http from "@/utils/http";

export const tableApiRequests = {
  list: () => {
    return http.get<TableListResType>("/tables");
  },
  addTable: (body: CreateTableBodyType) => {
    return http.post<TableResType>("/tables", body);
  },
  updateTable: (id: number, body: UpdateTableBodyType) => {
    return http.put<TableResType>(`/tables/${id}`, body);
  },
  deleteTable: (id: number) => {
    return http.delete<TableResType>(`/tables/${id}`);
  },
  getTableById: (id: number) => {
    return http.get<TableResType>(`/tables/${id}`);
  },
};
