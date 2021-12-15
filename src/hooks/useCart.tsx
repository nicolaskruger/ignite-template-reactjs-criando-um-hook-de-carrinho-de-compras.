import { createContext, ReactNode, useContext } from 'react';
import { toast } from 'react-toastify';
import { apiLoadProductById, apiLoadStockById } from '../services/api';
import { Product, Stock } from '../types';
import { useLocalStorageHook } from "./useLocalStorageHook";

const CART = "@RocketShoes:cart"

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useLocalStorageHook<Product[]>(CART, () => {
    const storagedCart = localStorage.getItem(CART);

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const validateStock = async (product: Product) => {
    const stock = await apiLoadStockById(product.id);
    if (product.amount > stock.amount)
      throw new Error("Quantidade solicitada fora de estoque");

  }

  const validateExistsOnCart = (productId: number, message: string) => {
    if (!cart.some(p => p.id === productId))
      throw new Error(message);
  }
  const getProduct = async (productId: number, message: string) => {
    try {

      const product = await apiLoadProductById(productId);
      if (productId === null)
        throw new Error(message);
      return product;
    }
    catch {
      throw new Error(message);
    }
  }

  const updateProduct = (product: Product) => {
    if (cart.find(p => p.id === product.id))
      setCart(cart.map(p => p.id === product.id ? product : p))
    else
      setCart([...cart, product])
  }

  const addProduct = async (productId: number) => {
    try {
      // TODO
      const product = await getProduct(productId, "Erro na adição do produto");
      let newProduct = cart.find(product => product.id === productId) || {
        ...product,
        amount: 0,
      };
      newProduct = { ...newProduct, amount: newProduct.amount + 1 }
      await validateStock(newProduct);
      updateProduct(newProduct);
    } catch (erro) {
      // TODO
      toast.error((erro as Error).message);
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
      validateExistsOnCart(productId, "Erro na remoção do produto")
      setCart(cart.filter(product => product.id !== productId))
    } catch (erro) {
      // TODO
      toast.error((erro as Error).message);
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
      if (amount < 1) {
        throw new Error("Erro na alteração de quantidade do produto");
      }
      validateExistsOnCart(productId, "Erro na alteração de quantidade do produto");

      const product = { ...cart.find(product => product.id === productId), amount } as Product

      await validateStock(product);

      updateProduct(product);
    } catch (erro) {
      // TODO
      toast.error((erro as Error).message)
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
