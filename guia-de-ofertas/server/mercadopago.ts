import axios from 'axios';

const MP_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN || '';
const MP_API_URL = 'https://api.mercadopago.com/v1';

export interface MercadoPagoPreference {
  id: string;
  init_point: string;
  sandbox_init_point: string;
}

export interface SubscriptionPlan {
  planType: 'monthly' | 'annual';
  price: number;
  description: string;
}

const PLANS: Record<string, SubscriptionPlan> = {
  monthly: {
    planType: 'monthly',
    price: 5.90,
    description: 'Acesso mensal ao Guia de Ofertas',
  },
  annual: {
    planType: 'annual',
    price: 50.00,
    description: 'Acesso anual ao Guia de Ofertas (10x sem juros)',
  },
};

/**
 * Criar preferência de pagamento no Mercado Pago
 */
export async function createPaymentPreference(
  planType: 'monthly' | 'annual',
  userId: number,
  userEmail: string
): Promise<MercadoPagoPreference> {
  if (!MP_ACCESS_TOKEN) {
    throw new Error('Mercado Pago access token não configurado');
  }

  const plan = PLANS[planType];
  if (!plan) {
    throw new Error(`Plano inválido: ${planType}`);
  }

  try {
    const response = await axios.post(
      `${MP_API_URL}/checkout/preferences`,
      {
        items: [
          {
            title: plan.description,
            description: `Plano ${planType === 'monthly' ? 'Mensal' : 'Anual'}`,
            quantity: 1,
            unit_price: plan.price,
            currency_id: 'BRL',
          },
        ],
        payer: {
          email: userEmail,
        },
        external_reference: `user_${userId}_${planType}`,
        back_urls: {
          success: `${process.env.APP_URL || 'http://localhost:3000'}/subscription/success`,
          failure: `${process.env.APP_URL || 'http://localhost:3000'}/subscription/failure`,
          pending: `${process.env.APP_URL || 'http://localhost:3000'}/subscription/pending`,
        },
        auto_return: 'approved',
        notification_url: `${process.env.APP_URL || 'http://localhost:3000'}/api/webhooks/mercadopago`,
      },
      {
        headers: {
          Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      id: response.data.id,
      init_point: response.data.init_point,
      sandbox_init_point: response.data.sandbox_init_point,
    };
  } catch (error) {
    console.error('Erro ao criar preferência Mercado Pago:', error);
    throw new Error('Erro ao criar preferência de pagamento');
  }
}

/**
 * Verificar status de pagamento no Mercado Pago
 */
export async function getPaymentStatus(paymentId: string): Promise<any> {
  if (!MP_ACCESS_TOKEN) {
    throw new Error('Mercado Pago access token não configurado');
  }

  try {
    const response = await axios.get(`${MP_API_URL}/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Erro ao obter status de pagamento:', error);
    throw new Error('Erro ao obter status de pagamento');
  }
}

/**
 * Processar webhook do Mercado Pago
 */
export async function processWebhook(data: any): Promise<void> {
  const { type, data: webhookData } = data;

  if (type === 'payment') {
    const paymentId = webhookData.id;
    const payment = await getPaymentStatus(paymentId);

    if (payment.status === 'approved') {
      // Extrair informações do pagamento
      const externalReference = payment.external_reference;
      const [, userId, planType] = externalReference.split('_');

      // TODO: Atualizar status de assinatura do usuário no banco
      console.log(`Pagamento aprovado para usuário ${userId} - Plano: ${planType}`);
    }
  }
}

/**
 * Obter plano de assinatura
 */
export function getSubscriptionPlan(planType: 'monthly' | 'annual'): SubscriptionPlan {
  return PLANS[planType];
}

/**
 * Listar todos os planos disponíveis
 */
export function getAllPlans(): SubscriptionPlan[] {
  return Object.values(PLANS);
}
