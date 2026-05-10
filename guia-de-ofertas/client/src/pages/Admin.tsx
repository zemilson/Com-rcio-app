import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

export default function Admin() {
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sourceUrl, setSourceUrl] = useState("");
  const [parserType, setParserType] = useState<"json" | "rss" | "html" | "csv">("json");
  const [cssSelector, setCssSelector] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement proper admin authentication
    if (password === "admin123") {
      setIsAuthenticated(true);
      setPassword("");
      setError("");
    } else {
      setError("Senha incorreta");
    }
  };

  const handleTestClone = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");
    setPreviewData(null);

    try {
      // TODO: Implement actual cloning logic
      // For now, just simulate
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setPreviewData({
        offersCount: 5,
        offers: [
          {
            title: "Exemplo de Oferta 1",
            price: "99.90",
            source: "Loja Exemplo",
          },
          {
            title: "Exemplo de Oferta 2",
            price: "149.90",
            source: "Loja Exemplo",
          },
        ],
      });
      setSuccess("Preview gerado com sucesso!");
    } catch (err) {
      setError("Erro ao gerar preview");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAndApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // TODO: Implement actual save and apply logic
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccess("Configuração salva e aplicada com sucesso!");
    } catch (err) {
      setError("Erro ao salvar configuração");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-900 via-amber-800 to-yellow-900 flex items-center justify-center relative overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-yellow-400 opacity-10 blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full bg-orange-400 opacity-10 blur-3xl"></div>

        <Card className="relative z-10 w-full max-w-md bg-orange-950 bg-opacity-80 backdrop-blur-sm border border-yellow-600 border-opacity-30 p-8">
          <h1 className="text-3xl font-black text-amber-50 mb-8 text-center tracking-tight">
            PAINEL
            <span className="text-yellow-300 block">ADMIN</span>
          </h1>

          <form onSubmit={handleAdminLogin} className="space-y-6">
            <div>
              <label className="block text-amber-50 font-bold mb-2">Senha</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha"
                className="bg-orange-900 bg-opacity-50 border-yellow-600 border-opacity-30 text-amber-50 placeholder-amber-200 placeholder-opacity-50"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-300 text-orange-900 font-bold"
            >
              ENTRAR
            </Button>
          </form>
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
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-black text-amber-50 tracking-tight">
            ADMIN<span className="text-yellow-300">/</span>PAINEL
          </h1>
          <Button
            variant="outline"
            onClick={() => {
              setIsAuthenticated(false);
              setLocation("/");
            }}
          >
            Sair
          </Button>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Form */}
          <div className="lg:col-span-2">
            <Card className="bg-orange-950 bg-opacity-60 backdrop-blur-sm border border-yellow-600 border-opacity-30 p-8">
              <h2 className="text-2xl font-black text-amber-50 mb-6 tracking-tight">
                CONFIGURAR
                <span className="text-yellow-300"> ORIGEM</span>
              </h2>

              <form onSubmit={handleTestClone} className="space-y-6">
                <div>
                  <label className="block text-amber-50 font-bold mb-2">
                    URL de Origem
                  </label>
                  <Input
                    type="url"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="https://exemplo.com/ofertas"
                    className="bg-orange-900 bg-opacity-50 border-yellow-600 border-opacity-30 text-amber-50"
                  />
                </div>

                <div>
                  <label className="block text-amber-50 font-bold mb-2">
                    Tipo de Parser
                  </label>
                  <select
                    value={parserType}
                    onChange={(e) =>
                      setParserType(e.target.value as "json" | "rss" | "html" | "csv")
                    }
                    className="w-full bg-orange-900 bg-opacity-50 border border-yellow-600 border-opacity-30 text-amber-50 px-4 py-2 rounded-lg"
                  >
                    <option value="json">JSON Estruturado</option>
                    <option value="rss">RSS/XML</option>
                    <option value="html">HTML + CSS Selector</option>
                    <option value="csv">Google Sheets CSV</option>
                  </select>
                </div>

                {parserType === "html" && (
                  <div>
                    <label className="block text-amber-50 font-bold mb-2">
                      CSS Selector
                    </label>
                    <Input
                      type="text"
                      value={cssSelector}
                      onChange={(e) => setCssSelector(e.target.value)}
                      placeholder=".offer-item"
                      className="bg-orange-900 bg-opacity-50 border-yellow-600 border-opacity-30 text-amber-50"
                    />
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900 bg-opacity-20 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                {success && (
                  <div className="flex items-center gap-2 text-green-400 text-sm bg-green-900 bg-opacity-20 p-3 rounded-lg">
                    <CheckCircle className="w-4 h-4" />
                    {success}
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={isLoading || !sourceUrl}
                    className="flex-1 bg-yellow-400 hover:bg-yellow-300 text-orange-900 font-bold"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Testando...
                      </>
                    ) : (
                      "TESTAR E CLONAR"
                    )}
                  </Button>

                  <Button
                    type="button"
                    onClick={handleSaveAndApply}
                    disabled={isLoading || !sourceUrl}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      "SALVAR E APLICAR"
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Preview and History */}
          <div className="space-y-6">
            {/* Preview */}
            {previewData && (
              <Card className="bg-orange-950 bg-opacity-60 backdrop-blur-sm border border-yellow-600 border-opacity-30 p-6">
                <h3 className="text-lg font-black text-amber-50 mb-4 tracking-tight">
                  PREVIEW
                </h3>
                <div className="space-y-3">
                  <p className="text-amber-100 text-sm">
                    <span className="font-bold text-yellow-300">
                      {previewData.offersCount}
                    </span>{" "}
                    ofertas encontradas
                  </p>
                  {previewData.offers?.map((offer: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-orange-900 bg-opacity-50 p-3 rounded-lg"
                    >
                      <p className="text-amber-50 font-bold text-sm">
                        {offer.title}
                      </p>
                      <p className="text-yellow-300 text-sm">
                        R$ {offer.price}
                      </p>
                      <p className="text-amber-200 text-xs">{offer.source}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Statistics */}
            <Card className="bg-orange-950 bg-opacity-60 backdrop-blur-sm border border-yellow-600 border-opacity-30 p-6">
              <h3 className="text-lg font-black text-amber-50 mb-4 tracking-tight">
                ESTATÍSTICAS
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-amber-100 text-sm">Total de Ofertas</p>
                  <p className="text-2xl font-black text-yellow-300">0</p>
                </div>
                <div>
                  <p className="text-amber-100 text-sm">Último Clone</p>
                  <p className="text-sm text-amber-50">Nunca</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
