import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ExternalLink, TrendingDown } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function OfferDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const offersQuery = trpc.offers.list.useQuery();
  const trialStatusQuery = trpc.trial.getStatus.useQuery(undefined, {
    enabled: !!user,
  });

  const offer = offersQuery.data?.find((o) => o.id === parseInt(id || "0"));
  const trialStatus = trialStatusQuery.data;
  const canSeePrice =
    trialStatus?.hasActiveTrial || trialStatus?.hasActiveSubscription;

  if (!offer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-900 via-amber-800 to-yellow-900 flex items-center justify-center">
        <Card className="bg-orange-950 bg-opacity-60 backdrop-blur-sm border border-yellow-600 p-8 text-center">
          <p className="text-amber-100">Oferta não encontrada</p>
          <Button
            onClick={() => setLocation("/")}
            className="mt-4 bg-yellow-400 hover:bg-yellow-300 text-orange-900 font-bold"
          >
            Voltar
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-amber-800 to-yellow-900 relative overflow-hidden">
      <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-yellow-400 opacity-10 blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full bg-orange-400 opacity-10 blur-3xl"></div>

      {/* Header */}
      <header className="relative z-10 border-b border-yellow-600 border-opacity-30 bg-orange-950 bg-opacity-50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="text-amber-50 hover:bg-yellow-400 hover:bg-opacity-20 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Offer Details */}
          <div className="lg:col-span-2">
            <Card className="bg-orange-950 bg-opacity-60 backdrop-blur-sm border border-yellow-600 overflow-hidden">
              {offer.image && (
                <div className="relative h-96 overflow-hidden bg-orange-900">
                  <img
                    src={offer.image}
                    alt={offer.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-8">
                <div className="mb-6">
                  <span className="inline-block bg-yellow-400 bg-opacity-20 text-yellow-300 px-4 py-2 rounded-full text-sm font-bold tracking-wide mb-4">
                    {offer.source}
                  </span>
                </div>

                <h1 className="text-4xl font-black text-amber-50 mb-4 tracking-tight drop-shadow-lg">
                  {offer.title}
                </h1>

                {offer.description && (
                  <p className="text-amber-100 text-lg mb-8 leading-relaxed">
                    {offer.description}
                  </p>
                )}

                {/* Price Section */}
                <Card className="bg-orange-900 bg-opacity-50 border border-yellow-600 border-opacity-30 p-6 mb-8">
                  <h2 className="text-xl font-black text-yellow-300 mb-4">
                    PREÇO
                  </h2>

                  {canSeePrice ? (
                    <div className="flex items-baseline gap-4">
                      {offer.originalPrice && (
                        <span className="text-xl text-amber-200 line-through opacity-70">
                          R$ {parseFloat(offer.originalPrice.toString()).toFixed(2)}
                        </span>
                      )}
                      <span className="text-5xl font-black text-yellow-300">
                        R$ {parseFloat(offer.price?.toString() || "0").toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <div className="bg-orange-950 bg-opacity-50 border border-yellow-600 border-opacity-30 p-4 rounded-lg text-center">
                      <p className="text-amber-100 font-bold mb-4">
                        Assine para ver o preço
                      </p>
                      <Button
                        onClick={() => setLocation("/plans")}
                        className="bg-yellow-400 hover:bg-yellow-300 text-orange-900 font-bold"
                      >
                        Escolher Plano
                      </Button>
                    </div>
                  )}
                </Card>

                {/* Original URL */}
                {offer.originalUrl && (
                  <div className="flex items-center gap-4">
                    <span className="text-amber-100">Oferta original:</span>
                    <a
                      href={offer.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-yellow-300 hover:text-yellow-200 font-bold flex items-center gap-2"
                    >
                      Acessar
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Price Comparison (Sidebar) */}
          {canSeePrice && (
            <div>
              <Card className="bg-orange-950 bg-opacity-60 backdrop-blur-sm border border-yellow-600 p-6 sticky top-8">
                <h3 className="text-2xl font-black text-amber-50 mb-6 tracking-tight">
                  COMPARADOR
                  <span className="text-yellow-300">/</span>PREÇOS
                </h3>

                <div className="space-y-4">
                  {/* Main Store */}
                  <div className="bg-yellow-400 bg-opacity-20 border border-yellow-400 border-opacity-50 p-4 rounded-lg">
                    <p className="text-amber-100 text-sm mb-2">Melhor Preço</p>
                    <p className="text-2xl font-black text-yellow-300">
                      R$ {parseFloat(offer.price?.toString() || "0").toFixed(2)}
                    </p>
                    <p className="text-amber-200 text-xs mt-2">{offer.source}</p>
                  </div>

                  {/* Placeholder for other stores */}
                  <div className="bg-orange-900 bg-opacity-50 p-4 rounded-lg text-center">
                    <p className="text-amber-200 text-sm">
                      Comparação com outras lojas em breve
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => setLocation("/")}
                  className="w-full mt-6 bg-yellow-400 hover:bg-yellow-300 text-orange-900 font-bold"
                >
                  Voltar às Ofertas
                </Button>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
