// ── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserDto;
}

export interface UserDto {
  id: string;
  email: string;
}

export interface SignupRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// ── Wallet ────────────────────────────────────────────────────────────────────

export interface WalletCardResponse {
  id: string;
  cardId: string;
  displayName: string;
  bankId: string;
  cardTier?: string;
  rewardCurrencyType?: string;
  isPrimary: boolean;
  nickname?: string;
  addedAt: string;
}

export interface AddCardRequest {
  cardId: string;
  nickname?: string;
  isPrimary?: boolean;
}

export interface UpdateCardRequest {
  nickname?: string;
  isPrimary?: boolean;
}

// ── Card Catalogue ────────────────────────────────────────────────────────────

export interface CreditCard {
  id: string;
  displayName: string;
  bankId: string;
  cardTier?: string;
  cardNetwork?: string;
  rewardCurrencyType?: string;
  annualFee?: number;
  status?: string;
}

// ── Recommendation ────────────────────────────────────────────────────────────

export interface RecommendationRequest {
  merchantName?: string;
  merchantId?: string;
  categoryId?: string;
  amount: number;
  channel?: string;
  paymentApp?: string;
  transactionDate?: string;
  hasAmazonPrime?: boolean;
}

export interface RecommendationResponse {
  recommendedCardId: string;
  recommendationExplanation: string;
  rankedCards: CardResult[];
  resolvedMerchant?: string;
  resolvedCategory?: string;
  confidenceTier: 'HIGH' | 'MEDIUM' | 'LOW';
  confidenceReason?: string;
  computationMs: number;
}

export interface CardResult {
  cardId: string;
  cardName: string;
  bankName: string;
  totalScore: number;
  estimatedRewardRs: number;
  offerUpliftRs: number;
  effectiveRewardRatePercent: number;
  nativeCurrencyAmount?: string;
  nativeCurrencyLabel?: string;
  redemptionModeAssumption?: string;
  winningRuleId?: string;
  capDisclosures?: CapDisclosure[];
  milestoneInfos?: MilestoneInfo[];
  relevantBenefits?: BenefitHit[];
  offersApplied?: string[];
  confidenceTier: string;
  cardStatus: string;
}

export interface CapDisclosure {
  ruleId: string;
  capLabel: string;
  capValue?: number;
  period: string;
  explanation: string;
}

export interface MilestoneInfo {
  milestoneId: string;
  description: string;
  spendTarget?: number;
  rewardDescription?: string;
}

export interface BenefitHit {
  benefitType: string;
  description: string;
  isWarning: boolean;
}

// ── API wrapper ───────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  errorCode?: string;
  message?: string;
}
