export type MoneyCents = number;

export type LineItem = {
  sku: string;
  quantity: number;
  unitPriceCents: MoneyCents;
  /** Optional per-line markdown (e.g. clearance) */
  itemDiscountCents?: MoneyCents;
};

export type Cart = {
  items: LineItem[];
};

export type Coupon =
  | { kind: "FIXED"; amountOffCents: MoneyCents }
  | { kind: "PERCENT"; percentOff: number };

export type CheckoutInput = {
  cart: Cart;
  email: string;
  coupon?: Coupon;
};

export type CheckoutResult = {
  subtotalCents: MoneyCents;
  discountCents: MoneyCents;
  totalCents: MoneyCents;
  receiptLines: string[];
};
