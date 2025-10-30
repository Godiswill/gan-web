import { db } from './index';
import { subscriptionPlans, creditPackages } from './schema';

// 定价策略建议,积分消耗参考
// 低质量图片转换：1 积分
// 标准质量图片转换：2-3 积分
// 高质量图片转换：5 积分
// 批量处理（10张）：8 积分

export async function seedPlans() {
  // 订阅计划
  await db.insert(subscriptionPlans).values([
    // Basic 月付
    {
      planType: 'basic',
      billingPeriod: 'monthly',
      name: 'Basic Monthly',
      price: '9.99',
      creditsPerPeriod: 100,
      stripePriceId: 'price_basic_monthly',
      features: JSON.stringify([
        'Basic style templates',
        'Standard processing speed',
        '100 credits per month',
      ]),
      displayOrder: 1,
    },
    // Basic 年付
    {
      planType: 'basic',
      billingPeriod: 'yearly',
      name: 'Basic Yearly',
      price: '99.00',
      creditsPerPeriod: 120,
      stripePriceId: 'price_basic_yearly',
      features: JSON.stringify([
        'Basic style templates',
        'Standard processing speed',
        '120 credits per month',
        'Save 17% vs monthly',
      ]),
      displayOrder: 2,
    },
    // Pro 月付
    {
      planType: 'pro',
      billingPeriod: 'monthly',
      name: 'Pro Monthly',
      price: '19.99',
      creditsPerPeriod: 250,
      stripePriceId: 'price_pro_monthly',
      isPopular: true,
      features: JSON.stringify([
        'All style templates',
        'Priority processing',
        '250 credits per month',
        'Batch processing',
      ]),
      displayOrder: 3,
    },
    // Pro 年付
    {
      planType: 'pro',
      billingPeriod: 'yearly',
      name: 'Pro Yearly',
      price: '199.00',
      creditsPerPeriod: 300,
      stripePriceId: 'price_pro_yearly',
      isPopular: true,
      features: JSON.stringify([
        'All style templates',
        'Priority processing',
        '300 credits per month',
        'Batch processing',
        'Save 17% vs monthly',
      ]),
      displayOrder: 4,
    },
    // Enterprise 月付
    {
      planType: 'enterprise',
      billingPeriod: 'monthly',
      name: 'Enterprise Monthly',
      price: '49.99',
      creditsPerPeriod: 700,
      stripePriceId: 'price_enterprise_monthly',
      features: JSON.stringify([
        'API access',
        'Highest priority',
        '700 credits per month',
        'Custom model training',
        'Dedicated support',
      ]),
      displayOrder: 5,
    },
    // Enterprise 年付
    {
      planType: 'enterprise',
      billingPeriod: 'yearly',
      name: 'Enterprise Yearly',
      price: '499.00',
      creditsPerPeriod: 850,
      stripePriceId: 'price_enterprise_yearly',
      features: JSON.stringify([
        'API access',
        'Highest priority',
        '850 credits per month',
        'Custom model training',
        'Dedicated support',
        'Save 17% vs monthly',
      ]),
      displayOrder: 6,
    },
  ]);

  // 积分包
  await db.insert(creditPackages).values([
    {
      name: 'Small Pack',
      credits: 50,
      price: '4.99',
      bonusPercentage: 0,
      displayOrder: 1,
    },
    {
      name: 'Medium Pack',
      credits: 120,
      price: '9.99',
      bonusPercentage: 20,
      displayOrder: 2,
    },
    {
      name: 'Large Pack',
      credits: 300,
      price: '19.99',
      bonusPercentage: 50,
      isPopular: true,
      displayOrder: 3,
    },
    {
      name: 'Mega Pack',
      credits: 1000,
      price: '49.99',
      bonusPercentage: 100,
      displayOrder: 4,
    },
  ]);
}

// seedPlans();
