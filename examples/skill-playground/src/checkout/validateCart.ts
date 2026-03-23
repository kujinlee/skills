import type { Cart } from "./types.js";

export function validateCart(cart: Cart): boolean {
  return cart.items.length > 0 && cart.items.every((i) => i.quantity > 0);
}
