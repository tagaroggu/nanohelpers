# Nanohelpers
Small utility functions for nanostores

## Features
- Transform a store into an atom
- Use atoms and stores in a signal-and-effect style
- Use atoms in a similar fashion to signals in `solid-js`

## Signal and Effect-style Nanostores
With the functions `effect` and `use` (or `$`), Nanostores can be used in a similar manner to signals in many popular libraries/frameworks. 
```js
import { atom } from 'nanostores';
import { effect, use } from 'nanohelpers'; // `$` does the same thing as `use`

const count = atom(0);

const s = atom.subscribe((value) => {
    console.log('Subscription: ', value);
});

// "Subscription: 0"

const e = effect(() => {
    console.log('Effect: ', use(count)); // `use` returns the value of the atom
});

// "Effect: 0"

count.set(1);
// "Subscription: 1"
// "Effect: 1"
count.set(2);
// "Subscription: 2"
// "Effect: 2"
count.set(3);
// "Subscription: 3"
// "Effect: 3"

e();

count.set(4);
// "Subscription: 4"
```

`solid-js`-style:
```js
import { atom } from 'nanostores';
import { solidify, effect } from 'nanohelpers';

const [getter, setter] = solidify(atom(0));

effect(() => {
    console.log(getter());
});
// 0

setter(1);
// 1
```
