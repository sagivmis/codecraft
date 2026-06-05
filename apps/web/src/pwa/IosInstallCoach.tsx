import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button, cn } from '@codecraft/ui';

import { PWA_INSTALL_DISMISS_COOLDOWN_DAYS, STORAGE_KEYS } from '@constants';

import { isIos, isStandalonePwa } from './device.js';

const DISMISS_KEY = STORAGE_KEYS.IOS_INSTALL_DISMISSED;

function isOnboardingComplete(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ONBOARDING);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { completed?: boolean };
    return Boolean(parsed.completed);
  } catch {
    return false;
  }
}

function isDismissed(): boolean {
  const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
  return Boolean(
    dismissedAt && Date.now() - dismissedAt < PWA_INSTALL_DISMISS_COOLDOWN_DAYS * 86_400_000,
  );
}

const STEPS = [
  {
    title: 'Tap Share',
    description: 'The square-with-arrow button at the bottom of Safari (or top on iPad).',
    icon: '↑',
  },
  {
    title: 'Add to Home Screen',
    description: 'Scroll the share menu and choose “Add to Home Screen”.',
    icon: '➕',
  },
  {
    title: 'Open from your home screen',
    description: 'Launch CodeCraft like an app — full screen, faster return visits.',
    icon: '🏠',
  },
] as const;

/**
 * Guided install flow for iOS Safari / WebKit browsers.
 * `beforeinstallprompt` never fires on iOS, so we show manual steps instead.
 */
export function IosInstallCoach() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isIos() || isStandalonePwa() || isDismissed() || !isOnboardingComplete()) {
      return;
    }

    /* Brief delay so we don't stack on top of the onboarding modal. */
    const timer = window.setTimeout(() => setOpen(true), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          role="presentation"
          onClick={dismiss}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className={cn(
              'w-full max-w-md rounded-2xl border border-[var(--cc-border)] bg-[var(--cc-surface)] p-5 shadow-2xl',
            )}
            role="dialog"
            aria-labelledby="ios-install-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-[var(--cc-primary)] font-mono text-lg font-bold text-[var(--cc-primary-fg)]">
                {'<>'}
              </div>
              <div>
                <p id="ios-install-title" className="text-lg font-bold">
                  Install CodeCraft on iPhone
                </p>
                <p className="mt-1 text-sm text-[var(--cc-fg-muted)]">
                  Add the app to your home screen for full-screen lessons and quicker access.
                </p>
              </div>
            </div>

            <ol className="mt-5 space-y-3">
              {STEPS.map((step, index) => (
                <li
                  key={step.title}
                  className="flex gap-3 rounded-xl border border-[var(--cc-border)] bg-[var(--cc-bg)] p-3"
                >
                  <span
                    className="grid h-9 w-9 flex-none place-items-center rounded-lg bg-[var(--cc-surface-hover)] text-lg"
                    aria-hidden="true"
                  >
                    {step.icon}
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--cc-fg-muted)]">
                      Step {index + 1}
                    </p>
                    <p className="font-semibold">{step.title}</p>
                    <p className="text-sm text-[var(--cc-fg-muted)]">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-5 flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={dismiss}>
                Not now
              </Button>
              <Button variant="primary" size="sm" onClick={dismiss}>
                Got it
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
