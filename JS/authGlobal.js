/**
 * DistroVantix Auth Global
 * Fuente unica para Supabase Auth, perfil de usuario y estado de sesion.
 */
(function () {
  const SUPABASE_URL = "https://hagcsftbwbglyjdtvrnz.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_pX1pErOuGyzRWj9PTnqQtQ_Yno8idk5";
  const SUPABASE_SDK_URL = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

  let client = null;
  let sdkPromise = null;
  let initPromise = null;
  let authSubscription = null;
  let currentSession = null;
  let currentProfile = null;
  const listeners = new Set();

  function loadSupabaseSDK() {
    if (window.supabase) return Promise.resolve();
    if (sdkPromise) return sdkPromise;

    sdkPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector(`script[src="${SUPABASE_SDK_URL}"]`);
      if (existingScript) {
        existingScript.addEventListener("load", resolve, { once: true });
        existingScript.addEventListener("error", reject, { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = SUPABASE_SDK_URL;
      script.onload = resolve;
      script.onerror = () => reject(new Error("No se pudo cargar Supabase SDK."));
      document.head.appendChild(script);
    });

    return sdkPromise;
  }

  async function getClient() {
    if (client) return client;
    if (window.supabaseClient) {
      client = window.supabaseClient;
      return client;
    }

    await loadSupabaseSDK();
    client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    window.supabaseClient = client;
    return client;
  }

  function normalizeProfile(user, profile) {
    if (!user) return null;

    return {
      id_usuario: user.id,
      email: user.email || profile?.email || "",
      nick:
        profile?.nick ||
        user.user_metadata?.nombre_usuario ||
        user.email?.split("@")[0] ||
        "Usuario de la comunidad",
      avatar_url: profile?.avatar_url || user.user_metadata?.foto_usuario || "🐧",
      descripcion: profile?.descripcion || "",
      distro_favorita: profile?.distro_favorita || "Distro favorita no indicada",
      estado: profile?.estado || "activo",
      rol: profile?.rol || "usuario",
    };
  }

  function buildDefaultProfile(user) {
    const nick = (
      user.user_metadata?.nombre_usuario ||
      user.email?.split("@")[0] ||
      "Usuario"
    ).substring(0, 30);

    return {
      id_usuario: user.id,
      email: user.email,
      nick,
      avatar_url: user.user_metadata?.foto_usuario || "🐧",
      descripcion: "",
      distro_favorita: "Distro favorita no indicada",
      estado: "activo",
      rol: "usuario",
    };
  }

  async function ensureProfile(user) {
    const supabaseClient = await getClient();
    const { data, error } = await supabaseClient
      .from("usuario")
      .select("*")
      .eq("id_usuario", user.id)
      .maybeSingle();

    if (error) throw error;
    if (data) return normalizeProfile(user, data);

    const defaultProfile = buildDefaultProfile(user);
    const { data: createdProfile, error: upsertError } = await supabaseClient
      .from("usuario")
      .upsert(defaultProfile, { onConflict: "id_usuario" })
      .select()
      .single();

    if (upsertError) {
      console.warn("No se pudo crear el perfil publico:", upsertError.message);
      return normalizeProfile(user, defaultProfile);
    }

    return normalizeProfile(user, createdProfile);
  }

  function emit(eventName) {
    const state = getState();
    listeners.forEach((listener) => {
      try {
        listener(state, eventName);
      } catch (error) {
        console.error("Error en listener de autenticacion:", error);
      }
    });
  }

  async function setSession(session, eventName = "SESSION_REFRESHED") {
    currentSession = session || null;
    currentProfile = session?.user ? await ensureProfile(session.user) : null;
    emit(eventName);
    return getState();
  }

  function getState() {
    return {
      session: currentSession,
      user: currentSession?.user || null,
      profile: currentProfile,
      isAuthenticated: Boolean(currentSession?.user),
      client,
    };
  }

  async function init() {
    if (initPromise) return initPromise;

    initPromise = (async () => {
      const supabaseClient = await getClient();
      const {
        data: { session },
        error,
      } = await supabaseClient.auth.getSession();

      if (error) throw error;
      await setSession(session, "INITIAL_SESSION");

      if (!authSubscription) {
        const { data } = supabaseClient.auth.onAuthStateChange((event, sessionData) => {
          setTimeout(() => {
            setSession(sessionData, event).catch((error) => {
              console.error("Error al sincronizar la sesion:", error);
            });
          }, 0);
        });
        authSubscription = data?.subscription || null;
      }

      return getState();
    })();

    return initPromise;
  }

  function onChange(listener) {
    listeners.add(listener);
    if (initPromise) {
      Promise.resolve(initPromise).then(() => listener(getState(), "CURRENT_STATE"));
    }

    return () => listeners.delete(listener);
  }

  async function signIn(email, password, options = {}) {
    const supabaseClient = await getClient();
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
      options,
    });
    if (error) throw error;
    await setSession(data.session, "SIGNED_IN");
    return getState();
  }

  async function signUp({ nick, email, password, options = {} }) {
    const supabaseClient = await getClient();
    const cleanNick = (nick || "Nuevo miembro").trim().substring(0, 30);
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        ...options,
        data: {
          ...(options.data || {}),
          nombre_usuario: cleanNick,
          foto_usuario: "🐧",
        },
      },
    });

    if (error) throw error;

    if (data?.user) {
      const defaultProfile = buildDefaultProfile(data.user);
      defaultProfile.nick = cleanNick;
      const { error: profileError } = await supabaseClient
        .from("usuario")
        .upsert(defaultProfile, { onConflict: "id_usuario" });

      if (profileError) {
        console.warn("Perfil ya existente o creado por trigger:", profileError.message);
      }
    }

    if (data?.session) await setSession(data.session, "SIGNED_UP");
    return data;
  }

  async function signOut() {
    const supabaseClient = await getClient();
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
    currentSession = null;
    currentProfile = null;
    emit("SIGNED_OUT");
  }

  async function updateProfile(changes) {
    if (!currentProfile) throw new Error("No hay una sesion activa.");
    const supabaseClient = await getClient();
    const allowedChanges = {
      ...(changes.nick !== undefined ? { nick: changes.nick } : {}),
      ...(changes.avatar_url !== undefined ? { avatar_url: changes.avatar_url } : {}),
      ...(changes.descripcion !== undefined ? { descripcion: changes.descripcion } : {}),
      ...(changes.distro_favorita !== undefined
        ? { distro_favorita: changes.distro_favorita }
        : {}),
    };

    const { data, error } = await supabaseClient
      .from("usuario")
      .update(allowedChanges)
      .eq("id_usuario", currentProfile.id_usuario)
      .select()
      .single();

    if (error) throw error;
    currentProfile = normalizeProfile(currentSession.user, data);
    emit("PROFILE_UPDATED");
    return currentProfile;
  }

  async function refreshProfile() {
    if (!currentSession?.user) {
      currentProfile = null;
      emit("PROFILE_REFRESHED");
      return null;
    }

    currentProfile = await ensureProfile(currentSession.user);
    emit("PROFILE_REFRESHED");
    return currentProfile;
  }

  window.DistroVantixAuth = {
    init,
    ready: init,
    getClient,
    getState,
    onChange,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshProfile,
  };
})();
