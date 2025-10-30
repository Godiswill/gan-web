import { sql } from 'drizzle-orm';
import {
  boolean,
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  index,
  uniqueIndex,
  decimal,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import type { AdapterAccountType } from '@auth/core/adapters';
// ==================== 枚举定义 ====================

// 订阅计划类型
export const subscriptionPlanTypeEnum = pgEnum('subscriptionPlanType', [
  'free', // 免费版
  'basic', // 基础版
  'pro', // 专业版
  'enterprise', // 企业版
]);

// 计费周期
export const billingPeriodEnum = pgEnum('billingPeriod', [
  'monthly', // 月付
  'yearly', // 年付
]);

// 订阅状态
export const subscriptionStatusEnum = pgEnum('subscriptionStatus', [
  'active', // 活跃
  'canceled', // 已取消
  'expired', // 已过期
  'past_due', // 逾期
]);

// 交易类型
export const transactionTypeEnum = pgEnum('transactionType', [
  'subscription', // 订阅付费
  'credit_purchase', // 购买积分
  'referral_reward', // 邀请奖励
  'new_user_bonus', // 新用户赠送
]);

// 积分类型
export const creditTypeEnum = pgEnum('creditType', [
  'permanent', // 永久积分
  'subscription', // 订阅积分
]);

// 图片转换状态
export const conversionStatusEnum = pgEnum('conversionStatus', [
  'pending', // 等待处理
  'processing', // 处理中
  'completed', // 完成
  'failed', // 失败
]);

function generateShortId() {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const digits = 6; // 生成6个字符的短链
  const values = new Uint8Array(digits);
  crypto.getRandomValues(values);
  for (let i = 0; i < digits; i++) {
    result += chars[values[i] % chars.length];
  }
  return result;
}

// ==================== Next-Auth 表 ====================

export const users = pgTable(
  'user',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text('name'),
    email: text('email').notNull().unique(),
    emailVerified: timestamp('emailVerified', { mode: 'date' }),
    image: text('image'),

    // ======= 业务字段 =======
    // 方便后续鉴权
    role: text('role', {
      enum: ['user', 'admin'],
    })
      .notNull()
      .default('user'),
    // 邀请系统
    inviteCode: text('inviteCode')
      .notNull()
      .unique()
      .$defaultFn(() => generateShortId()),
    invitedBy: text('invitedBy'),

    // 积分系统 (混合模式)
    credits: integer('credits').notNull().default(10), // 永久有效，可以直接购买，或拉新用户获取
    subscriptionCredits: integer('subscriptionCredits').notNull().default(0), // 订阅积分(每月重置)

    createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('userEmailUniqueIdx').on(sql`lower(${table.email})`),
    uniqueIndex('usersInviteCodeIdx').on(table.inviteCode),
    index('usersInvitedByIdx').on(table.invitedBy),
  ]
);

export const accounts = pgTable(
  'account',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
  ]
);

export const sessions = pgTable('session', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (verificationToken) => [
    {
      compositePk: primaryKey({
        columns: [verificationToken.identifier, verificationToken.token],
      }),
    },
  ]
);

// WebAuthn / Passkeys
export const authenticators = pgTable(
  'authenticator',
  {
    credentialID: text('credentialID').notNull().unique(),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    providerAccountId: text('providerAccountId').notNull(),
    credentialPublicKey: text('credentialPublicKey').notNull(),
    counter: integer('counter').notNull(),
    credentialDeviceType: text('credentialDeviceType').notNull(),
    credentialBackedUp: boolean('credentialBackedUp').notNull(),
    transports: text('transports'),
  },
  (authenticator) => [
    {
      compositePK: primaryKey({
        columns: [authenticator.userId, authenticator.credentialID],
      }),
    },
  ]
);

// ==================== 订阅计划配置表 ====================

