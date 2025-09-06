// curry: Permite aplicar parcialmente una función, retornando una nueva función hasta recibir todos los argumentos.
const curry = (fn) => {
    return (...args) => {
        if (args.length >= fn.length) {
            return fn(...args);
        }
        return (...next) => curry(fn)(...args, ...next);
    };
};

// compose: Composición de funciones de derecha a izquierda.
const compose = (...fns) => (x) => 
    fns.reduceRight((acc, fn) => fn(acc), x);

// map: Función que aplica una función a cada elemento de un array.
const map = (fn) => (array) => array.map(fn);

// filter: Función que filtra los elementos de un array según una condición.
const filter = (fn) => (array) => array.filter(fn);

// reduce: Función que reduce un array a un solo valor usando una función acumuladora y un valor inicial.
const reduce = (fn, initial) => (array) => 
    array.reduce(fn, initial);

// pipe: Composición de funciones de izquierda a derecha.
const pipe = (...fns) => (x) => 
    fns.reduce((acc, fn) => fn(acc), x);

// identity: Función identidad, retorna el mismo valor recibido.
const identity = (x) => x;

// prop: Obtiene una propiedad de un objeto
const prop = (key) => (obj) => obj[key];

// path: Obtiene una propiedad anidada de un objeto
const path = (keys) => (obj) => 
    keys.reduce((acc, key) => acc && acc[key], obj);

// pick: Selecciona propiedades específicas de un objeto
const pick = (keys) => (obj) => 
    keys.reduce((acc, key) => {
        if (obj.hasOwnProperty(key)) {
            acc[key] = obj[key];
        }
        return acc;
    }, {});

// omit: Excluye propiedades específicas de un objeto
const omit = (keys) => (obj) => 
    Object.keys(obj).reduce((acc, key) => {
        if (!keys.includes(key)) {
            acc[key] = obj[key];
        }
        return acc;
    }, {});

// merge: Combina dos objetos
const merge = (obj1) => (obj2) => ({ ...obj1, ...obj2 });

// assoc: Asigna una propiedad a un objeto
const assoc = (key) => (value) => (obj) => ({ ...obj, [key]: value });

// dissoc: Remueve una propiedad de un objeto
const dissoc = (key) => (obj) => {
    const { [key]: removed, ...rest } = obj;
    return rest;
};

// isNil: Verifica si un valor es null o undefined
const isNil = (x) => x == null;

// isEmpty: Verifica si un valor está vacío
const isEmpty = (x) => {
    if (isNil(x)) return true;
    if (typeof x === 'string' || Array.isArray(x)) return x.length === 0;
    if (typeof x === 'object') return Object.keys(x).length === 0;
    return false;
};

// not: Niega una función
const not = (fn) => (...args) => !fn(...args);

// when: Aplica una función si una condición es verdadera
const when = (predicate) => (fn) => (x) => 
    predicate(x) ? fn(x) : x;

// unless: Aplica una función si una condición es falsa
const unless = (predicate) => (fn) => (x) => 
    predicate(x) ? x : fn(x);

// tap: Ejecuta una función con un valor y retorna el valor original
const tap = (fn) => (x) => {
    fn(x);
    return x;
};

// tryCatch: Maneja errores en funciones
const tryCatch = (tryFn) => (catchFn) => (...args) => {
    try {
        return tryFn(...args);
    } catch (error) {
        return catchFn(error, ...args);
    }
};

// memoize: Memoiza el resultado de una función
const memoize = (fn) => {
    const cache = new Map();
    return (...args) => {
        const key = JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key);
        }
        const result = fn(...args);
        cache.set(key, result);
        return result;
    };
};

// debounce: Debounce una función
const debounce = (fn, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
};

// throttle: Throttle una función
const throttle = (fn, delay) => {
    let lastCall = 0;
    return (...args) => {
        const now = Date.now();
        if (now - lastCall >= delay) {
            lastCall = now;
            return fn(...args);
        }
    };
};

// all: Verifica si todos los elementos cumplen una condición
const all = (predicate) => (array) => array.every(predicate);

// any: Verifica si algún elemento cumple una condición
const any = (predicate) => (array) => array.some(predicate);

// find: Encuentra el primer elemento que cumple una condición
const find = (predicate) => (array) => array.find(predicate);

// findIndex: Encuentra el índice del primer elemento que cumple una condición
const findIndex = (predicate) => (array) => array.findIndex(predicate);

// head: Obtiene el primer elemento de un array
const head = (array) => array[0];

// tail: Obtiene todos los elementos excepto el primero
const tail = (array) => array.slice(1);

// last: Obtiene el último elemento de un array
const last = (array) => array[array.length - 1];

// init: Obtiene todos los elementos excepto el último
const init = (array) => array.slice(0, -1);

// take: Toma los primeros n elementos
const take = (n) => (array) => array.slice(0, n);

// drop: Elimina los primeros n elementos
const drop = (n) => (array) => array.slice(n);

// sort: Ordena un array
const sort = (comparator) => (array) => [...array].sort(comparator);

// reverse: Invierte un array
const reverse = (array) => [...array].reverse();

// uniq: Elimina duplicados de un array
const uniq = (array) => [...new Set(array)];

// flatten: Aplana un array anidado
const flatten = (array) => 
    array.reduce((acc, item) => 
        Array.isArray(item) ? [...acc, ...flatten(item)] : [...acc, item], 
    []);

// groupBy: Agrupa elementos por una clave
const groupBy = (keyFn) => (array) => 
    array.reduce((acc, item) => {
        const key = keyFn(item);
        acc[key] = acc[key] || [];
        acc[key].push(item);
        return acc;
    }, {});

// countBy: Cuenta elementos por una clave
const countBy = (keyFn) => (array) => 
    array.reduce((acc, item) => {
        const key = keyFn(item);
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});

// partition: Particiona un array en dos basado en una condición
const partition = (predicate) => (array) => 
    array.reduce((acc, item) => {
        acc[predicate(item) ? 0 : 1].push(item);
        return acc;
    }, [[], []]);

    // shuffleArray: Función que baraja un array utilizando el algoritmo Fisher-Yates
const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};
export default {
    curry,
    compose,
    map,
    filter,
    reduce,
    pipe,
    identity,
    prop,
    path,
    pick,
    omit,
    merge,
    assoc,
    dissoc,
    isNil,
    isEmpty,
    not,
    when,
    unless,
    tap,
    tryCatch,
    memoize,
    debounce,
    throttle,
    all,
    any,
    find,
    findIndex,
    head,
    tail,
    last,
    init,
    take,
    drop,
    sort,
    reverse,
    uniq,
    flatten,
    groupBy,
    countBy,
    partition,
    shuffleArray
};