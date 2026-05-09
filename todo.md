# App da Cidade - TODO

## Fase 1: Estrutura Base e Autenticação

- [x] Configurar banco de dados (MySQL com Drizzle ORM)
- [x] Criar tabelas: users, serviceProviders, plans, subscriptions, conversations, messages, ratings, paymentWebhooks
- [x] Implementar autenticação de usuário (Manus OAuth)
- [x] Criar funções de acesso ao banco de dados
- [x] Implementar routers tRPC

## Fase 2: Onboarding e Planos

- [x] Criar tela de escolha de plano (Básico vs Profissional)
- [ ] Integrar Mercado Pago (criar planos de assinatura)
- [ ] Criar tela de pagamento (cartão/Pix)
- [ ] Implementar lógica de cobrança automática (Plano Básico após 7 dias)
- [ ] Implementar webhooks do Mercado Pago
- [ ] Criar sistema de notificações push (dias 2, 5, 6, 7)
- [ ] Implementar retry automático em caso de falha de pagamento

## Fase 3: Cadastro de Prestador

- [ ] Criar tela de cadastro do prestador
- [ ] Implementar upload de fotos (máximo 5)
- [ ] Criar dropdown de categorias de serviço
- [ ] Implementar busca de endereço/bairro (integração com API de localização)
- [ ] Validar dados do formulário
- [ ] Salvar dados no banco de dados
- [ ] Publicar anúncio (ir ao ar)

## Fase 4: Busca e Descoberta (Cliente)

- [ ] Criar tela de busca por categoria
- [ ] Implementar filtro por bairro
- [ ] Criar lista de prestadores (FlatList com cards)
- [ ] Implementar busca por nome
- [ ] Adicionar ordenação (por avaliação, proximidade)
- [ ] Implementar paginação

## Fase 5: Perfil Público do Prestador

- [ ] Criar tela de perfil público
- [ ] Exibir fotos, descrição, endereço, categoria
- [ ] Mostrar avaliação média por estrelas
- [ ] Listar avaliações recentes
- [ ] Implementar botão de contato (WhatsApp para Básico, Chat para Profissional)
- [ ] Adicionar compartilhamento de perfil

## Fase 6: Chat Interno (Plano Profissional)

- [ ] Escolher serviço de chat (Firebase Firestore, SendBird ou StreamChat)
- [ ] Criar tela de lista de conversas
- [ ] Criar tela de conversa (enviar/receber mensagens)
- [ ] Implementar notificações push para novas mensagens
- [ ] Salvar histórico de conversas
- [ ] Implementar indicador de digitação
- [ ] Adicionar timestamp de mensagens

## Fase 7: Sistema de Avaliações

- [ ] Criar tela de avaliação pós-serviço
- [ ] Implementar seleção de estrelas (1-5)
- [ ] Adicionar campo de comentário
- [ ] Salvar avaliação no banco de dados
- [ ] Exibir avaliações no perfil do prestador
- [ ] Calcular média de avaliação

## Fase 8: Upgrade de Plano

- [ ] Criar tela de upgrade (Básico → Profissional)
- [ ] Implementar cálculo de diferença de preço (R$ 5,00)
- [ ] Integrar pagamento de upgrade com Mercado Pago
- [ ] Ativar chat após upgrade
- [ ] Atualizar status de assinatura

## Fase 9: Home do Prestador

- [ ] Criar tela home com resumo do plano
- [ ] Exibir estatísticas (visualizações, mensagens, avaliação)
- [ ] Botão de upgrade (se Básico)
- [ ] Atalhos para: Editar Perfil, Chat, Avaliações
- [ ] Mostrar status de teste (dias restantes)

## Fase 10: Retenção e Cancelamento

- [ ] Criar tela de cancelamento com contra-oferta
- [ ] Implementar dropdown de motivos
- [ ] Opção de pausar assinatura
- [ ] Implementar lógica de desconto (contra-oferta)
- [ ] Enviar email de confirmação de cancelamento

## Fase 11: Configurações e Perfil

- [ ] Criar tela de configurações
- [ ] Exibir dados da conta
- [ ] Mostrar plano ativo
- [ ] Implementar logout
- [ ] Adicionar opção de editar perfil

## Fase 12: Branding e Assets

- [x] Gerar logo do aplicativo
- [x] Criar splash screen
- [x] Configurar app.config.ts com nome e branding
- [x] Gerar ícones para Android/iOS

## Fase 13: Testes e Otimização

- [ ] Testar fluxos de pagamento
- [ ] Testar notificações push
- [ ] Testar chat em tempo real
- [ ] Otimizar performance (FlatList, lazy loading)
- [ ] Testar em iOS e Android
- [ ] Testar modo dark

## Fase 14: Deploy

- [ ] Gerar APK/IPA
- [ ] Publicar na App Store
- [ ] Publicar na Google Play
- [ ] Configurar CI/CD
