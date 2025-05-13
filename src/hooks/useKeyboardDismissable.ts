import { useEffect } from 'react';
import { BackHandler, NativeEventSubscription } from 'react-native';

type IParams = {
  enabled?: boolean;
  callback: () => void; // Changed 'any' to 'void' for better type safety
};

let keyboardDismissHandlers: Array<() => void> = [];
export const keyboardDismissHandlerManager = {
  push: (handler: () => void) => {
    keyboardDismissHandlers.push(handler);
    return () => {
      keyboardDismissHandlers = keyboardDismissHandlers.filter(
        (h) => h !== handler
      );
    };
  },
  length: () => keyboardDismissHandlers.length,
  pop: () => {
    return keyboardDismissHandlers.pop();
  },
};

/**
 * Handles attaching callback for Escape key listener on web and Back button listener on Android
 */
export const useKeyboardDismissable = ({ enabled = true, callback }: IParams) => {
  useEffect(() => {
    let cleanupFn: () => void = () => {};
    if (enabled) {
      cleanupFn = keyboardDismissHandlerManager.push(callback);
    } else {
      cleanupFn();
    }
    return () => {
      cleanupFn();
    };
  }, [enabled, callback]);

  useBackHandler({ enabled, callback });
};

export function useBackHandler({ enabled = true, callback }: IParams) {
  useEffect(() => {
    let handlerRef: NativeEventSubscription | null = null;
    const backHandler = () => {
      callback();
      return true;
    };

    if (enabled) {
      handlerRef = BackHandler.addEventListener('hardwareBackPress', backHandler);
    }

    // Move cleanup to the return function to avoid premature removal
    return () => {
      if (handlerRef) {
        handlerRef.remove();
      }
    };
  }, [enabled, callback]);
}