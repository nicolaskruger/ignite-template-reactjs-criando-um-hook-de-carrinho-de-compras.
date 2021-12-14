import { useState } from "react"

export const useLocalStorageHook = <T extends unknown>(key: string, init: () => T): [T, (val: T) => void] => {
    const [value, _setState] = useState<T>(() => {

        const storagedCart = localStorage.getItem(key);

        if (storagedCart) {
            return JSON.parse(storagedCart);
        }

        return init();
    })

    const setState = (val: T) => {
        localStorage.setItem(key, JSON.stringify(val))
        _setState(val);
    }

    return [value, setState];
}