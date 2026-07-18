export type ServiceCategory =
  | "moving"
  | "moveCleaning"
  | "applianceCleaning"
  | "repairInstall"
  | "interior"
  | "freight"
  | "insurance"
  | "judicialScrivener"
  | "taxAccounting"
  | "realEstateAuction"
  | "laborAdmin"
  | "patent"
  | "careerJob"
  | "tutoringEducation"
  | "hobbyGrowth"
  | "outsourcing"
  | "eventBeauty"
  | "designDevelopment"
  | "automotive"
  | "pets";

export type DiscountMode =
  | "group"
  | "roundTrip"
  | "neighborhood"
  | "emptySlot"
  | "priceRequest";

export type DealSource = "customer" | "provider";
export type DealStatus = "recruiting" | "contracted" | "unmatched";
export type PriceTier = { people: number; price: number };

export type ServiceDeal = {
  id: number;
  source: DealSource;
  category: ServiceCategory;
  mode: DiscountMode;
  title: string;
  region: string;
  date: string;
  detail: string;
  discountRate: number;
  approved: number;
  target: number;
  joined: number;
  pending: number;
  status: DealStatus;
  provider?: string;
  verified?: boolean;
  credential?: string;
  desiredPrice?: number;
  initialQuote?: number;
  priceFloor?: number;
  priceCeiling?: number;
  priceTiers?: PriceTier[];
  route?: string;
  reverseRoute?: string;
  vehicleTon?: string;
  workWindow?: string;
  radius?: number;
  projectPeriod?: string;
  emptyDate?: string;
  unavailableReason?: string;
};

export type ServiceRequestInput = {
  category: ServiceCategory;
  region: string;
  date: string;
  title: string;
  detail: string;
  desiredPrice: number;
  priceFloor?: number;
  priceCeiling?: number;
};

export type ProviderDealInput = {
  category: ServiceCategory;
  mode: Exclude<DiscountMode, "priceRequest">;
  region: string;
  date: string;
  title: string;
  detail: string;
  target: number;
  discountRate: number;
  providerName: string;
  credential: string;
  priceFloor?: number;
  priceCeiling?: number;
  priceTiers?: PriceTier[];
  route?: string;
  reverseRoute?: string;
  vehicleTon?: string;
  workWindow?: string;
  radius?: number;
  projectPeriod?: string;
};
