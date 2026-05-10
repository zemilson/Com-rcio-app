import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useLocation } from "wouter";

export default function Plans() {
  const [, setLocation] = useLocation();

  const plans = [
    {
      name: "MENSAL",
      price: "5,90",
      period: "por mês",
      description: "Plano flexível",
      features: [
        "Acesso completo às ofertas",
        "Ver preços em tempo real",
        "Comparador de preços",
        "Notificações de novas ofertas",
        "Cancelar a qualquer momento",
      ],
      cta: "Assinar Agora",
      highlighted: false,
    },
    {
      name: "ANUAL",
      price: "50,00",
      period: "em 10x no cartão",
      description: "Melhor custo-benefício",
      features: [
        "Tudo do plano mensal",
        "Economia de até 70%",
        "Acesso prioritário a ofertas",
        "Suporte prioritário",
        "Garantia de satisfação",
      ],
      cta: "Assinar Agora",
      highlighted: true,
    },
  ];

  const handleSubscribe = (planType: "monthly" | "annual") => {
    // TODO: Integrar com Mercado Pago
    console.log(`Subscribing to ${planType} plan`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-amber-800 to-yellow-900 relative overflow-hidden">
      {/* Background geometric elements */}
      <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-yellow-400 opacity-10 blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full bg-orange-400 opacity-10 blur-3xl"></div>

      {/* Header */}
      <header className="relative z-10 border-b border-yellow-600 border-opacity-30 bg-orange-950 bg-opacity-50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="text-amber-50 hover:bg-yellow-400 hover:bg-opacity-20"
          >
            ← Voltar
          </Button>
          <h1 className="text-3xl font-black text-amber-50 tracking-tight">
            GUIA<span className="text-yellow-300">/</span>OFERTAS
          </h1>
          <div className="w-20"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black text-amber-50 mb-4 tracking-tight drop-shadow-lg">
            ESCOLHA SEU
            <span className="text-yellow-300 block">PLANO</span>
          </h2>
          <p className="text-amber-100 text-xl font-light">
            Desbloqueie todo o poder do Guia de Ofertas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {plans.map((plan, index) => (
            <Card
              key={index}
                className={`relative overflow-hidden border-2 transition-all ${
                plan.highlighted
                  ? "border-yellow-400 bg-gradient-to-br from-orange-900 to-amber-900 shadow-2xl shadow-yellow-400/30 scale-105"
                  : "border-yellow-600 bg-orange-950 bg-opacity-60 hover:border-yellow-400"
                } backdrop-blur-sm`}
            >
              {plan.highlighted && (
                <div className="absolute top-0 right-0 bg-yellow-400 text-orange-900 px-4 py-2 font-black text-sm">
                  MELHOR OFERTA
                </div>
              )}

              <div className="p-8">
                <h3 className="text-3xl font-black text-amber-50 mb-2 tracking-tight">
                  {plan.name}
                </h3>
                <p className="text-amber-100 text-sm mb-6">{plan.description}</p>

                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-yellow-300">
                      R$ {plan.price}
                    </span>
                    <span className="text-amber-100 font-light">{plan.period}</span>
                  </div>
                </div>

                <Button
                  onClick={() =>
                    handleSubscribe(plan.name === "MENSAL" ? "monthly" : "annual")
                  }
                  className={`w-full py-6 font-bold text-lg rounded-lg mb-8 transition-all ${
                    plan.highlighted
                      ? "bg-yellow-400 hover:bg-yellow-300 text-orange-900"
                      : "bg-yellow-400 hover:bg-yellow-300 text-orange-900"
                  }`}
                >
                  {plan.cta}
                </Button>

                <div className="space-y-4">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
                      <span className="text-amber-50 font-light">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-2xl mx-auto">
          <h3 className="text-3xl font-black text-amber-50 mb-8 text-center tracking-tight">
            DÚVIDAS
            <span className="text-yellow-300">?</span>
          </h3>

          <div className="space-y-6">
            {[
              {
                q: "Posso cancelar a qualquer momento?",
                a: "Sim! Você pode cancelar sua assinatura a qualquer momento sem penalidades.",
              },
              {
                q: "Qual é a diferença entre os planos?",
                a: "O plano mensal oferece flexibilidade, enquanto o anual oferece economia de até 70% com acesso prioritário.",
              },
              {
                q: "Como funciona o pagamento?",
                a: "Usamos o Mercado Pago para processar pagamentos de forma segura e rápida.",
              },
            ].map((item, idx) => (
              <Card
                key={idx}
                className="bg-orange-950 bg-opacity-60 backdrop-blur-sm border border-yellow-600 border-opacity-30 p-6"
              >
                <h4 className="text-lg font-black text-yellow-300 mb-3">
                  {item.q}
                </h4>
                <p className="text-amber-100 font-light">{item.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
