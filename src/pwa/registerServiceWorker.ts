interface ServiceWorkerWindow {
  navigator?: {
    serviceWorker?: {
      register: (scriptUrl: string) => Promise<unknown>;
    };
  };
}

export function registerServiceWorker(windowLike: ServiceWorkerWindow = window): void {
  const serviceWorker = windowLike.navigator?.serviceWorker;
  if (!serviceWorker) {
    return;
  }

  serviceWorker.register("/service-worker.js").catch(() => {
    // The app remains fully usable without offline caching.
  });
}
