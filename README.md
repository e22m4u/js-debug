## @e22m4u/js-debug

Утилита вывода сообщений отладки для JavaScript.

## Установка

```bash
npm install @e22m4u/js-debug
```

Поддержка ESM и CommonJS стандартов.

*ESM*

```js
import {createDebugger} from '@e22m4u/js-debug';
```

*CommonJS*

```js
const {createDebugger} = require('@e22m4u/js-debug');
```

## Примеры

Интерполяция строк (см. спецификаторы [@e22m4u/js-format](https://www.npmjs.com/package/@e22m4u/js-format)).

```js
import {createDebugger} from '@e22m4u/js-debug';

const debug = createDebugger();
debug('Получено значение %v.', 100);
debug('Получены значения %l.', ['foo', 10, true]);
// Получено значение 100.
// Получены значения "foo", 10, true.
```

Вывод содержания объекта.

```js
import {createDebugger} from '@e22m4u/js-debug';

const debug = createDebugger();
debug({
  email: 'john.doe@example.com',
  phone: {
    mobile: '+1-555-123-4567',
    home: '+1-555-987-6543'
  },
});
// {
//   email: 'john.doe@example.com',
//   phone: {
//     mobile: '+1-555-123-4567',
//     home: '+1-555-987-6543'
//   }
// }
```

Вывод описания объекта.

```js
import {createDebugger} from '@e22m4u/js-debug';

const debug = createDebugger();
debug({
  orderId: 988,
  date: '2023-10-27',
  totalAmount: 120.50,
}, 'Детали заказа:');

// Детали заказа:
// {
//   orderId: 988,
//   date: '2023-10-27',
//   totalAmount: 120.50,
// }
```

Определение пространства имен.

```js
import {createDebugger} from '@e22m4u/js-debug';

const debug = createDebugger('myApp');
debug('Hello world');
// myApp Hello world
```

Использование пространства имен из переменной окружения.

```js
import {createDebugger} from '@e22m4u/js-debug';

process.env['DEBUGGER_NAMESPACE'] = 'myApp';

const debug = createDebugger();
debug('Hello world');
// myApp Hello world
```

Расширение пространства имен.

```js
import {createDebugger} from '@e22m4u/js-debug';

const debug1 = createDebugger();
const debug2 = debug1.withNs('myApp');
const debug3 = debug2.withNs('myService');
debug1('Hello world');
debug2('Hello world');
debug3('Hello world');
// Hello world
// myApp Hello world
// myApp:myService Hello world
```

Использование статичного хэша.

```js
import {createDebugger} from '@e22m4u/js-debug';

const debug1 = createDebugger().withHash();
debug1('Hi John');
debug1('Hi Tommy');
// r34s Hi John
// r34s Hi John

const debug2 = createDebugger().withHash();
debug2('Hi John');
debug2('Hi Tommy');
// ier0 Hi John
// ier0 Hi John
```

Определение длины хэша.

```js
import {createDebugger} from '@e22m4u/js-debug';

const debug = createDebugger().withHash(15);
debug('Hi John');
debug('Hi Tommy');
// we1gf4uyc4dj8f0 Hi John
// we1gf4uyc4dj8f0 Hi Tommy
```

Использование смещений.

```js
import {createDebugger} from '@e22m4u/js-debug';

const debug1 = createDebugger().withOffset(1);
const debug2 = createDebugger().withOffset(2);
const debug3 = createDebugger().withOffset(3);
debug1('Hello world');
debug2('Hello world');
debug3('Hello world');
// Hello world
//    Hello world
//        Hello world
```

Комбинирование методов.

```js
import {createDebugger} from '@e22m4u/js-debug';

const debug = createDebugger('myApp').withNs('myService').withHash();
const debugWo1 = debug.withOffset(1);

const contact = {
  email: 'john.doe@example.com',
  phone: {
    mobile: '+1-555-123-4567',
    home: '+1-555-987-6543'
  },
}

debug('Обход участников программы.');
debugWo1('Проверка контактов %v-го участника.', 1);
debugWo1(contact, 'Контакты участника:');

// myApp:myService:o3pk Обход участников программы.
// myApp:myService:o3pk   Проверка контактов 1-го участника.
// myApp:myService:o3pk   Контакт участника:
// myApp:myService:o3pk   {
// myApp:myService:o3pk     email: 'john.doe@example.com',
// myApp:myService:o3pk     phone: {
// myApp:myService:o3pk       mobile: '+1-555-123-4567',
// myApp:myService:o3pk       home: '+1-555-987-6543'
// myApp:myService:o3pk     },
// myApp:myService:o3pk   }
```

## Тесты

```bash
npm run test
```

## Лицензия

MIT
