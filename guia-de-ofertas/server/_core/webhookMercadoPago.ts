import { Router } from 'express';
import { getDb } from '../db';
import { subscriptions } from '../../drizzle/schema';

const router = Router();

/**
 * Webhook do Mercado Pago para confirmar pagamentos
 * POST /api/webhooks/mercadopago
 */
router.post('/mercadopago', async (req, res) => {
  try {
    const { type, data } = req.body;

    console.log(`[Webhook MP] Recebido evento: ${type}`);

    if (type === 'payment') {
      const paymentId = data.id;
      
      const externalReference = data.external_reference;
      if (!externalReference) {
        console.log('[Webhook MP] Sem external_reference, ignorando');
        return res.status(200).json({ ok: true });
      }

      // Extrair informações do pagamento: user_123_monthly
      const [, userIdStr, planType] = externalReference.split('_');
      const userId = parseInt(userIdStr);

      if (!userId || !planType) {
        console.log('[Webhook MP] Dados inválidos no external_reference');
        return res.status(200).json({ ok: true });
      }

      // Verificar status do pagamento
      if (data.status === 'approved') {
        console.log(`[Webhook MP] Pagamento aprovado para usuário ${userId} - Plano: ${planType}`);

        const db = await getDb();
        if (!db) {
          console.error('[Webhook MP] Database não disponível');
          return res.status(500).json({ error: 'Database error' });
        }

        try {
          // Calcular data de expiração baseado no plano
          const now = new Date();
          let endDate = new Date();
          let price = '5.90';
          
          if (planType === 'monthly') {
            endDate.setMonth(endDate.getMonth() + 1);
            price = '5.90';
          } else if (planType === 'annual') {
            endDate.setFullYear(endDate.getFullYear() + 1);
            price = '50.00';
          }

          // Atualizar ou criar assinatura
          await db
            .insert(subscriptions)
            .values({
              userId,
              planType: planType as any,
              price,
              status: 'active',
              startDate: now,
              endDate,
              mercadoPagoId: paymentId.toString(),
            })
            .onDuplicateKeyUpdate({
              set: {
                status: 'active',
                startDate: now,
                endDate,
                mercadoPagoId: paymentId.toString(),
              },
            });

          console.log(`[Webhook MP] Assinatura criada/atualizada para usuário ${userId}`);
        } catch (error) {
          console.error('[Webhook MP] Erro ao atualizar assinatura:', error);
        }
      } else if (data.status === 'rejected') {
        console.log(`[Webhook MP] Pagamento rejeitado para usuário ${userId}`);
      } else if (data.status === 'pending') {
        console.log(`[Webhook MP] Pagamento pendente para usuário ${userId}`);
      }
    }

    // Sempre retornar 200 para o Mercado Pago
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('[Webhook MP] Erro ao processar webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export function registerWebhookRoutes(app: any) {
  app.use('/api/webhooks', router);
}
