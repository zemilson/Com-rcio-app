import { CronJob } from 'cron';
import { getAdminConfig, deleteExpiredOffers, createOffer } from './db';
import { parseOffers } from './parsers';
import { notifyOwner } from './_core/notification';

let cloneJob: CronJob | null = null;
let cleanupJob: CronJob | null = null;

/**
 * Iniciar cron job de clonagem automática de ofertas
 * Executa a cada 6 horas
 */
export function startCloneJob() {
  if (cloneJob) {
    console.log('[Cron] Clone job já está rodando');
    return;
  }

  cloneJob = new CronJob(
    '0 */6 * * *', // A cada 6 horas
    async () => {
      try {
        console.log('[Cron] Iniciando clonagem automática de ofertas...');
        
        const config = await getAdminConfig();
        
        if (!config || !config.sourceUrl) {
          console.log('[Cron] Nenhuma configuração de origem encontrada');
          return;
        }

        // Parse offers from configured source
        const offers = await parseOffers(
          config.sourceUrl,
          config.parserType as any,
          config.cssSelector ? JSON.parse(config.cssSelector) : undefined
        );

        if (offers.length === 0) {
          console.log('[Cron] Nenhuma oferta encontrada na origem');
          return;
        }

        // Save offers to database
        let savedCount = 0;
        for (const offer of offers) {
          try {
            await createOffer({
              title: offer.title,
              description: offer.description,
              price: offer.price,
              originalPrice: offer.originalPrice,
              image: offer.image,
              source: offer.source,
              sourceUrl: offer.sourceUrl,
              originalUrl: offer.originalUrl,
              expiresAt: offer.expiresAt,
            });
            savedCount++;
          } catch (error) {
            console.error(`[Cron] Erro ao salvar oferta: ${error}`);
          }
        }

        console.log(`[Cron] ${savedCount} ofertas clonadas com sucesso`);

        // Notify owner
        await notifyOwner({
          title: 'Clonagem Automática Concluída',
          content: `${savedCount} novas ofertas foram clonadas automaticamente da fonte configurada.`,
        });
      } catch (error) {
        console.error('[Cron] Erro durante clonagem automática:', error);
        
        // Notify owner about error
        await notifyOwner({
          title: 'Erro na Clonagem Automática',
          content: `Ocorreu um erro durante a clonagem automática de ofertas: ${error}`,
        });
      }
    },
    null,
    true // Start immediately
  );

  console.log('[Cron] Clone job iniciado - executa a cada 6 horas');
}

/**
 * Iniciar cron job de limpeza de ofertas expiradas
 * Executa diariamente à meia-noite
 */
export function startCleanupJob() {
  if (cleanupJob) {
    console.log('[Cron] Cleanup job já está rodando');
    return;
  }

  cleanupJob = new CronJob(
    '0 0 * * *', // Diariamente à meia-noite
    async () => {
      try {
        console.log('[Cron] Iniciando limpeza de ofertas expiradas...');
        
        const deletedCount = await deleteExpiredOffers();
        
        console.log(`[Cron] ${deletedCount} ofertas expiradas removidas`);

        if (deletedCount > 0) {
          await notifyOwner({
            title: 'Limpeza de Ofertas Expiradas',
            content: `${deletedCount} ofertas expiradas foram removidas automaticamente.`,
          });
        }
      } catch (error) {
        console.error('[Cron] Erro durante limpeza de ofertas:', error);
      }
    },
    null,
    true // Start immediately
  );

  console.log('[Cron] Cleanup job iniciado - executa diariamente à meia-noite');
}

/**
 * Parar todos os cron jobs
 */
export function stopAllJobs() {
  if (cloneJob) {
    cloneJob.stop();
    cloneJob = null;
    console.log('[Cron] Clone job parado');
  }

  if (cleanupJob) {
    cleanupJob.stop();
    cleanupJob = null;
    console.log('[Cron] Cleanup job parado');
  }
}

/**
 * Iniciar todos os cron jobs
 */
export function startAllJobs() {
  startCloneJob();
  startCleanupJob();
}
