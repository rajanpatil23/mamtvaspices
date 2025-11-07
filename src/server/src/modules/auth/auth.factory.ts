import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { CartService } from '../cart/cart.service';
import { CartRepository } from '../cart/cart.repository';

export const makeAuthController = () => {
  const repository = new AuthRepository();
  const service = new AuthService(repository);
  
  // ✅ Create CartService to pass to AuthController for cart merging
  const cartRepository = new CartRepository();
  const cartService = new CartService(cartRepository);
  
  return new AuthController(service, cartService);
};
