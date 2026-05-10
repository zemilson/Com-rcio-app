import { useState, useMemo } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { trpc } from '@/lib/trpc';
import { Search, Filter, X, Lock, Clock } from 'lucide-react';
import { useLocation } from 'wouter';

export default function Home() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  
  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [sortBy, setSortBy] = useState('newest');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(true);

  // Fetch offers
  const { data: offersData, isLoading: offersLoading } = trpc.offers.list.useQuery();
  const { data: trialData } = trpc.trial.getStatus.useQuery();

  // Filter and sort offers
  const filteredOffers = useMemo(() => {
    if (!offersData) return [];

    let filtered = offersData.filter((offer: any) => {
      const matchesSearch = offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const price = parseFloat(offer.price || '0');
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1];

      return matchesSearch && matchesPrice;
    });

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => (parseFloat(a.price || '0') - parseFloat(b.price || '0')));
        break;
      case 'price-high':
        filtered.sort((a, b) => (parseFloat(b.price || '0') - parseFloat(a.price || '0')));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return filtered;
  }, [offersData, searchQuery, priceRange, sortBy]);

  const hasActiveSubscription = trialData?.hasActiveSubscription;
  const isTrialActive = trialData?.hasActiveTrial;
  const canSeePrice = hasActiveSubscription || isTrialActive;

  const daysRemaining = trialData?.daysRemaining || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-800 to-amber-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b-4 border-yellow-400 bg-gradient-to-r from-amber-900 to-orange-900 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl font-black text-amber-100 tracking-wider" style={{ textShadow: '3px 3px 0px rgba(0,0,0,0.5)' }}>
              GUIA/OFERTAS
            </div>
          </div>

          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-amber-700" />
              <Input
                type="text"
                placeholder="Buscar ofertas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-amber-100 border-2 border-yellow-400 text-amber-900 placeholder:text-amber-700 focus:ring-yellow-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isTrialActive && (
              <div className="flex items-center gap-2 bg-yellow-400 px-3 py-2 rounded-lg border-2 border-yellow-600">
                <Clock className="w-4 h-4 text-amber-900" />
                <span className="text-sm font-bold text-amber-900">
                  Trial: {daysRemaining}d
                </span>
              </div>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-amber-100 font-semibold">{user?.name || 'Usuário'}</span>
                <Button
                  onClick={() => navigate('/plans')}
                  variant="default"
                  className="bg-yellow-400 hover:bg-yellow-500 text-amber-900 font-bold border-2 border-yellow-600"
                >
                  Planos
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => navigate('/plans')}
                className="bg-yellow-400 hover:bg-yellow-500 text-amber-900 font-bold border-2 border-yellow-600"
              >
                Entrar
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-6">
        {/* Sidebar Filters */}
        <aside className={`${showFilters ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden`}>
          <div className="bg-gradient-to-b from-amber-800 to-orange-900 p-6 rounded-lg border-4 border-yellow-400 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-amber-100 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                FILTROS
              </h3>
            </div>

            {/* Price Range */}
            <div className="mb-8">
              <label className="block text-sm font-bold text-amber-100 mb-3">
                Preço: R$ {priceRange[0]} - R$ {priceRange[1]}
              </label>
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                min={0}
                max={500}
                step={10}
                className="w-full"
              />
            </div>

            {/* Sort */}
            <div className="mb-8">
              <label className="block text-sm font-bold text-amber-100 mb-2">
                Ordenar por
              </label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-amber-700 border-2 border-yellow-400 text-amber-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mais Recentes</SelectItem>
                  <SelectItem value="price-low">Menor Preço</SelectItem>
                  <SelectItem value="price-high">Maior Preço</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-bold text-amber-100 mb-3">
                Categorias
              </label>
              <div className="space-y-2">
                {['Eletrônicos', 'Moda', 'Casa', 'Esportes', 'Livros'].map(cat => (
                  <div key={cat} className="flex items-center gap-2">
                    <Checkbox
                      id={cat}
                      checked={selectedCategories.includes(cat)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedCategories([...selectedCategories, cat]);
                        } else {
                          setSelectedCategories(selectedCategories.filter(c => c !== cat));
                        }
                      }}
                    />
                    <label htmlFor={cat} className="text-sm text-amber-100 cursor-pointer">
                      {cat}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Toggle Filters Button */}
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-black text-amber-100" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>
              OFERTAS/QUENTES
            </h2>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="bg-amber-800 border-2 border-yellow-400 text-amber-100 hover:bg-amber-700"
            >
              {showFilters ? <X className="w-4 h-4" /> : <Filter className="w-4 h-4" />}
            </Button>
          </div>

          {/* Offers Grid */}
          {offersLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-amber-800 rounded-lg animate-pulse border-2 border-yellow-400" />
              ))}
            </div>
          ) : filteredOffers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-2xl font-black text-amber-100" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>
                Nenhuma oferta encontrada
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOffers.map((offer: any) => (
                <Card
                  key={offer.id}
                  onClick={() => navigate(`/offer/${offer.id}`)}
                  className="group cursor-pointer bg-gradient-to-b from-amber-800 to-orange-900 border-4 border-yellow-400 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden bg-amber-900">
                    {offer?.image ? (
                      <img
                        src={offer.image}
                        alt={offer.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-amber-700">
                        <span className="text-amber-300 text-4xl">📦</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {/* Source Badge */}
                    <Badge className="mb-2 bg-yellow-400 text-amber-900 font-bold border-2 border-yellow-600">
                      {offer?.source || 'Origem'}
                    </Badge>

                    {/* Title */}
                    <h3 className="font-black text-amber-100 mb-2 line-clamp-2" style={{ textShadow: '1px 1px 0px rgba(0,0,0,0.5)' }}>
                      {offer?.title || 'Sem título'}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-amber-200 mb-4 line-clamp-2">
                      {offer?.description || 'Sem descrição'}
                    </p>

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      {canSeePrice ? (
                        <div className="text-2xl font-black text-yellow-400" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>
                          R$ {parseFloat(offer?.price || '0').toFixed(2)}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-amber-100">
                          <Lock className="w-4 h-4" />
                          <span className="text-sm font-bold">Assine para ver</span>
                        </div>
                      )}

                      <Button
                        size="sm"
                        className="bg-yellow-400 hover:bg-yellow-500 text-amber-900 font-bold border-2 border-yellow-600"
                      >
                        Detalhes
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
