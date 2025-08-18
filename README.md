## @e22m4u/js-debug

Утилита вывода сообщений отладки для JavaScript.
      
## Содержание

* [Установка](#установка)
* [Использование](#использование)
* [Управление выводом](#управление-выводом)
  * [Node.js: Переменная окружения DEBUG](#nodejs-переменная-окружения-debug)
  * [Браузер: localStorage.debug](#браузер-localstoragedebug)
  * [Синтаксис паттернов](#синтаксис-паттернов)
* [Тесты](#тесты)
* [Лицензия](#лицензия)

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

## Использование

Интерполяция строк (см. спецификаторы [@e22m4u/js-format](https://www.npmjs.com/package/@e22m4u/js-format)).

```js
import {createDebugger} from '@e22m4u/js-debug';

const debug = createDebugger();
debug('Got value %v.', 100);
debug('Got values %l.', ['foo', 10, true]);
// Got value 100.
// Got values "foo", 10, true.
```

Дамп значений.

```js
import {createDebugger} from '@e22m4u/js-debug';

const debug = createDebugger();
// используется метод inspect
debug.inspect({
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

Заголовочное сообщение над дампом.

```js
import {createDebugger} from '@e22m4u/js-debug';

const debug = createDebugger();
// заголовочное сообщение передается
// в метод inspect первым аргументом
debug.inspect('Order details:', {
  orderId: 988,
  date: '2023-10-27',
  totalAmount: 120.50,
});

// Order details:
//   {
//     orderId: 988,
//     date: '2023-10-27',
//     totalAmount: 120.50,
//   }
```

Определение пространства имен.

```js
import {createDebugger} from '@e22m4u/js-debug';

// вызов createDebugger() без аргументов создает
// отладчик с пустым пространством имен
const debug1 = createDebugger();

// пространство имен можно передать в первом
// аргументе фабрики, как это показано ниже
const debug2 = createDebugger('myApp');
const debug3 = createDebugger('myApp', 'myService');
const debug4 = createDebugger('myApp:myService');
debug1('Hello world');
debug2('Hello world');
debug3('Hello world');
// myApp Hello world
// myApp:myService Hello world
// myApp:myService Hello world
```

Использование пространства имен из переменной окружения `DEBUGGER_NAMESPACE`.

```js
import {createDebugger} from '@e22m4u/js-debug';

process.env['DEBUGGER_NAMESPACE'] = 'myApp';

const debug = createDebugger();
debug('Hello world');
// myApp Hello world
```

Исключение переменной окружения `DEBUGGER_NAMESPACE` из пространства имен.

```js
import {createDebugger} from '@e22m4u/js-debug';

process.env['DEBUGGER_NAMESPACE'] = 'myApp';

const debug1 = createDebugger();
const debug2 = debug1.withoutEnvNs();
debug1('Hello world');
debug2('Hello world');
// myApp Hello world
// Hello world
```

Расширение сегментов пространства имен.

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
// r34s Hi Tommy

const debug2 = createDebugger().withHash();
debug2('Hi John');
debug2('Hi Tommy');
// ier0 Hi John
// ier0 Hi Tommy
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
const debug4 = createDebugger('myApp').withOffset(3);
debug1('Hello world');
debug2('Hello world');
debug3('Hello world');
debug4('Hello world');
// Hello world
//    Hello world
//        Hello world
// myApp       Hello world
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

debug('Iterating over %v participants.', 10);
debugWo1('Looking for contacts of %v participant.', 1);
debugWo1.inspect('Participant contacts found:', contact);

// myApp:myService:o3pk Iterating over 10 participants.
// myApp:myService:o3pk   Looking for contacts of 1 participant.
// myApp:myService:o3pk   Participant contacts found:
// myApp:myService:o3pk     {
// myApp:myService:o3pk       email: 'john.doe@example.com',
// myApp:myService:o3pk       phone: {
// myApp:myService:o3pk         mobile: '+1-555-123-4567',
// myApp:myService:o3pk         home: '+1-555-987-6543'
// myApp:myService:o3pk       },
// myApp:myService:o3pk     }
```

## Управление выводом

По умолчанию вызовы функции `debug` ничего не выводят. Чтобы увидеть отладочные
сообщения, необходимо указать, какие именно пространства имен вас интересуют.
Это делается с помощью специального паттерна (шаблона). Механизм включения
зависит от среды выполнения.

### Node.js: Переменная окружения `DEBUG`

В среде Node.js используется переменная окружения DEBUG. Вы можете установить
её при запуске вашего скрипта.

```bash
# включить конкретное пространство имен
DEBUG=myApp node your_script.js

# включить все пространства имен, начинающиеся с 'myApp:'
DEBUG=myApp:* node your_script.js

# включить несколько пространств имен через запятую
DEBUG=myApp:service,lib:utils node your_script.js
# если используете пробелы, нужны кавычки
DEBUG="myApp:service lib:utils" node your_script.js

# включить ВСЕ пространства имен
DEBUG=* node your_script.js
```

### Браузер: localStorage.debug

В веб-браузерах для управления выводом используется ключ debug в localStorage.
Вы можете установить его значение через консоль разработчика.

```js
// включить конкретное пространство имен
localStorage.debug = 'myApp';

// включить все пространства имен, начинающиеся с 'myApp:'
localStorage.debug = 'myApp:*';

// включить несколько (через запятую или пробел)
localStorage.debug = 'myApp:service,lib:utils';
// или
localStorage.debug = 'myApp:service lib:utils';

// включить ВСЕ
localStorage.debug = '*';

// отключить вывод
localStorage.removeItem('debug');
// или
localStorage.debug = '';
```

*i. После изменения `localStorage.debug` обычно требуется перезагрузить
страницу, чтобы изменения вступили в силу.*

### Синтаксис паттернов

- Точное совпадение (например, `myApp:myService`);
- Wildcard (\*): `myApp*` соответствует `myApp`, `myApp:myService` и т.д.;
- Несколько паттернов можно указать разделив из запятой или пробелом;
- Включить всё: `*` включает вывод для всех пространств имен;

Примеры шаблонов в окружении Node.js:

```bash
node main.js # ничего не выведет
DEBUG=* node main.js # выведет все сообщения
DEBUG=app node main.js # только пространство имен app
DEBUG=app:* node main.js # пространства имен с префиксом app:
DEBUG=app:worker,legacy node main.js # только app:worker и legacy
```

## Тесты

```bash
npm run test
```

## Лицензия

MIT
