import apiClient from "./client";
import type { Role, Permission } from "@/types";

export interface CreateRoleDto {
  name: string;
  slug: string;
  description?: string;
  permission_ids: string[];
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  permission_ids?: string[];
}

export const rolesApi = {
  findAll: async (): Promise<Role[]> => {
    const { data } = await apiClient.get<Role[]>("/roles");
    return data;
  },
  findOne: async (id: string): Promise<Role> => {
    const { data } = await apiClient.get<Role>(`/roles/${id}`);
    return data;
  },
  create: async (dto: CreateRoleDto): Promise<Role> => {
    const { data } = await apiClient.post<Role>("/roles", dto);
    return data;
  },
  update: async (id: string, dto: UpdateRoleDto): Promise<Role> => {
    const { data } = await apiClient.put<Role>(`/roles/${id}`, dto);
    return data;
  },
  remove: async (id: string): Promise<unknown> => {
    const { data } = await apiClient.delete(`/roles/${id}`);
    return data;
  },
  getPermissions: async (): Promise<Permission[]> => {
    const { data } = await apiClient.get<Permission[]>("/permissions");
    return data;
  },
  getUsers: async (id: string): Promise<user[]> => {
    const { data } = await apiClient.get<user[]>(`/roles/${id}/users`);
    return data;
  },
};
