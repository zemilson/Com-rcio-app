import { startAllJobs } from '../cronJobs';

/**
 * Inicializar todos os cron jobs ao iniciar o servidor
 */
export function initializeCronJobs() {
  try {
    console.log('[Init] Inicializando cron jobs...');
    startAllJobs();
    console.log('[Init] Cron jobs inicializados com sucesso');
  } catch (error) {
    console.error('[Init] Erro ao inicializar cron jobs:', error);
  }
}
