'use client';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type Severity = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  severity?: Severity;
  action?: { label: string; onClick: () => void };
  duration?: number;
}

interface ToastState extends ToastOptions {
  key: number;
  message: ReactNode;
}

type ToastFn = (message: ReactNode, options?: ToastOptions) => void;

const ToastContext = createContext<ToastFn | null>(null);

/** Small toast system on MUI Snackbar; supports an action button (used for "Undo"). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const [open, setOpen] = useState(false);

  const show = useCallback<ToastFn>((message, options) => {
    setToast({ key: Date.now(), message, ...options });
    setOpen(true);
  }, []);

  const close = useCallback((_e?: unknown, reason?: string) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  }, []);

  const value = useMemo(() => show, [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Snackbar
        key={toast?.key}
        open={open}
        onClose={close}
        autoHideDuration={toast?.duration ?? (toast?.action ? 6000 : 4000)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={close}
          severity={toast?.severity ?? 'success'}
          variant="filled"
          // Neutral inverted snackbar (passes contrast in both schemes); the icon carries severity.
          sx={(t) => ({
            alignItems: 'center',
            minWidth: { sm: 360 },
            boxShadow: '0 8px 16px 0 rgba(0, 0, 0, 0.24)',
            color: t.vars.palette.background.paper,
            bgcolor: t.vars.palette.text.primary,
            '& .MuiAlert-icon': {
              color: t.vars.palette[toast?.severity ?? 'success'].main,
              opacity: 1,
            },
          })}
          action={
            toast?.action ? (
              <Button
                color="inherit"
                size="small"
                onClick={() => {
                  toast.action?.onClick();
                  setOpen(false);
                }}
              >
                {toast.action.label}
              </Button>
            ) : undefined
          }
        >
          {toast?.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastFn {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
