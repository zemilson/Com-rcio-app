# App da Cidade - Design de Interface Mobile

## Visão Geral

O **App da Cidade** é um diretório local de serviços que conecta prestadores de serviço com clientes. A interface deve ser intuitiva, seguir os padrões iOS (HIG), e suportar dois modelos de negócio: Plano Básico (com chat via WhatsApp) e Plano Profissional (com chat interno).

**Orientação:** Portrait (9:16) | **Uso:** Uma mão | **Plataforma:** iOS-first design

---

## Paleta de Cores

| Elemento | Cor | Uso |
|----------|-----|-----|
| **Primary** | #0a7ea4 (Azul) | Botões CTA, destaques, links |
| **Success** | #22C55E (Verde) | Status ativo, confirmações |
| **Warning** | #F59E0B (Laranja) | Avisos, período de teste |
| **Error** | #EF4444 (Vermelho) | Erros, cancelamento |
| **Background** | #ffffff (Branco) | Fundo principal |
| **Surface** | #f5f5f5 (Cinza claro) | Cards, superfícies |
| **Foreground** | #11181C (Cinza escuro) | Texto principal |
| **Muted** | #687076 (Cinza médio) | Texto secundário |
| **Border** | #E5E7EB (Cinza claro) | Divisores |

---

## Lista de Telas

### 1. **Tela de Onboarding / Escolha de Plano**
   - Apresenta os dois planos (Básico e Profissional)
   - Mostra benefícios e preços
   - Botões de ação: "Começar com Plano Básico" e "Começar com Plano Profissional"

### 2. **Tela de Pagamento**
   - Formulário de dados do cartão ou Pix
   - Informações do plano selecionado
   - Confirmação de cobrança
   - Suporte a Mercado Pago

### 3. **Tela de Cadastro do Prestador**
   - Nome completo
   - Categoria de serviço (dropdown)
   - Descrição do serviço
   - Endereço / Bairro
   - WhatsApp para contato
   - Upload de fotos (máximo 5)
   - Botão "Publicar Anúncio"

### 4. **Tela Home (Prestador)**
   - Resumo do plano ativo
   - Estatísticas: visualizações, mensagens, avaliação
   - Botão de upgrade (se em Plano Básico)
   - Atalhos para: Editar Perfil, Chat (se Profissional), Avaliações

### 5. **Tela de Busca (Cliente)**
   - Campo de busca por categoria
   - Filtro por bairro
   - Lista de prestadores (cards com foto, nome, categoria, avaliação)
   - Tap para abrir perfil

### 6. **Tela de Perfil Público (Prestador)**
   - Foto de perfil
   - Nome, categoria, descrição
   - Endereço / Bairro
   - Avaliação por estrelas (média)
   - Botão de contato: "Enviar Mensagem" (Profissional) ou "Chamar no WhatsApp" (Básico)
   - Lista de avaliações recentes

### 7. **Tela de Chat (Plano Profissional)**
   - Lista de conversas ativas
   - Timestamp da última mensagem
   - Notificação de mensagens não lidas
   - Tap para abrir conversa

### 8. **Tela de Conversa (Chat)**
   - Histórico de mensagens
   - Campo de input para nova mensagem
   - Botão de envio
   - Timestamp de cada mensagem

### 9. **Tela de Avaliações (Prestador)**
   - Histórico de avaliações recebidas
   - Estrelas e comentários
   - Média geral de avaliação

### 10. **Tela de Upgrade**
   - Resumo do plano atual (Básico)
   - Benefícios do Plano Profissional
   - Diferença de preço a pagar (R$ 5,00)
   - Botão "Fazer Upgrade"

### 11. **Tela de Cancelamento (Retenção)**
   - Motivo do cancelamento (dropdown)
   - Mensagem de contra-oferta
   - Opção de pausar ao invés de cancelar
   - Botão "Cancelar" e "Voltar"

### 12. **Tela de Configurações**
   - Dados da conta
   - Plano ativo
   - Opção de cancelamento
   - Logout

---

## Fluxos de Usuário Principais

