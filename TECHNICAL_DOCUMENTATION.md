# App da Cidade - Documentação Técnica Completa

## Índice

1. [Visão Geral da Arquitetura](#visão-geral-da-arquitetura)
2. [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
3. [Integração com Mercado Pago](#integração-com-mercado-pago)
4. [Fluxo de Pagamento Detalhado](#fluxo-de-pagamento-detalhado)
5. [API tRPC](#api-trpc)
6. [Autenticação e Autorização](#autenticação-e-autorização)
7. [Sistema de Chat](#sistema-de-chat)
8. [Notificações Push](#notificações-push)
9. [Estratégia de Retenção](#estratégia-de-retenção)
10. [Custos Estimados](#custos-estimados)
11. [Checklist de Desenvolvimento MVP](#checklist-de-desenvolvimento-mvp)
12. [Deployment e CI/CD](#deployment-e-cicd)

---

## Visão Geral da Arquitetura

### Stack Tecnológico

| Componente | Tecnologia | Motivo |
|-----------|-----------|--------|
| **Frontend Mobile** | React Native + Expo | Cross-platform, rápido desenvolvimento |
| **Framework** | Expo Router | Roteamento nativo e web |
| **Styling** | NativeWind (Tailwind CSS) | Desenvolvimento ágil, consistência |
| **Backend** | Node.js + Express | Leve, escalável, JavaScript full-stack |
| **API** | tRPC | Type-safe, sem necessidade de REST |
| **Banco de Dados** | MySQL + Drizzle ORM | Relacional, confiável, low-cost |
| **Autenticação** | Manus OAuth | Integrado, seguro |
| **Pagamento** | Mercado Pago API | Suporta cartão e Pix, webhook |
| **Chat** | Firebase Firestore (futuro) | Real-time, escalável |
| **Notificações** | Expo Notifications + Firebase Cloud Messaging | Push notifications nativas |
| **Storage** | S3 (Manus) | Upload de fotos dos prestadores |

### Arquitetura em Camadas

```
┌─────────────────────────────────────────────────────────┐
│                    MOBILE APP (Expo)                     │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  Screens (Home, Search, Profile, Chat, etc.)        │ │
│  │  Components (Cards, Buttons, Forms)                 │ │
│  │  Hooks (useAuth, useColors, custom hooks)           │ │
│  └─────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  tRPC Client (lib/trpc.ts)                          │ │
│  │  React Query (data fetching)                        │ │
│  │  AsyncStorage (local persistence)                  │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          ↕ HTTP/WebSocket
┌─────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js)                     │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  tRPC Router (server/routers.ts)                    │ │
│  │  - Service Providers                                │ │
│  │  - Plans & Subscriptions                            │ │
│  │  - Chat & Messages                                  │ │
│  │  - Ratings                                          │ │
│  └─────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  Database Layer (server/db.ts)                      │ │
│  │  Drizzle ORM + MySQL                                │ │
│  └─────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  External Integrations                              │ │
│  │  - Mercado Pago API (webhooks)                      │ │
│  │  - Firebase Firestore (chat)                        │ │
│  │  - FCM (push notifications)                         │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────┐
│                    DATABASE (MySQL)                      │
│  users | serviceProviders | plans | subscriptions |     │
│  conversations | messages | ratings | paymentWebhooks   │
└─────────────────────────────────────────────────────────┘
```

---

## Estrutura do Banco de Dados

### Tabelas Principais

#### 1. **users** (Autenticação)
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  openId VARCHAR(64) UNIQUE NOT NULL,
  name TEXT,
  email VARCHAR(320),
  loginMethod VARCHAR(64),
  role ENUM('user', 'admin') DEFAULT 'user',
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE CURRENT_TIMESTAMP,
  lastSignedIn TIMESTAMP DEFAULT NOW()
);
```

#### 2. **serviceProviders** (Perfil do Prestador)
```sql
CREATE TABLE serviceProviders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  address VARCHAR(255) NOT NULL,
  neighborhood VARCHAR(100) NOT NULL,
  whatsapp VARCHAR(20) NOT NULL,
  photos JSON DEFAULT '[]',
  averageRating DECIMAL(3,2) DEFAULT 0,
  totalRatings INT DEFAULT 0,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

#### 3. **plans** (Planos de Assinatura)
```sql
CREATE TABLE plans (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  trialDays INT DEFAULT 0,
  features JSON DEFAULT '[]',
  createdAt TIMESTAMP DEFAULT NOW()
);

-- Seed data
INSERT INTO plans (name, price, trialDays, features) VALUES
('Básico', 5.00, 7, '["Perfil com fotos", "Chat via WhatsApp", "Avaliações"]'),
('Profissional', 10.00, 0, '["Tudo do Básico", "Chat interno", "Notificações push", "Histórico de conversas"]');
```

#### 4. **subscriptions** (Assinaturas de Usuários)
```sql
CREATE TABLE subscriptions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  planId INT NOT NULL,
  status ENUM('active', 'trial', 'canceled', 'paused') DEFAULT 'trial',
  mercadoPagoSubscriptionId VARCHAR(255),
  startDate TIMESTAMP DEFAULT NOW(),
  trialEndDate TIMESTAMP,
  nextBillingDate TIMESTAMP,
  canceledAt TIMESTAMP,
  paymentMethod VARCHAR(50),
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (planId) REFERENCES plans(id)
);
```

#### 5. **conversations** (Chat)
```sql
CREATE TABLE conversations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  clientUserId INT NOT NULL,
  providerUserId INT NOT NULL,
  serviceProviderId INT NOT NULL,
  lastMessageAt TIMESTAMP DEFAULT NOW(),
  createdAt TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (clientUserId) REFERENCES users(id),
  FOREIGN KEY (providerUserId) REFERENCES users(id),
  FOREIGN KEY (serviceProviderId) REFERENCES serviceProviders(id)
);
```

#### 6. **messages** (Mensagens de Chat)
```sql
CREATE TABLE messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  conversationId INT NOT NULL,
  senderId INT NOT NULL,
  content TEXT NOT NULL,
  isRead BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (conversationId) REFERENCES conversations(id),
  FOREIGN KEY (senderId) REFERENCES users(id)
);
```

#### 7. **ratings** (Avaliações)
```sql
CREATE TABLE ratings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  serviceProviderId INT NOT NULL,
  clientUserId INT NOT NULL,
  stars INT NOT NULL,
  comment TEXT,
  createdAt TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (serviceProviderId) REFERENCES serviceProviders(id),
  FOREIGN KEY (clientUserId) REFERENCES users(id)
);
```

#### 8. **paymentWebhooks** (Log de Webhooks)
```sql
CREATE TABLE paymentWebhooks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  subscriptionId INT,
  event VARCHAR(100) NOT NULL,
  payload JSON,
  processed BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (subscriptionId) REFERENCES subscriptions(id)
);
```

---

## Integração com Mercado Pago

### Configuração Inicial

1. **Criar Conta Mercado Pago**
   - Acessar https://www.mercadopago.com.br/developers
   - Criar aplicação
   - Obter `ACCESS_TOKEN` e `PUBLIC_KEY`

2. **Variáveis de Ambiente**
```bash
MERCADO_PAGO_ACCESS_TOKEN=APP_USR_xxxxxxxxxxxxxxxxxxxx
MERCADO_PAGO_PUBLIC_KEY=APP_USR_xxxxxxxxxxxxxxxxxxxx
MERCADO_PAGO_WEBHOOK_SECRET=seu_webhook_secret
```

### Fluxo de Pagamento Detalhado

#### Plano Básico (7 dias grátis, depois R$ 5,00/mês)

```
1. Usuário seleciona "Plano Básico"
   ↓
2. Insere dados de cartão/Pix
   ↓
3. Backend cria assinatura no Mercado Pago com:
   - reason: "App da Cidade - Plano Básico"
   - auto_recurring: {
       frequency: 1,
       frequency_type: "months",
       transaction_amount: 5.00,
       currency_id: "BRL"
     }
   - first_invoice_offset: 7 (dias de teste)
   - payer: { email: user.email }
   ↓
4. Mercado Pago retorna subscription_id
   ↓
5. Backend salva em subscriptions:
   - status: "trial"
   - mercadoPagoSubscriptionId: subscription_id
   - trialEndDate: NOW() + 7 dias
   - nextBillingDate: NOW() + 7 dias
   ↓
6. Dia 2: Enviar notificação "Seu anúncio teve X visualizações"
   ↓
7. Dia 5: Enviar notificação "Seu teste termina em 2 dias"
   ↓
8. Dia 6: Enviar notificação "Última chance! Amanhã será cobrado R$ 5,00"
   ↓
9. Dia 7: Mercado Pago cobra automaticamente
   - Webhook: payment.created
   - Backend atualiza status para "active"
   ↓
10. Se cartão falhar:
    - Tentativa 1 (Dia 7)
    - Tentativa 2 (Dia 8)
    - Tentativa 3 (Dia 9)
    - Se todas falharem: status = "canceled"
```

#### Plano Profissional (Cobrança imediata, R$ 10,00/mês)

```
1. Usuário seleciona "Plano Profissional"
   ↓
2. Insere dados de cartão/Pix
   ↓
3. Backend cria assinatura no Mercado Pago com:
   - reason: "App da Cidade - Plano Profissional"
   - auto_recurring: {
       frequency: 1,
       frequency_type: "months",
       transaction_amount: 10.00,
       currency_id: "BRL"
     }
   - first_invoice_offset: 0 (cobrança imediata)
   - payer: { email: user.email }
   ↓
4. Mercado Pago cobra imediatamente
   ↓
5. Webhook: payment.created
   ↓
6. Backend atualiza status para "active"
   ↓
7. Chat é ativado imediatamente
```

### Implementação do Webhook

```typescript
// server/_core/index.ts (Express route)
app.post('/api/webhooks/mercado-pago', async (req, res) => {
  const { id, type, data } = req.body;

  // Validar assinatura do webhook
  const signature = req.headers['x-signature'];
  if (!validateSignature(signature, req.body)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Salvar webhook para processamento
  await db.createPaymentWebhook({
    event: type,
    payload: data,
    processed: false,
  });

  // Processar imediatamente
  if (type === 'payment.created') {
    const payment = await mercadoPago.payment.get(data.id);
    const subscription = await db.getSubscriptionByMercadoPagoId(payment.subscription_id);
    
    if (subscription) {
      await db.updateSubscription(subscription.id, {
        status: 'active',
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      
      // Enviar notificação ao usuário
      await sendPushNotification(subscription.userId, {
        title: 'Pagamento confirmado',
        body: 'Seu plano está ativo!',
      });
    }
  }

  res.json({ success: true });
});
```

### Upgrade de Plano (Básico → Profissional)

```
1. Usuário em Plano Básico clica "Fazer Upgrade"
   ↓
2. Calcula diferença: R$ 10,00 - R$ 5,00 = R$ 5,00
   ↓
3. Insere dados de cartão/Pix
   ↓
4. Backend cria novo pagamento único de R$ 5,00
   ↓
5. Se sucesso:
   - Cancela assinatura anterior
   - Cria nova assinatura Profissional
   - Ativa chat
```

---

## Fluxo de Pagamento Detalhado

### JSON do Webhook Mercado Pago

```json
{
  "id": "123456789",
  "type": "payment.created",
  "data": {
    "id": "payment_id_123",
    "subscription_id": "sub_123",
    "status": "approved",
    "status_detail": "accredited",
    "transaction_amount": 5.00,
    "currency_id": "BRL",
    "payer": {
      "id": "user_id",
      "email": "user@example.com"
    },
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### Tratamento de Falhas

```typescript
// Retry automático
async function processFailedPayments() {
  const failedSubscriptions = await db.query(
    "SELECT * FROM subscriptions WHERE status = 'failed' AND retryCount < 3"
  );

  for (const sub of failedSubscriptions) {
    try {
      const result = await mercadoPago.subscription.retry(sub.mercadoPagoSubscriptionId);
      if (result.status === 'active') {
        await db.updateSubscription(sub.id, { status: 'active', retryCount: 0 });
      }
    } catch (error) {
      await db.updateSubscription(sub.id, { retryCount: sub.retryCount + 1 });
    }
  }
}

// Executar a cada 6 horas
setInterval(processFailedPayments, 6 * 60 * 60 * 1000);
```

---

## API tRPC

### Endpoints Disponíveis

#### Service Providers
- `serviceProviders.search` - Buscar prestadores (público)
- `serviceProviders.getById` - Obter prestador por ID (público)
- `serviceProviders.getByUserId` - Obter perfil do usuário (protegido)
- `serviceProviders.create` - Criar perfil (protegido)
- `serviceProviders.update` - Atualizar perfil (protegido)

#### Plans
- `plans.list` - Listar planos (público)
- `plans.getById` - Obter plano por ID (público)

#### Subscriptions
- `subscriptions.getCurrent` - Obter assinatura atual (protegido)
- `subscriptions.create` - Criar assinatura (protegido)
- `subscriptions.update` - Atualizar assinatura (protegido)

#### Chat
- `conversations.list` - Listar conversas (protegido)
- `conversations.getById` - Obter conversa (protegido)
- `conversations.create` - Criar conversa (protegido)
- `messages.getConversationMessages` - Obter mensagens (protegido)
- `messages.send` - Enviar mensagem (protegido)

#### Ratings
- `ratings.getServiceProviderRatings` - Obter avaliações (público)
- `ratings.create` - Criar avaliação (protegido)

### Exemplo de Uso no Frontend

```typescript
import { trpc } from '@/lib/trpc';

// Query
const { data: providers } = trpc.serviceProviders.search.useQuery({
  category: 'Eletricista',
  neighborhood: 'Centro',
});

// Mutation
const createMutation = trpc.serviceProviders.create.useMutation({
  onSuccess: () => {
    console.log('Perfil criado com sucesso!');
  },
});

await createMutation.mutateAsync({
  category: 'Eletricista',
  description: 'Eletricista com 10 anos de experiência',
  address: 'Rua das Flores, 123',
  neighborhood: 'Centro',
  whatsapp: '11999999999',
  photos: ['url1', 'url2'],
});
```

---

## Autenticação e Autorização

### Fluxo OAuth (Manus)

```
1. Usuário toca "Login"
   ↓
2. WebBrowser.openAuthSessionAsync() abre Manus OAuth
   ↓
3. Usuário faz login
   ↓
4. Redirect para app://oauth/callback?code=xxx
   ↓
5. Backend troca código por token
   ↓
6. Token armazenado em SecureStore (iOS/Android)
   ↓
7. Usuário autenticado
```

### Proteção de Rotas

```typescript
// Rota pública (qualquer um pode acessar)
export const publicProcedure = t.procedure;

// Rota protegida (requer autenticação)
export const protectedProcedure = t.procedure.use(async (opts) => {
  if (!opts.ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return opts.next({ ctx: { user: opts.ctx.user } });
});
```

---

## Sistema de Chat

### Opções de Implementação

#### Opção 1: Firebase Firestore (Recomendado)
- **Vantagens:** Real-time, escalável, sem servidor
- **Custo:** ~$1-5/mês para MVP
- **Implementação:** 2-3 dias

```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, onSnapshot } from 'firebase/firestore';

const db = getFirestore();

// Enviar mensagem
await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
  senderId: userId,
  content: text,
  createdAt: new Date(),
});

// Escutar mensagens em tempo real
onSnapshot(
  collection(db, 'conversations', conversationId, 'messages'),
  (snapshot) => {
    const messages = snapshot.docs.map(doc => doc.data());
  }
);
```

#### Opção 2: Socket.io (Alternativa)
- **Vantagens:** Controle total, customizável
- **Custo:** ~$10-20/mês (servidor dedicado)
- **Implementação:** 3-4 dias

#### Opção 3: Banco de dados com polling
- **Vantagens:** Simples, sem dependências externas
- **Custo:** Incluído no servidor
- **Limitações:** Menos eficiente em tempo real

---

## Notificações Push

### Configuração Expo Notifications

```typescript
import * as Notifications from 'expo-notifications';

// Pedir permissão
const { status } = await Notifications.requestPermissionsAsync();

// Registrar para receber notificações
const token = (await Notifications.getExpoPushTokenAsync()).data;

// Enviar notificação
await Notifications.scheduleNotificationAsync({
  content: {
    title: 'Você recebeu uma mensagem',
    body: 'Novo cliente tentando contatar',
    sound: 'default',
  },
  trigger: { seconds: 2 },
});
```

### Webhook para Notificações

```typescript
// Quando receber mensagem nova
app.post('/api/messages/new', async (req, res) => {
  const { conversationId, senderId, content } = req.body;

  // Obter usuário destinatário
  const conversation = await db.getConversationById(conversationId);
  const recipientId = conversation.clientUserId === senderId 
    ? conversation.providerUserId 
    : conversation.clientUserId;

  // Enviar notificação push
  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: recipientToken,
      title: 'Mensagem nova',
      body: content.substring(0, 100),
      data: { conversationId },
    }),
  });

  res.json({ success: true });
});
```

---

## Estratégia de Retenção

### Comunicação Automática

| Dia | Evento | Mensagem | Objetivo |
|-----|--------|----------|----------|
| 2 | Teste ativo | "Seu anúncio já teve X visualizações" | Engajamento |
| 5 | Teste ativo | "Seu teste termina em 2 dias" | Aviso |
| 6 | Teste ativo | "Última chance! Amanhã será cobrado R$ 5,00" | Urgência |
| 7 | Cobrança | "Cobrança confirmada. Seu plano está ativo" | Confirmação |
| Falha | Pagamento falho | "Falha na cobrança. Tente novamente" (3x) | Retenção |

### Tela de Cancelamento

```typescript
// Quando usuário clica "Cancelar"
1. Mostrar modal com opções:
   - "Por quê está cancelando?" (dropdown)
   - "Pausar ao invés de cancelar" (botão)
   - "Receber 50% de desconto no próximo mês" (contra-oferta)

2. Se aceitar contra-oferta:
   - Aplicar desconto
   - Renovar assinatura
   - Enviar email de confirmação

3. Se cancelar:
   - Atualizar status para "canceled"
   - Enviar email de confirmação
   - Oferecer reativação fácil
```

---

## Custos Estimados

### Mensais (MVP)

| Serviço | Custo | Observações |
|---------|-------|-------------|
| **Servidor (Node.js)** | $5-10 | Heroku/Railway/Render |
| **Banco de Dados MySQL** | $5-15 | PlanetScale/AWS RDS |
| **Mercado Pago** | 0% | Apenas taxa de transação (2,99% + R$ 0,30) |
| **Firebase Firestore** | $1-5 | Real-time chat |
| **Firebase Cloud Messaging** | Grátis | Push notifications |
| **S3 Storage** | $1-3 | Fotos dos prestadores |
| **Domínio** | $1-2 | .com.br |
| **SSL Certificate** | Grátis | Let's Encrypt |
| **Monitoramento** | $0-5 | Sentry/LogRocket |
| **Total** | **$13-40/mês** | Escalável conforme crescimento |

### Primeira Vez (Setup)

| Item | Custo |
|------|-------|
| Conta Mercado Pago | Grátis |
| Firebase Project | Grátis |
| Domínio (1 ano) | R$ 30-50 |
| Certificado SSL | Grátis |
| **Total** | **R$ 30-50** |

### Receita Esperada (Exemplo)

```
Cenário: 100 prestadores ativos

Plano Básico: 60 prestadores × R$ 5,00 = R$ 300,00
Plano Profissional: 40 prestadores × R$ 10,00 = R$ 400,00
Receita Bruta: R$ 700,00

Taxas Mercado Pago (2,99% + R$ 0,30): ~R$ 25,00
Receita Líquida: R$ 675,00

Custos Operacionais: ~R$ 30,00
Lucro: R$ 645,00/mês
```

---

## Checklist de Desenvolvimento MVP

### Semana 1: Fundação

- [x] Configurar banco de dados
- [x] Criar tabelas (schema)
- [x] Implementar autenticação OAuth
- [x] Criar routers tRPC básicos
- [x] Tela de onboarding
- [x] Tela de escolha de plano

### Semana 2: Pagamento e Cadastro

- [ ] Integrar Mercado Pago API
- [ ] Implementar webhook de pagamento
- [ ] Criar tela de pagamento
- [ ] Tela de cadastro do prestador
- [ ] Upload de fotos (S3)
- [ ] Validação de formulários

### Semana 3: Busca e Perfil

- [ ] Tela de busca (cliente)
- [ ] Filtros por categoria/bairro
- [ ] Tela de perfil público
- [ ] Sistema de avaliações (estrelas)
- [ ] Botão de contato (WhatsApp/Chat)

### Semana 4: Chat e Notificações

- [ ] Integrar Firebase Firestore
- [ ] Tela de lista de conversas
- [ ] Tela de conversa (chat)
- [ ] Notificações push
- [ ] Histórico de mensagens

### Semana 5: Upgrade e Retenção

- [ ] Tela de upgrade (Básico → Profissional)
- [ ] Lógica de upgrade (diferença de preço)
- [ ] Tela de cancelamento
- [ ] Contra-ofertas
- [ ] Comunicação automática (emails/push)

### Semana 6: Testes e Otimização

- [ ] Testes unitários (vitest)
- [ ] Testes de integração
- [ ] Testes de pagamento (sandbox Mercado Pago)
- [ ] Otimização de performance
- [ ] Testes em iOS/Android

### Semana 7: Deploy

- [ ] Preparar para production
- [ ] Configurar CI/CD
- [ ] Build APK/IPA
- [ ] Publicar na App Store
- [ ] Publicar na Google Play

---

## Deployment e CI/CD

### Variáveis de Ambiente (Production)

```bash
# Backend
DATABASE_URL=mysql://user:pass@host:3306/app_da_cidade
MERCADO_PAGO_ACCESS_TOKEN=APP_USR_xxxxxxxxxxxxxxxxxxxx
MERCADO_PAGO_PUBLIC_KEY=APP_USR_xxxxxxxxxxxxxxxxxxxx
FIREBASE_PROJECT_ID=app-da-cidade
FIREBASE_PRIVATE_KEY=...
NODE_ENV=production

# Frontend (app.config.ts)
EXPO_PUBLIC_API_URL=https://api.appdacidade.com.br
EXPO_PUBLIC_FIREBASE_CONFIG=...
```

### GitHub Actions CI/CD

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run tests
        run: pnpm test
      
      - name: Build backend
        run: pnpm build
      
      - name: Deploy to production
        run: |
          git push heroku main
```

### Build APK/IPA

```bash
# iOS
eas build --platform ios --auto-submit

# Android
eas build --platform android

# Web
expo export:web
```

---

## Sugestões de Nomes Alternativos

| Nome | Descrição |
|------|-----------|
| **App da Cidade** | Atual - simples e direto |
| **Serviços Locais** | Mais descritivo |
| **Vizinhos** | Mais amigável, comunitário |
| **Profissional Local** | B2B oriented |
| **Conecta Cidade** | Foco em conexão |
| **Prestador** | Simples, direto |

---

## Próximos Passos

1. **Implementar tela de pagamento** com Mercado Pago
2. **Criar tela de cadastro** do prestador
3. **Implementar busca** e filtros
4. **Integrar Firebase** para chat
5. **Configurar notificações push**
6. **Testes e otimização**
7. **Deploy em production**

---

## Contato e Suporte

Para dúvidas sobre a implementação, consulte:
- Documentação Expo: https://docs.expo.dev
- Documentação Mercado Pago: https://developers.mercadopago.com.br
- Documentação tRPC: https://trpc.io
- Documentação Drizzle: https://orm.drizzle.team

