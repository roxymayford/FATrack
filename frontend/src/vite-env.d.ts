/// <reference types="vite/client" />

interface Window {
  snap?: {
    pay: (
      token: string,
      options?: {
        onSuccess?: (result: any) => void;
        onPending?: (result: any) => void;
        onError?: (result: any) => void;
        onClose?: () => void;
      }
    ) => void;
    embed?: (
      token: string,
      options?: {
        embedId: string;
        onSuccess?: (result: any) => void;
        onPending?: (result: any) => void;
        onError?: (result: any) => void;
        onClose?: () => void;
      }
    ) => void;
  };
}

