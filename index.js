import { getPath, listenKeys, atom } from "nanostores";

/**
 * Creates an atom that stays in sync with a Nanostores map
 * @template T
 * @param {import('nanostores').Store<T>} store
 * @param {import('nanostores').AllPaths<T>} path
 * @returns {import('nanostores').Atom<typeof T[path]>}
 */
export function toAtom(store, path) {
    let alreadyChanging = false;
    const a = atom(getPath(store.get(), path));
    listenKeys(store, [path], (value) => {
        a.set(getPath(value, path));
    })

    a.listen((value) => {
        store.setKey(path, value)
    })

    return a;
    
}

/**
 * Adds a path to a Nanostores map that is tracked against a Nanostores atom
 * @template M, A
 * @param {import('nanostores').MapStore<M>} store 
 * @param {string} path 
 * @param {import('nanostores').Atom<A>} atom
 * @returns {assert store is import('nanostores').Map<M & { [path]: A}>}
 */
export function fromAtom(store, path, atom) {
    atom.subscribe((value) => {
        store.setKey(path, value);
    })
    listenKeys(store, [path], (value) => {
        atom.set(getPath(value, path));
    });
}

/** @type {[Map<any, any>, () => void] | undefined} */
let currentEffect = undefined;

/**
 * Tracks Nanostores atoms and maps via helper function `$` or `use` and calls a callback each time one changes.
 * @param {() => void} callback The callback that will be called when any dependency changes
 * @returns {() => void} Disposes of listeners
 */
export function effect(callback) {
    const map = new Map();
    const c = () => {
        const t = currentEffect;
        currentEffect = [map, c];
        try {
            callback();
        } finally {
            currentEffect = t;
        }
    }

    c()

    const d = () => {
        // Disposes of all listeners
        map.forEach(_ => _());
    }

    // TODO: Maybe implement effect scope?

    return d
}

/** 
 * Tracks usage of atom or map when used with `effect`. Returns value of atom/map.
 * @template T
 * @param {import('nanostores').Store<T>} atomOrStore
 * @returns {T}
 */
export function use(atomOrStore) {
    if (currentEffect !== undefined) {
        if (!currentEffect[0].has(atomOrStore)) {
            let c = currentEffect[1];
            currentEffect[0].set(atomOrStore, atomOrStore.listen(() => { c() }))
        }
    }

    return atomOrStore.get()
}

export const $ = use;