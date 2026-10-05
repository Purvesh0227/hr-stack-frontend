import { useRef, useState, useCallback } from "react";

export default function useSubmitLock() {
    const lock = useRef(false);
    const [loading, setLoading] = useState(false);

    const run = useCallback(async (fn) => {
        if (lock.current) return;          // 2nd click dies here
        lock.current = true;
        setLoading(true);
        try {
            return await fn();
        } finally {
            lock.current = false;
            setLoading(false);
        }
    }, []);

    return [loading, run];
}