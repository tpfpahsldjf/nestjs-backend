export type ResultType<T, E> =
  | { isOk: true; value: T }
  | { isOk: false; error: E };

export const Result = {
  ok<T, E = never>(value: T): ResultType<T, E> {
    return { isOk: true, value };
  },

  fail<T = never, E = string>(error: E): ResultType<T, E> {
    return { isOk: false, error };
  },
};
