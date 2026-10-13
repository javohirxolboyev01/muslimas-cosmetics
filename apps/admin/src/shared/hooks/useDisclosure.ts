import { useCallback, useState } from 'react';

/** Modal / drawer ochish-yopish uchun; ixtiyoriy ma'lumot (masalan tahrirlanayotgan element) bilan */
export function useDisclosure<T = undefined>() {
  const [state, setState] = useState<{ open: boolean; data?: T }>({ open: false });
  const open = useCallback((data?: T) => setState({ open: true, data }), []);
  const close = useCallback(() => setState((s) => ({ ...s, open: false })), []);
  return { isOpen: state.open, data: state.data, open, close };
}
