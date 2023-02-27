import axios, { AxiosError } from "axios";
import { AvailableProduct } from "~/models/Product";
import { useQuery, useQueryClient, useMutation } from "react-query";
import React from "react";

export function useAvailableProducts() {
  const API_PATH = "https://koyvk9ichi.execute-api.eu-west-1.amazonaws.com/dev/";
  return useQuery<AvailableProduct[], AxiosError>(
    "available-products",
    async () => {
      const res = await axios
        .get<AvailableProduct[]>(`${API_PATH}/products`)
        .catch((error) => {
          console.error(
            "Error during load products, enablinng mock data",
            error
          );
          return {
            data: [
              {
                description: "Sports Wear",
                id: "3214",
                price: 24,
                title: "Sports Wear",
                count: 1,
              },
              {
                description: "Boxes",
                id: "2134",
                price: 15,
                title: "Set of Boxes",
                count: 2,
              },
              {
                description: "Golf Club",
                id: "2306",
                price: 23,
                title: "Golf Club",
                count: 3,
              },
              {
                description: "Hair Shampoo",
                id: "2289",
                price: 15,
                title: "Hair Shampoo",
                count: 4,
              },
              {
                description: "Camera",
                id: "1243",
                price: 23,
                title: "Camera",
                count: 5,
              },
            ] as AvailableProduct[],
          };
    })
      return res.data;
    }
  );
}


export function useInvalidateAvailableProducts() {
  const queryClient = useQueryClient();
  return React.useCallback(
    () => queryClient.invalidateQueries("available-products", { exact: true }),
    []
  );
}

export function useAvailableProduct(id?: string) {
  const API_PATH = "https://koyvk9ichi.execute-api.eu-west-1.amazonaws.com/dev/";
  return useQuery<AvailableProduct, AxiosError>(
    ["product", { id }],
    async () => {
      const res = await axios.get<AvailableProduct>(
        `${API_PATH}/product/${id}`
      );
      return res.data;
    },
    { enabled: !!id }
  );
}

export function useRemoveProductCache() {
  const queryClient = useQueryClient();
  return React.useCallback(
    (id?: string) =>
      queryClient.removeQueries(["product", { id }], { exact: true }),
    []
  );
}

export function useUpsertAvailableProduct() {
  const API_PATH = "https://koyvk9ichi.execute-api.eu-west-1.amazonaws.com/dev/";
  return useMutation((values: AvailableProduct) =>
    axios.put<AvailableProduct>(`${API_PATH}/product`, values, {
      headers: {
        Authorization: `Basic ${localStorage.getItem("authorization_token")}`,
      },
    })
  );
}

export function useDeleteAvailableProduct() {
  const API_PATH = "https://koyvk9ichi.execute-api.eu-west-1.amazonaws.com/dev/";
  return useMutation((id: string) =>
    axios.delete(`${API_PATH}/product/${id}`, {
      headers: {
        Authorization: `Basic ${localStorage.getItem("authorization_token")}`,
      },
    })
  );
}