export const subscriptionPlans = pgTable(
  'subscriptionPlan',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    // 计划标识
    planType: subscriptionPlanTypeEnum('planType').notNull(), // 计划类型
    billingPeriod: billingPeriodEnum('billingPeriod').notNull(), // 计费周期

    // 定价信息
    name: text('name').notNull(), // 计划名称，如 "Basic Monthly"
    price: decimal('price', { precision: 10, scale: 2 }).notNull(), // 价格（美元）
    currency: text('currency').notNull().default('USD'), // 货币

    // 积分配置
    creditsPerPeriod: integer('creditsPerPeriod').notNull(), // 每周期积分数

    // Stripe 集成
    stripePriceId: text('stripePriceId').unique(), // Stripe Price ID
    stripeProductId: text('stripeProductId'), // Stripe Product ID

    // 功能配置 (JSON)
    features: text('features'), // JSON 格式的功能列表

    // 状态
    isActive: boolean('isActive').notNull().default(true), // 是否可用
    isPopular: boolean('isPopular').notNull().default(false), // 是否为热门推荐
    displayOrder: integer('displayOrder').notNull().default(0), // 显示顺序

    // 描述
    description: text('description'), // 计划描述

    createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    index('subscriptionPlanTypeIdx').on(table.planType, table.billingPeriod),
    index('subscriptionPlanActiveIdx').on(table.isActive),
  ]
);

// ==================== 积分包配置表 ====================

export const creditPackages = pgTable(
  'creditPackage',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    // 包裹信息
    name: text('name').notNull(), // 包裹名称，如 "Small Pack"
    credits: integer('credits').notNull(), // 积分数量

    // 定价信息
    price: decimal('price', { precision: 10, scale: 2 }).notNull(), // 价格（美元）
    currency: text('currency').notNull().default('USD'), // 货币
    bonusPercentage: integer('bonusPercentage').notNull().default(0), // 赠送百分比

    // Stripe 集成
    stripePriceId: text('stripePriceId').unique(), // Stripe Price ID
    stripeProductId: text('stripeProductId'), // Stripe Product ID

    // 状态
    isActive: boolean('isActive').notNull().default(true), // 是否可用
    isPopular: boolean('isPopular').notNull().default(false), // 是否为热门推荐
    displayOrder: integer('displayOrder').notNull().default(0), // 显示顺序

    // 描述
    description: text('description'), // 包裹描述

    createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [index('creditPackageActiveIdx').on(table.isActive)]
);

// ==================== 订阅管理 ====================

export const subscriptions = pgTable(
  'subscription',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    // 关联订阅计划
    planId: text('planId')
      .notNull()
      .references(() => subscriptionPlans.id), // 关联的计划ID

    status: subscriptionStatusEnum('status').notNull().default('active'), // 订阅状态

    // Stripe 集成
    stripeSubscriptionId: text('stripeSubscriptionId').unique(), // Stripe订阅ID
    stripeCustomerId: text('stripeCustomerId'), // Stripe客户ID

    // 周期信息
    currentPeriodStart: timestamp('currentPeriodStart', {
      mode: 'date',
    }).notNull(), // 当前周期开始时间
    currentPeriodEnd: timestamp('currentPeriodEnd', { mode: 'date' }).notNull(), // 当前周期结束时间
    cancelAtPeriodEnd: boolean('cancelAtPeriodEnd').notNull().default(false), // 是否在周期结束时取消
    canceledAt: timestamp('canceledAt', { mode: 'date' }), // 取消时间

    // 快照信息（保存订阅时的计划信息，防止计划变更影响历史数据）
    planSnapshot: text('planSnapshot'), // JSON 格式的计划快照

    createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    index('subscriptionUserIdIdx').on(table.userId),
    index('subscriptionPlanIdIdx').on(table.planId),
    index('subscriptionStripeSubscriptionIdIdx').on(table.stripeSubscriptionId),
  ]
);

// ==================== 交易记录 ====================

