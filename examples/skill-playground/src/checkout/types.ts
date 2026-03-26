export type MoneyCents = number;

export type LineItem = {
  sku: string;
  quantity: number;
  unitPriceCents: MoneyCents;
  /** Optional per-line markdown (e.g. clearance) */
  itemDiscountCents?: MoneyCents;
  /** Optional loyalty multiplier for this line (e.g. 2 for double points). */
  pointsMultiplier?: number;
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

// Day 1 contract scaffolding for deepened checkout boundaries.
export type PriceOrderInput = {
  cart: Cart;
  coupon?: Coupon;
};

export type PricingLineSnapshot = {
  sku: string;
  quantity: number;
  lineSubtotalCents: MoneyCents;
};

export type PricingSnapshot = {
  merchandiseSubtotalCents: MoneyCents;
  orderDiscountCents: MoneyCents;
  totalMerchandiseCents: MoneyCents;
  qualifyingSpendCents?: MoneyCents;
  pointsEarned?: number;
  multiplierBreakdown?: Array<{
    sku: string;
    multiplier: number;
    appliedToCents: MoneyCents;
  }>;
  lineItems: PricingLineSnapshot[];
};

export type ReceiptView = {
  summary: {
    merchandiseSubtotalCents: MoneyCents;
    orderDiscountCents: MoneyCents;
    totalMerchandiseCents: MoneyCents;
    qualifyingSpendCents?: MoneyCents;
    pointsEarned?: number;
  };
  lineSummaries: Array<{ label: string; detail?: string }>;
  plainTextBody: string;
  blocks?: Array<{ kind: "line" | "divider" | "total"; text: string }>;
};

export type CheckoutQuote = {
  pricing: PricingSnapshot;
  receipt: ReceiptView;
};

export type CheckoutNotifier = (args: {
  email: string;
  quote: CheckoutQuote;
  legacyResult: CheckoutResult;
}) => void;
