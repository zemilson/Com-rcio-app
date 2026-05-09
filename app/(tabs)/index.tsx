import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "expo-router";
import { trpc } from "@/lib/trpc";
import { ScreenContainer } from "@/components/screen-container";

export default function HomeScreen() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<"basic" | "professional" | null>(null);

  // Get current subscription
  const { data: subscription, isLoading: subscriptionLoading } = trpc.subscriptions.getCurrent.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Get service provider profile
  const { data: serviceProvider } = trpc.serviceProviders.getByUserId.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  useEffect(() => {
    // If user is authenticated and has a subscription, redirect to appropriate screen
    if (isAuthenticated && subscription) {
      if (serviceProvider) {
        router.push("/");
      }
    }
  }, [isAuthenticated, subscription, serviceProvider]);

  if (loading || subscriptionLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color="#0a7ea4" />
      </ScreenContainer>
    );
  }

  if (!isAuthenticated) {
    return (
      <ScreenContainer className="p-6">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1 gap-8">
            {/* Hero Section */}
            <View className="items-center gap-4 mt-8">
              <Text className="text-4xl font-bold text-foreground">App da Cidade</Text>
              <Text className="text-base text-muted text-center leading-relaxed">
                Conecte-se com prestadores de serviço locais e encontre os melhores profissionais perto de você
              </Text>
            </View>

            {/* Plan Selection */}
            <View className="gap-4">
              <Text className="text-2xl font-bold text-foreground">Escolha seu Plano</Text>

              {/* Basic Plan */}
              <TouchableOpacity
                onPress={() => setSelectedPlan("basic")}
                className={`rounded-2xl p-6 border-2 ${
                  selectedPlan === "basic"
                    ? "border-primary bg-primary/10"
                    : "border-border bg-surface"
                }`}
              >
                <View className="gap-3">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-xl font-bold text-foreground">Plano Básico</Text>
                    <Text className="text-sm font-semibold text-success">7 dias grátis</Text>
                  </View>
                  <Text className="text-3xl font-bold text-primary">R$ 5,00</Text>
                  <Text className="text-sm text-muted">/mês após o período grátis</Text>
                  <View className="gap-2 mt-2">
                    <Text className="text-sm text-foreground">✓ Perfil com fotos</Text>
                    <Text className="text-sm text-foreground">✓ Descrição e endereço</Text>
                    <Text className="text-sm text-foreground">✓ WhatsApp visível</Text>
                    <Text className="text-sm text-foreground">✓ Avaliações de clientes</Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Professional Plan */}
              <TouchableOpacity
                onPress={() => setSelectedPlan("professional")}
                className={`rounded-2xl p-6 border-2 ${
                  selectedPlan === "professional"
                    ? "border-primary bg-primary/10"
                    : "border-border bg-surface"
                }`}
              >
                <View className="gap-3">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-xl font-bold text-foreground">Plano Profissional</Text>
                    <Text className="text-sm font-semibold text-warning">Recomendado</Text>
                  </View>
                  <Text className="text-3xl font-bold text-primary">R$ 10,00</Text>
                  <Text className="text-sm text-muted">/mês (sem período grátis)</Text>
                  <View className="gap-2 mt-2">
                    <Text className="text-sm text-foreground">✓ Tudo do Plano Básico</Text>
                    <Text className="text-sm text-foreground">✓ Chat interno no app</Text>
                    <Text className="text-sm text-foreground">✓ Notificações push</Text>
                    <Text className="text-sm text-foreground">✓ Histórico de conversas</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            {/* CTA Button */}
            <View className="gap-2">
              <TouchableOpacity
                onPress={() => {
                  if (selectedPlan) {
                    // TODO: Navigate to payment screen
                    console.log("Selected plan:", selectedPlan);
                  }
                }}
                disabled={!selectedPlan}
                className={`rounded-full py-4 items-center ${
                  selectedPlan ? "bg-primary" : "bg-muted"
                }`}
              >
                <Text className="text-white font-semibold text-base">
                  Continuar com {selectedPlan === "basic" ? "Plano Básico" : "Plano Profissional"}
                </Text>
              </TouchableOpacity>

              <Text className="text-xs text-muted text-center">
                Você será redirecionado para pagar com cartão ou Pix
              </Text>
            </View>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  // If authenticated but no subscription, show loading
  return (
    <ScreenContainer className="items-center justify-center">
      <ActivityIndicator size="large" color="#0a7ea4" />
    </ScreenContainer>
  );
}
