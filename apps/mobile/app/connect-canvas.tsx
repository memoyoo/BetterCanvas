import { useEffect, useState } from "react";
import { Link, useRouter } from "expo-router";
import { Pressable, Text, TextInput, View } from "react-native";
import * as WebBrowser from "expo-web-browser";

import { canvasConnectRequestSchema } from "@bettercanvas/shared";

import {
  canvasConnect,
  completeCanvasOAuth,
  getCanvasOAuthConfig,
  startCanvasOAuth,
} from "@/lib/api";
import { setStoredSession } from "@/lib/session";

WebBrowser.maybeCompleteAuthSession();

export default function ConnectCanvasScreen() {
  const router = useRouter();
  const [domain, setDomain] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [oauthEnabled, setOauthEnabled] = useState(false);
  const [oauthRedirectUri, setOauthRedirectUri] = useState<string | null>(null);
  const [showTokenFallback, setShowTokenFallback] = useState(false);
  const [configLoaded, setConfigLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const config = await getCanvasOAuthConfig();
        if (cancelled) {
          return;
        }
        setOauthEnabled(config.enabled);
        setOauthRedirectUri(config.redirectUri ?? null);
        if (!config.enabled) {
          setShowTokenFallback(true);
        }
      } catch {
        if (!cancelled) {
          setOauthEnabled(false);
          setOauthRedirectUri(null);
          setShowTokenFallback(true);
        }
      } finally {
        if (!cancelled) {
          setConfigLoaded(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const openCanvasHelp = async () => {
    if (!domain.trim()) {
      setError("Enter your Canvas domain first.");
      return;
    }

    const candidate = domain.startsWith("http") ? domain : `https://${domain}`;
    await WebBrowser.openBrowserAsync(`${candidate}/profile/settings`);
  };

  const handleOAuth = async () => {
    if (!domain.trim()) {
      setError("Enter your Canvas domain first.");
      return;
    }

    if (!oauthEnabled || !oauthRedirectUri) {
      setError("Canvas sign-in is not available on this server. Use an access token below.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { authorizeUrl } = await startCanvasOAuth(domain);
      const result = await WebBrowser.openAuthSessionAsync(
        authorizeUrl,
        oauthRedirectUri,
      );

      if (result.type !== "success") {
        setError("Canvas sign-in was cancelled.");
        return;
      }

      const redirect = new URL(result.url);
      const oauthError = redirect.searchParams.get("error");

      if (oauthError) {
        setError(
          `Canvas sign-in failed (${oauthError}). Try again or use an access token.`,
        );
        return;
      }

      const code = redirect.searchParams.get("code");
      const state = redirect.searchParams.get("state");

      if (!code || !state) {
        setError("Canvas did not return a sign-in code. Try again.");
        return;
      }

      const session = await completeCanvasOAuth({ code, domain, state });
      await setStoredSession(session);
      router.replace("/dashboard");
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to sign in with Canvas right now.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    const parsed = canvasConnectRequestSchema.safeParse({
      domain,
      token,
    });

    if (!parsed.success) {
      setError("Enter your Canvas domain and access token.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const session = await canvasConnect(parsed.data);
      await setStoredSession(session);
      router.replace("/dashboard");
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to connect Canvas right now.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!configLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="text-base text-muted">Loading sign-in options...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background px-6 py-10">
      <View className="gap-3">
        <Text className="text-sm font-semibold uppercase tracking-[4px] text-primary">
          Canvas onboarding
        </Text>
        <Text className="text-3xl font-bold text-white">
          Connect your Canvas account
        </Text>
        <Text className="text-base leading-7 text-muted">
          {oauthEnabled
            ? "Sign in with your school Canvas in the system browser. Your password stays with Canvas; BetterCanvas only receives an access token on the server."
            : "Your BetterCanvas server has not enabled Canvas OAuth yet. Open Canvas settings to create a personal access token, then paste it below."}
        </Text>
      </View>

      <View className="mt-8 gap-4">
        <TextInput
          autoCapitalize="none"
          className="rounded-3xl border border-white/10 bg-card px-4 py-4 text-base text-white"
          onChangeText={setDomain}
          placeholder="canvas.school.edu"
          placeholderTextColor="#8f94ac"
          value={domain}
        />

        {error ? (
          <View className="rounded-3xl border border-red-500/20 bg-red-500/10 px-4 py-4">
            <Text className="text-sm leading-6 text-red-100">{error}</Text>
          </View>
        ) : null}

        {oauthEnabled ? (
          <Pressable
            className="rounded-full bg-primary px-5 py-4"
            disabled={loading}
            onPress={handleOAuth}
          >
            <Text className="text-center text-base font-semibold text-white">
              {loading ? "Signing in..." : "Sign in with Canvas"}
            </Text>
          </Pressable>
        ) : null}

        <Pressable
          className="rounded-full border border-white/10 px-5 py-4"
          onPress={openCanvasHelp}
        >
          <Text className="text-center text-base font-semibold text-white">
            Open Canvas settings (token help)
          </Text>
        </Pressable>

        {oauthEnabled ? (
          <Pressable onPress={() => setShowTokenFallback((open) => !open)}>
            <Text className="text-center text-sm font-medium text-secondary">
              {showTokenFallback ? "Hide access token option" : "Use access token instead"}
            </Text>
          </Pressable>
        ) : null}

        {showTokenFallback ? (
          <>
            <TextInput
              autoCapitalize="none"
              className="min-h-40 rounded-3xl border border-white/10 bg-card px-4 py-4 text-base text-white"
              multiline
              onChangeText={setToken}
              placeholder="Paste the Canvas access token here"
              placeholderTextColor="#8f94ac"
              textAlignVertical="top"
              value={token}
            />

            <Pressable
              className={`rounded-full px-5 py-4 ${oauthEnabled ? "border border-white/10" : "bg-primary"}`}
              disabled={loading}
              onPress={handleSubmit}
            >
              <Text className="text-center text-base font-semibold text-white">
                {loading ? "Connecting..." : "Connect with access token"}
              </Text>
            </Pressable>
          </>
        ) : null}

        <Link href="/" style={{ marginTop: 4 }}>
          <Text className="text-center text-sm font-medium text-secondary">
            Back to home
          </Text>
        </Link>
      </View>
    </View>
  );
}
