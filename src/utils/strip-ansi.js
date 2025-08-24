// вспомогательная функция для удаления ANSI escape-кодов (цветов)
// eslint-disable-next-line no-control-regex
export const stripAnsi = str => str.replace(/\x1b\[[0-9;]*m/g, '');
