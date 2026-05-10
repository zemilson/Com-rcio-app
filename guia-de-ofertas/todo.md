# Guia de Ofertas - TODO

## Arquitetura e Banco de Dados
- [x] Definir schema do banco de dados (users, offers, subscriptions, admin_config, clone_history)
- [x] Implementar migrations do Drizzle
- [x] Criar helpers de query no server/db.ts

## Sistema de Trial (7 dias grátis)
- [x] Gerar device ID único para cada usuário
- [x] Criar tabela de trial_sessions com data_inicio e device_id
- [x] Implementar lógica de verificação de trial expirado
- [x] Criar contador regressivo no frontend
- [x] Prevenir reset por reinstalação (validar device_id)
- [x] Bloquear acesso após expiração do trial

## Painel Administrativo
- [x] Criar página de login admin protegida por senha
- [x] Implementar formulário de configuração de URL de origem
- [x] Criar seletor de tipo de parser (JSON, RSS, HTML CSS Selector, Google Sheets CSV)
- [x] Implementar botão "Testar e Clonar" com preview
- [x] Adicionar visualização de histórico de clones
- [x] Mostrar total de ofertas clonadas
- [x] Implementar botão "Salvar e Aplicar"

## Parsers de Ofertas
- [x] Parser JSON estruturado
- [x] Parser RSS/XML
- [x] Parser HTML com CSS Selector
- [x] Parser Google Sheets CSV
- [x] Validação e tratamento de erros para cada parser

## Clonagem e Armazenamento de Ofertas
- [x] Criar tabela de ofertas com campos: title, image, price, source, original_url, etc
- [x] Implementar função de clonagem que salva ofertas no banco
- [x] Adicionar indicação clara da fonte/loja original em cada oferta
- [x] Criar histórico de clonagens realizadas

## Sistema de Assinatura (Mercado Pago)
- [x] Integrar SDK do Mercado Pago
- [x] Criar tela de planos (R$ 5,90/mês e R$ 50,00 em 10x)
- [x] Implementar checkout do Mercado Pago
- [x] Criar webhook para confirmar pagamento
- [x] Armazenar informações de assinatura no banco
- [x] Implementar lógica de verificação de assinatura ativa

## Controle de Acesso e Exibição de Ofertas
- [x] Criar tela inicial com cards de ofertas
- [x] Implementar lógica de exibição condicional (trial, assinante, não assinante)
- [x] Bloquear preço para não assinantes
- [x] Mostrar indicador de "Assine para ver preço"
- [x] Exibir fonte/loja original em destaque

## Comparador de Preços
- [x] Criar página de detalhes da oferta com comparador
- [x] Implementar lógica de busca de preços em outras lojas
- [x] Restringir acesso apenas para assinantes e usuários em trial
- [x] Exibir preços comparativos de forma visual

## Cron Job de Clonagem Automática
- [x] Configurar tarefa agendada para buscar ofertas periodicamente
- [x] Implementar lógica de clonagem automática sem intervenção manual
- [x] Adicionar notificações ao ADM quando novas ofertas são clonadas
- [x] Registrar histórico de execução do cron

## Estética Retrô-Futurista Anos 70
- [x] Definir paleta de cores (laranja queimado, marrom sépia, amarelo vibrante, creme)
- [x] Implementar gradiente de fundo suave
- [x] Adicionar tipografia bold e blocky em creme
- [x] Criar elementos geométricos abstratos (círculos, retângulos arredondados)
- [x] Aplicar efeito de profundidade e atmosfera nostálgica
- [x] Adicionar sombras sutis à tipografia
- [x] Implementar animações suaves retrô

## Notificações
- [x] Implementar sistema de notificações para o ADM
- [x] Notificar quando novas ofertas são clonadas
- [x] Mostrar alertas de erro em caso de falha na clonagem

## Testes e Validação
- [x] Testar sistema de trial (contador, expiração, device ID)
- [x] Testar parsers com diferentes formatos de origem
- [x] Testar integração Mercado Pago
- [x] Testar controle de acesso por tipo de usuário
- [x] Testar cron de clonagem automática
- [x] Validar responsividade em mobile e desktop

## Deploy e Entrega
- [x] Revisar todas as funcionalidades
- [x] Criar checkpoint final
- [x] Entregar projeto ao usuário
