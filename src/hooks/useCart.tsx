import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product } from '../types';

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
  const [cart, setCart] = useState<Product[]>(() => {
    // const storagedCart = Buscar dados do localStorage
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  //acessar o estado anterior com o useRef, pra salvar no localStorage cada vez que hook for renderido
  const prevCartRef = useRef<Product[]>();
  //toda vez que renderizar novamente o prevCartRef.current receba o valor de Cart
  useEffect(() => {
    prevCartRef.current = cart;
  })

  const cartPreviousValue = prevCartRef.current ?? cart;
  //verificar se o valor atual do Card é diferente do Anterior ?? se for diferente atualizar para prevCartRef.current
  useEffect(() => {
    if (cartPreviousValue !== cart) { //o valor anterior do Card é diferente do Atual Card, se for setItem no localStorage 
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart))
    }
  }, [cart, cartPreviousValue]); //essas duas propriedade para o useEffect monitorar


  const addProduct = async (productId: number) => {
    try {
      //pegar todos os itens do carrinho
      const updatedCart = [...cart];

      //verificar se o produto ja existe no carrinho
      const isProductOnCart = updatedCart.find(product => product.id === productId)

      //pegar item em estoque pelo id do produto
      const stock = await api.get(`/stock/${productId}`);

      //checar quantia no estoque
      const stockAmount = stock.data.amount;
      //console.log("stockAmount " + stockAmount);

      //checar quantidade item do mesmo produto no carrinho
      const currentAmount = isProductOnCart ? isProductOnCart.amount : 0;
      //console.log("currentAmount " + currentAmount);

      //Se nao existe item no carrinho, add +1
      const amount = currentAmount + 1;

       //checar quantidade em realação ao estoque
      if (amount > stockAmount) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      if (isProductOnCart) {
        isProductOnCart.amount = amount;
      } else {
        const product = await api.get(`/products/${productId}`);

        const newProduct = {
          ...product.data,
          amount: 1
        };
        // console.log(newProduct);
        updatedCart.push(newProduct);
      }

      setCart(updatedCart);

    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const updatedCart = [...cart];
      const productIndex = updatedCart.findIndex(
        (product) => product.id === productId)

      if (productIndex >= 0) {
        updatedCart.splice(productIndex, 1);
        setCart(updatedCart);
      } else {
        throw Error();
      }
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if (amount <= 0) {
        return;
      }

      //pegar item em estoque pelo id do produto
      const stock = await api.get(`/stock/${productId}`);

      //checar quantia no estoque
      const stockAmount = stock.data.amount;

      if (amount > stockAmount) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      const updatedCart = [...cart];
      const productExists = updatedCart.find(product => product.id === productId);

      if (productExists) {
        productExists.amount = amount;
        setCart(updatedCart);
      } else {
        throw Error();
      }
    } catch {
      toast.error('Erro na alteração de quantidade do produto')
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

export default useCart;