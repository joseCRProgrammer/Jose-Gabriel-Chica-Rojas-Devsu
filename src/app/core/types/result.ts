// core/types/result.ts
export type Ok<T> = { ok: true; value: T };
export type Err<E = Object> = { ok: false; error: E };
export type Result<T, E = string> = Ok<T> | Err<E>;

export const ok = <T>(value: T): Ok<T> => ({ ok: true, value });
export const err = <E = Object>(error: E): Err<E> => ({ ok: false, error });

export const isOk  = <T, E>(r: Result<T, E>): r is Ok<T>  => r.ok === true;
export const isErr = <T, E>(r: Result<T, E>): r is Err<E> => r.ok === false;