export const transactions = pgTable(
  'transaction',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    type: transactionTypeEnum('type').notNull(), // 交易类型

    // 关联订阅计划或积分包
    planId: text('planId').references(() => subscriptionPlans.id), // 如果是订阅
    packageId: text('packageId').references(() => creditPackages.id), // 如果是购买积分

    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(), // 交易金额（美元）
    credits: integer('credits').notNull(), // 获得的积分数
    creditType: creditTypeEnum('creditType').notNull(), // 积分类型

    stripePaymentIntentId: text('stripePaymentIntentId').unique(), // Stripe支付意图ID
    stripeInvoiceId: text('stripeInvoiceId'), // Stripe发票ID

    referredUserId: text('referredUserId').references(() => users.id), // 如果是邀请奖励，关联被邀请用户
    relatedTransactionId: text('relatedTransactionId').references(
      (): any => transactions.id
    ), // 关联的交易（用于邀请奖励）

    metadata: text('metadata'), // JSON格式的额外信息

    createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    index('transactionUserIdIdx').on(table.userId),
    index('transactionTypeIdx').on(table.type),
    index('transactionPlanIdIdx').on(table.planId),
    index('transactionPackageIdIdx').on(table.packageId),
    index('transactionReferredUserIdIdx').on(table.referredUserId),
  ]
);

// ==================== 积分使用记录 ====================

export const creditUsages = pgTable(
  'creditUsage',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    creditsUsed: integer('creditsUsed').notNull(), // 使用的积分数
    creditType: creditTypeEnum('creditType').notNull(), // 使用的积分类型

    conversionId: text('conversionId').references((): any => conversions.id), // 关联的图片转换记录

    description: text('description'), // 使用说明

    createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    index('creditUsageUserIdIdx').on(table.userId),
    index('creditUsageConversionIdIdx').on(table.conversionId),
  ]
);

// ==================== 图片转换记录 ====================

export const conversions = pgTable(
  'conversion',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    status: conversionStatusEnum('status').notNull().default('pending'), // 转换状态

    originalImageUrl: text('originalImageUrl').notNull(), // 原始图片URL
    convertedImageUrl: text('convertedImageUrl'), // 转换后图片URL

    stylePrompt: text('stylePrompt').notNull(), // 风格描述/提示词
    falRequestId: text('falRequestId'), // fal.ai的请求ID

    creditsUsed: integer('creditsUsed').notNull(), // 本次转换消耗的积分

    errorMessage: text('errorMessage'), // 错误信息（如果失败）
    processingTime: integer('processingTime'), // 处理时间（秒）

    metadata: text('metadata'), // JSON格式的额外信息（如图片尺寸、模型参数等）

    createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
    completedAt: timestamp('completedAt', { mode: 'date' }), // 完成时间
  },
  (table) => [
    index('conversionUserIdIdx').on(table.userId),
    index('conversionStatusIdx').on(table.status),
    index('conversionCreatedAtIdx').on(table.createdAt),
  ]
);

// ==================== 邀请记录 ====================

export const invitations = pgTable(
  'invitation',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    inviterId: text('inviterId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }), // 邀请人ID
    inviteeId: text('inviteeId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }), // 被邀请人ID

    inviteCode: text('inviteCode').notNull(), // 使用的邀请码

    firstPurchaseAt: timestamp('firstPurchaseAt', { mode: 'date' }), // 被邀请人首次付费时间
    rewardTransactionId: text('rewardTransactionId').references(
      () => transactions.id
    ), // 关联的奖励交易记录

    totalRewardedCredits: integer('totalRewardedCredits').notNull().default(0), // 累计奖励积分

    createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
  },
  (table) => [
    index('invitationInviterIdIdx').on(table.inviterId),
    index('invitationInviteeIdIdx').on(table.inviteeId),
  ]
);

// ==================== 表关系定义 ====================

// User Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  // Next-Auth 关系
  accounts: many(accounts),
  sessions: many(sessions),
  authenticators: many(authenticators),

  // 邀请关系
  inviter: one(users, {
    fields: [users.invitedBy],
    references: [users.id],
    relationName: 'inviter',
  }),
  invitees: many(users, {
    relationName: 'inviter',
  }),

  // 业务关系
  subscriptions: many(subscriptions),
  transactions: many(transactions),
  creditUsages: many(creditUsages),
  conversions: many(conversions),

  // 邀请记录（作为邀请人）
  sentInvitations: many(invitations, {
    relationName: 'inviter',
  }),
  // 邀请记录（作为被邀请人）
  receivedInvitations: many(invitations, {
    relationName: 'invitee',
  }),

  // 被推荐的交易
  referredTransactions: many(transactions, {
    relationName: 'referredUser',
  }),
}));

