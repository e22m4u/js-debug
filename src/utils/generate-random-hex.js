/**
 * Генерирует случайную шестнадцатеричную строку,
 * где первый символ не является цифрой.
 *
 * @param {number} length
 * @returns {string}
 */
export function generateRandomHex(length = 4) {
  // обеспечиваем, что длина не меньше 1, иначе логика не имеет смысла,
  // возвращаем пустую строку для длины 0 или меньше, что соответствует
  // общим практикам
  if (length <= 0) {
    return '';
  }
  // кандидаты для первого символа (без цифр)
  const firstCharCandidates = 'abcdef';
  // кандидаты для остальных символов
  const restCharCandidates = '0123456789abcdef';
  let result = '';
  // генерируем первый символ (должен быть буквой)
  const firstCharIndex = Math.floor(Math.random() * firstCharCandidates.length);
  result += firstCharCandidates[firstCharIndex];
  // генерируем остальные символы (могут быть цифры или буквы)
  // цикл выполняется length - 1 раз, так как первый символ уже сгенерирован
  for (let i = 1; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * restCharCandidates.length);
    result += restCharCandidates[randomIndex];
  }
  return result;
}
