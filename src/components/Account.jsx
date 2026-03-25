import { useState, useEffect } from "react";
import { supabase } from "../supabase";

export default function Account() {
  // Form + auth mode state
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState(null);

  // Active session (null when logged out)
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Restore session on refresh, then listen for auth changes
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (e) => {
    // One submit handler for both sign in and sign up
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        // Supabase may require email verification before login
        if (!data.session) {
          setMessage({
            type: "success",
            text: "Success! Please check your email for the verification link before logging in.",
          });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.error_description || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setMessage(null);
  };

  if (session) {
    return (
      <main className="max-w-xl mx-auto px-6 mt-20 text-center">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-2xl">
          <div className="w-20 h-20 bg-zinc-800 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
            👤
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome Back!</h2>
          <p className="text-zinc-400 mb-8">
            Logged in as:{" "}
            <span className="text-zinc-200 font-semibold">
              {session.user.email}
            </span>
          </p>

          <button
            onClick={handleSignOut}
            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition duration-200"
          >
            Sign Out
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto px-6 mt-20">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6 text-center border-b border-zinc-800 pb-4">
          {isSignUp ? "Create an Account" : "Welcome Back"}
        </h2>

        {/* Quick success/error feedback for auth actions */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg text-sm font-medium ${message.type === "success" ? "bg-green-900/30 text-green-400 border border-green-800" : "bg-red-900/30 text-red-400 border border-red-800"}`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-600 transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-600 transition"
              required
              minLength="6"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 bg-white text-black hover:bg-zinc-200 font-bold rounded-lg transition duration-200 disabled:opacity-50"
          >
            {loading ? "Processing..." : isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setMessage(null);
            }}
            className="text-sm text-zinc-400 hover:text-white transition"
          >
            {isSignUp
              ? "Already have an account? Sign In"
              : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </main>
  );
}