// Account Relations
export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

// Session Relations
export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

// Authenticator Relations
export const authenticatorsRelations = relations(authenticators, ({ one }) => ({
  user: one(users, {
    fields: [authenticators.userId],
    references: [users.id],
  }),
}));

// SubscriptionPlan Relations
export const subscriptionPlansRelations = relations(
  subscriptionPlans,
  ({ many }) => ({
    subscriptions: many(subscriptions),
    transactions: many(transactions),
  })
);

// CreditPackage Relations
export const creditPackagesRelations = relations(
  creditPackages,
  ({ many }) => ({
    transactions: many(transactions),
  })
);

// Subscription Relations
export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  plan: one(subscriptionPlans, {
    fields: [subscriptions.planId],
    references: [subscriptionPlans.id],
  }),
}));

// Transaction Relations
export const transactionsRelations = relations(
  transactions,
  ({ one, many }) => ({
    user: one(users, {
      fields: [transactions.userId],
      references: [users.id],
    }),
    plan: one(subscriptionPlans, {
      fields: [transactions.planId],
      references: [subscriptionPlans.id],
    }),
    package: one(creditPackages, {
      fields: [transactions.packageId],
      references: [creditPackages.id],
    }),
    referredUser: one(users, {
      fields: [transactions.referredUserId],
      references: [users.id],
      relationName: 'referredUser',
    }),
    relatedTransaction: one(transactions, {
      fields: [transactions.relatedTransactionId],
      references: [transactions.id],
      relationName: 'relatedTransaction',
    }),
    // 关联到该交易的其他交易（如奖励交易）
    derivedTransactions: many(transactions, {
      relationName: 'relatedTransaction',
    }),
    // 关联的邀请奖励记录
    invitationRewards: many(invitations),
  })
);

// CreditUsage Relations
export const creditUsagesRelations = relations(creditUsages, ({ one }) => ({
  user: one(users, {
    fields: [creditUsages.userId],
    references: [users.id],
  }),
  conversion: one(conversions, {
    fields: [creditUsages.conversionId],
    references: [conversions.id],
  }),
}));

// Conversion Relations
export const conversionsRelations = relations(conversions, ({ one, many }) => ({
  user: one(users, {
    fields: [conversions.userId],
    references: [users.id],
  }),
  creditUsages: many(creditUsages),
}));

// Invitation Relations
export const invitationsRelations = relations(invitations, ({ one }) => ({
  inviter: one(users, {
    fields: [invitations.inviterId],
    references: [users.id],
    relationName: 'inviter',
  }),
  invitee: one(users, {
    fields: [invitations.inviteeId],
    references: [users.id],
    relationName: 'invitee',
  }),
  rewardTransaction: one(transactions, {
    fields: [invitations.rewardTransactionId],
    references: [transactions.id],
  }),
}));

// ==================== 枚举类型导出 ====================

export type SubscriptionPlanType =
  (typeof subscriptionPlanTypeEnum.enumValues)[number];
export type BillingPeriod = (typeof billingPeriodEnum.enumValues)[number];
export type SubscriptionStatus =
  (typeof subscriptionStatusEnum.enumValues)[number];
export type TransactionType = (typeof transactionTypeEnum.enumValues)[number];
export type CreditType = (typeof creditTypeEnum.enumValues)[number];
export type ConversionStatus = (typeof conversionStatusEnum.enumValues)[number];

// ==================== 表类型导出 ====================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type VerificationToken = typeof verificationTokens.$inferSelect;
export type NewVerificationToken = typeof verificationTokens.$inferInsert;

export type Authenticator = typeof authenticators.$inferSelect;
export type NewAuthenticator = typeof authenticators.$inferInsert;

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type NewSubscriptionPlan = typeof subscriptionPlans.$inferInsert;

export type CreditPackage = typeof creditPackages.$inferSelect;
export type NewCreditPackage = typeof creditPackages.$inferInsert;

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;

export type CreditUsage = typeof creditUsages.$inferSelect;
export type NewCreditUsage = typeof creditUsages.$inferInsert;

export type Conversion = typeof conversions.$inferSelect;
export type NewConversion = typeof conversions.$inferInsert;

export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
