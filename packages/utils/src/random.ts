export function randomInt(
  min: number,
  max: number,
) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function randomString(
  alphabet: string,
  length: number,
) {
  let result = ''
  for (let i = 0; i < length; i++) {
    result += alphabet.charAt(randomInt(0, alphabet.length - 1))
  }
  return result
}
