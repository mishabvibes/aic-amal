"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useMemo,
} from "react";

const LoadingContext = createContext(undefined);

const LoadingProvider = ({ children, loadingComponent }) => {
  const [loadingKeys, setLoadingKeys] = useState(new Set());
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState(null);

  const startLoading = useCallback((msg) => {
    setLoadingKeys((prev) => new Set(prev).add("global"));
    setMessage(msg || "Loading...");
    setProgress(0);
  }, []);

  const stopLoading = useCallback(() => {
    setLoadingKeys((prev) => {
      const s = new Set(prev);
      s.delete("global");
      return s;
    });
    setMessage(null);
    setProgress(0);
  }, []);

  const setLoadingState = useCallback((state, msg) => {
    setLoadingKeys((prev) => {
      const s = new Set(prev);
      state ? s.add("global") : s.delete("global");
      return s;
    });
    setMessage(state ? msg || "Loading..." : null);
    setProgress(state ? 0 : 0);
  }, []);

  const queueLoading = useCallback(
    (key, msg) => {
      setLoadingKeys((prev) => new Set(prev).add(key));
      setMessage(msg || message || "Processing...");
    },
    [message]
  );

  const dequeueLoading = useCallback((key) => {
    setLoadingKeys((prev) => {
      const s = new Set(prev);
      s.delete(key);
      if (s.size === 0) setMessage(null);
      return s;
    });
  }, []);

  const isLoadingKey = useCallback((key) => loadingKeys.has(key), [loadingKeys]);

  const handleSetProgress = useCallback((value) => {
    setProgress(Math.min(Math.max(value, 0), 100));
  }, []);

  const isLoading = loadingKeys.size > 0;

  const contextValue = useMemo(
    () => ({
      isLoading,
      progress,
      message,
      startLoading,
      stopLoading,
      setLoadingState,
      queueLoading,
      dequeueLoading,
      isLoadingKey,
      setProgress: handleSetProgress,
    }),
    [
      isLoading,
      progress,
      message,
      startLoading,
      stopLoading,
      setLoadingState,
      queueLoading,
      dequeueLoading,
      isLoadingKey,
      handleSetProgress,
    ]
  );

  // Updated loading UI with white and violet-blue theme
  const defaultLoadingUI = (
    <div
      className="fixed inset-0 z-[9999] bg-indigo-50/90 flex items-center justify-center transition-opacity duration-300 ease-in-out"
      aria-live="polite"
      aria-busy={isLoading}
      role="status"
    >
      <div className="relative w-20 h-20">
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500/20 to-transparent animate-ping" />
        {/* Main spinner */}
        <div className="absolute inset-0 rounded-full border-4 border-indigo-200 border-t-violet-600 animate-spin shadow-[0_0_15px_rgba(139,92,246,0.3)]" />
        {/* Inner pulse */}
        <div className="absolute inset-2 rounded-full bg-white animate-pulse" />
        {/* Progress ring */}
        {progress > 0 && (
          <svg className="absolute inset-0 w-full h-full">
            <circle
              className="text-violet-600"
              strokeWidth="4"
              stroke="currentColor"
              fill="transparent"
              r="30"
              cx="40"
              cy="40"
              strokeDasharray={`${(progress / 100) * 188} 188`}
              strokeDashoffset="0"
              transform="rotate(-90 40 40)"
            />
          </svg>
        )}
        {/* Message */}
        {message && (
          <div className="absolute top-full mt-4 text-sm text-indigo-800 font-medium tracking-wide">
            {message}
          </div>
        )}
        <span className="sr-only">{message || "Loading, please wait..."}</span>
      </div>
    </div>
  );

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
      {isLoading && (loadingComponent || defaultLoadingUI)}
    </LoadingContext.Provider>
  );
};

const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) throw new Error("useLoading must be used within a LoadingProvider");
  return context;
};

const withLoading = (WrappedComponent) => (props) => (
  <WrappedComponent {...props} loading={useLoading()} />
);

export { LoadingProvider, useLoading, withLoading };