### Fluxo 1: Novo Prestador - Plano Básico
1. Usuário abre o app
2. Vê tela de escolha de plano
3. Clica em "Começar com Plano Básico" (7 dias grátis)
4. Insere dados de pagamento (cartão/Pix)
5. Preenche cadastro do serviço
6. Anúncio vai ao ar
7. **Dia 7:** Cobrança automática de R$ 5,00
8. Se cartão falhar: 3 tentativas com avisos

### Fluxo 2: Novo Prestador - Plano Profissional
1. Usuário abre o app
2. Vê tela de escolha de plano
3. Clica em "Começar com Plano Profissional"
4. Insere dados de pagamento (cartão/Pix)
5. **Cobrança imediata:** R$ 10,00
6. Preenche cadastro do serviço
7. Anúncio vai ao ar com chat ativo

### Fluxo 3: Cliente - Buscar Serviço
1. Usuário abre o app
2. Vê tela de busca
3. Busca por categoria (ex: "Eletricista")
4. Filtra por bairro
5. Vê lista de prestadores
6. Clica em um prestador
7. Vê perfil público com avaliações
8. Clica em "Chamar no WhatsApp" (Básico) ou "Enviar Mensagem" (Profissional)

### Fluxo 4: Upgrade de Plano
1. Prestador em Plano Básico vê botão de upgrade
2. Clica em "Fazer Upgrade"
3. Vê tela de upgrade com diferença de R$ 5,00
4. Confirma pagamento
5. Plano atualizado para Profissional
6. Chat ativado

### Fluxo 5: Avaliação Pós-Serviço
1. Cliente recebe notificação: "Avalie o prestador"
2. Clica em "Avaliar"
3. Seleciona número de estrelas (1-5)
4. Escreve comentário (opcional)
5. Clica em "Enviar Avaliação"
6. Avaliação aparece no perfil do prestador

---

## Componentes Essenciais

### Componentes Reutilizáveis
- **Button**: Primário, secundário, outline
- **Card**: Prestador, avaliação, conversa
- **Input**: Texto, email, telefone
- **Rating**: Exibição de estrelas (1-5)
- **Badge**: Status (ativo, teste, profissional)
- **Modal**: Confirmações, alertas
- **Toast**: Notificações rápidas
- **Loader**: Indicador de carregamento
- **Empty State**: Quando não há dados

### Padrões de Interação
- **Tap feedback:** Escala 0.97 + haptic leve
- **Swipe:** Deslizar para deletar (conversas)
- **Pull-to-refresh:** Atualizar lista de prestadores
- **Bottom sheet:** Filtros, ações adicionais

---

## Comunicação Automática (Push/Email)

| Dia | Mensagem | Objetivo |
|-----|----------|----------|
| **2** | "Seu anúncio já teve X visualizações" | Engajamento |
| **5** | "Seu teste termina em 2 dias" | Aviso |
| **6** | "Última chance! Amanhã será cobrado R$ 5,00" | Urgência |
| **7** | "Cobrança confirmada. Seu plano está ativo" | Confirmação |
| **Falha de cartão** | "Falha na cobrança. Tente novamente" (3x) | Retenção |

---

## Estratégia de Retenção

1. **Tela de Cancelamento com Contra-oferta**
   - Perguntar motivo do cancelamento
   - Oferecer desconto (ex: 50% no próximo mês)
   - Opção de pausar ao invés de cancelar

2. **Notificações Proativas**
   - "Você recebeu uma nova mensagem"
   - "Seu serviço foi visualizado X vezes"
   - "Avaliação positiva recebida!"

3. **Gamificação**
   - Mostrar ranking de prestadores por avaliação
   - Badges por número de serviços completados

---

## Notas de Design

- **Tipografia:** SF Pro Display (iOS) / Roboto (Android)
- **Ícones:** Material Icons mapeados para SF Symbols
- **Espaçamento:** 8px base (múltiplos de 8)
- **Raio de borda:** 12px para cards, 24px para botões
- **Sombra:** Leve (iOS style)
- **Dark mode:** Suportado automaticamente via CSS variables
