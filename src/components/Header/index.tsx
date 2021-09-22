import { Link } from 'react-router-dom';
import { MdShoppingBasket } from 'react-icons/md';

import logo from '../../assets/images/logo.svg';
import { Container, Cart } from './styles';
import { useCart } from '../../hooks/useCart';

export function Header() {
  const { cart } = useCart();
  const cartSize = cart.length;
  // cart.length é 0, se for incrementado 1 será 1 item, se for mais sera itens.
  // cartSize === 1 ? `${cartSize} item` : `${cartSize} itens`
  
  return (
    <Container>
      <Link to="/">
        <img src={logo} alt="Rocketshoes" />
      </Link>

      <Cart to="/cart">
        <div>
          <strong>My Cart</strong>
          <span data-testid="cart-size">
            {cartSize === 1 ? `${cartSize} product` : `${cartSize} products`} 
          </span>
        </div>
        <MdShoppingBasket size={36} color="#FFF" />
      </Cart>
    </Container>
  );
};


