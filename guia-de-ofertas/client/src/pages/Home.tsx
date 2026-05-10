import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Lock, Zap } from "lucide-react";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [deviceId, setDeviceId] = useState<string>("");

  // Initialize device ID on first load
  useEffect(() => {
    const stored = localStorage.getItem("deviceId");
    if (stored) {
      setDeviceId(stored);
    } else {
      const newId = generateDeviceId();
      localStorage.setItem("deviceId", newId);
      setDeviceId(newId);
    }
  }, []);

  // Initialize trial when user logs in
  const initTrialMutation = trpc.trial.initializeTrial.useMutation();
  const trialStatusQuery = trpc.trial.getStatus.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const offersQuery = trpc.offers.list.useQuery();

  useEffect(() => {
    if (isAuthenticated && deviceId && !trialStatusQuery.data?.hasActiveTrial && !trialStatusQuery.data?.hasActiveSubscription) {
      initTrialMutation.mutate({ deviceId });
    }
  }, [isAuthenticated, deviceId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-900 via-amber-800 to-yellow-900">
        <Loader2 className="animate-spin w-12 h-12 text-yellow-300" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-900 via-amber-800 to-yellow-900 relative overflow-hidden">
        {/* Background geometric elements */}
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-yellow-400 opacity-10 blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full bg-orange-400 opacity-10 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-48 h-24 rounded-3xl bg-yellow-300 opacity-5 blur-2xl"></div>

        <div className="relative z-10 text-center max-w-2xl px-6">
          <h1 className="text-7xl font-black text-amber-50 mb-4 tracking-tight drop-shadow-lg">
            GUIA DE
            <span className="text-yellow-300 block">OFERTAS</span>
          </h1>
          <p className="text-2xl text-amber-100 mb-8 font-light tracking-wide">
            Descubra as melhores promoções da cidade
          </p>
          <Button
            onClick={() => setLocation(getLoginUrl())}
            size="lg"
            className="bg-yellow-400 hover:bg-yellow-300 text-orange-900 font-bold text-lg px-8 py-6 rounded-lg shadow-lg"
          >
            ENTRAR AGORA
          </Button>
        </div>
      </div>
    );
  }

  const trialStatus = trialStatusQuery.data;
  const offers = offersQuery.data || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-amber-800 to-yellow-900 relative overflow-hidden">
      {/* Background geometric elements */}
      <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-yellow-400 opacity-10 blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full bg-orange-400 opacity-10 blur-3xl"></div>
      <div className="absolute top-1/3 right-1/4 w-48 h-24 rounded-3xl bg-yellow-300 opacity-5 blur-2xl"></div>

      {/* Header */}
      <header className="relative z-10 border-b border-yellow-600 border-opacity-30 bg-orange-950 bg-opacity-50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-4xl font-black text-amber-50 tracking-tight">
            GUIA<span className="text-yellow-300">/</span>OFERTAS
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-amber-100 text-sm">{user?.name}</span>
            <Button variant="outline" size="sm" onClick={() => setLocation("/admin")}>
              Admin
            </Button>
          </div>
        </div>
      </header>

      {/* Trial Status Banner */}
      {trialStatus?.hasActiveTrial && (
        <div className="relative z-10 bg-yellow-400 bg-opacity-20 border-b-2 border-yellow-400 border-opacity-50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex items-center gap-3">
            <Zap className="w-5 h-5 text-yellow-300" />
            <span className="text-amber-50 font-bold">
              Teste grátis ativo! Faltam {trialStatus.daysRemaining} dias
            </span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-12">
        <div className="mb-12">
          <h2 className="text-5xl font-black text-amber-50 mb-2 tracking-tight drop-shadow-lg">
            OFERTAS
            <span className="text-yellow-300">/</span>QUENTES
          </h2>
          <p className="text-amber-100 text-lg font-light">
            {offers.length} promoções disponíveis
          </p>
        </div>

        {offers.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-amber-100 text-xl">Nenhuma oferta disponível no momento</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <Card
                key={offer.id}
                className="bg-orange-950 bg-opacity-60 backdrop-blur-sm border border-yellow-600 transition-all hover:shadow-xl hover:shadow-yellow-400/20 overflow-hidden group hover:border-yellow-400 cursor-pointer"
                onClick={() => setLocation(`/offer/${offer.id}`)}
              >
                {offer.image && (
                  <div className="relative h-48 overflow-hidden bg-orange-900">
                    <img
                      src={offer.image}
                      alt={offer.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                <div className="p-6">
                  <div className="mb-3">
                    <span className="inline-block bg-yellow-400 bg-opacity-20 text-yellow-300 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                      {offer.source}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-amber-50 mb-3 line-clamp-2 drop-shadow-lg">
                    {offer.title}
                  </h3>

                  <div className="flex items-center justify-between mb-4">
                    {!offer.isPreview && offer.price ? (
                      <div className="flex flex-col">
                        {offer.originalPrice && (
                          <span className="text-sm text-amber-200 line-through opacity-70">
                            R$ {parseFloat(offer.originalPrice.toString()).toFixed(2)}
                          </span>
                        )}
                        <span className="text-2xl font-black text-yellow-300">
                          R$ {parseFloat(offer.price?.toString() || "0").toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-amber-100">
                        <Lock className="w-4 h-4" />
                        <span className="text-sm font-bold">Assine para ver</span>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={() => setLocation(`/offer/${offer.id}`)}
                    className="w-full bg-yellow-400 hover:bg-yellow-300 text-orange-900 font-bold rounded-lg transition-all"
                  >
                    VER DETALHES
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* CTA for non-subscribers */}
      {!trialStatus?.hasActiveTrial && !trialStatus?.hasActiveSubscription && (
        <div className="relative z-10 container mx-auto px-4 py-12">
          <Card className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-opacity-20 backdrop-blur-sm border border-yellow-400 p-8 text-center">
            <h3 className="text-3xl font-black text-amber-50 mb-4">
              ACESSO COMPLETO
            </h3>
            <p className="text-amber-100 mb-6 text-lg">
              Assine agora e veja todos os preços + comparador de ofertas
            </p>
            <Button
              onClick={() => setLocation("/plans")}
              className="bg-yellow-400 hover:bg-yellow-300 text-orange-900 font-bold text-lg px-8 py-6 rounded-lg"
            >
              ESCOLHER PLANO
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}

function generateDeviceId(): string {
  // Simple device ID generation
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}`;
}
