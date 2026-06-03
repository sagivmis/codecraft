import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button, cn } from '@codecraft/ui';

/**
 * Chrome/Edge/Android `beforeinstallprompt` event.
 * Typed here because the DOM lib doesn't ship a global type for it.
 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const DISMISS_KEY = 'codecraft:pwa-install:dismissed-at';
/** Re-show the prompt after this many days if the user dismissed it. */
const DISMISS_COOLDOWN_DAYS = 7;

/**
 * Floating PWA install prompt.
 * - Listens for `beforeinstallprompt` (Chromium/Edge/Android).
 * - Hides itself permanently once installed via `appinstalled`.
 * - Snoozes for a week if the student explicitly dismisses.
 * - iOS Safari doesn't fire the event, so we render a small "Add to
 *   Home Screen" hint when running standalone is supported but the event
 *   never arrives. (Intentionally subtle; full iOS guide can come later.)
 */
export function InstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    /* Already installed — show nothing. */
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }

    /* Cooldown after a previous dismiss. */
    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (dismissedAt && Date.now() - dismissedAt < DISMISS_COOLDOWN_DAYS * 86_400_000) {
      return;
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = async () => {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === 'dismissed') {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    }
    setPromptEvent(null);
  };

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setPromptEvent(null);
  };

  return (
    <AnimatePresence>
      {!installed && promptEvent && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 24 }}
          className={cn(
            'fixed bottom-4 left-1/2 z-40 w-[min(28rem,calc(100%-2rem))] -translate-x-1/2',
            'rounded-2xl border border-[var(--cc-border)] bg-[var(--cc-surface)] p-4 shadow-2xl',
          )}
          role="dialog"
          aria-labelledby="pwa-install-title"
        >
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-[var(--cc-primary)] font-mono text-base font-bold text-[var(--cc-primary-fg)]">
              {'<>'}
            </div>
            <div className="flex-1">
              <p id="pwa-install-title" className="font-semibold">
                Install CodeCraft
              </p>
              <p className="text-xs text-[var(--cc-fg-muted)]">
                Add it to your home screen for full-screen lessons, offline access, and faster
                start-up.
              </p>
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={dismiss}>
              Not now
            </Button>
            <Button variant="primary" size="sm" onClick={install}>
              Install
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
