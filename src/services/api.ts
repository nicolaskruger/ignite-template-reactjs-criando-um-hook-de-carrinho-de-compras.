import axios from 'axios';
import { Stock } from '../types';

const PRODUCTS = "/products";
const STOCKS = "/stock";

type Product = {
  id: number,
  title: string,
  price: number,
  image: string,
}

export const api = axios.create({
  baseURL: 'http://localhost:3333',
});

export const apiLoadProducts = async (): Promise<Product[]> => {
  return (await api.get(PRODUCTS)).data
}

export const apiLoadProductById = async (id: number): Promise<Product> => {
  return (await api.get(`${PRODUCTS}/${id}`)).data
}

export const apiLoadStockById = async (id: number): Promise<Stock> => {
  return (await api.get(`${STOCKS}/${id}`)).data
}