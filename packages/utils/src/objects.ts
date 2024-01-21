// https://stackoverflow.com/a/25456134/13928742
export function deepEqual(
  a: unknown,
  b: unknown,
) {
  if (a === b) {
    return true
  } else if (
    (typeof a === 'object' && a != null)
    && (typeof b === 'object' && b != null)
  ) {
    if (Object.keys(a).length !== Object.keys(b).length) {
      return false
    }

    for (const prop in a) {
      if (Object.prototype.hasOwnProperty.call(b, prop)) {
        if (!deepEqual((a as any)[prop], (b as any)[prop])) {
          return false
        }
      } else {
        return false
      }
    }

    return true
  } else {
    return false
  }
}
