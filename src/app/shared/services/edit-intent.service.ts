import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class EditIntentService {
  private store = new Map<string, { id: string; exp: number }>();
  private ttlMs = 60_000;

  /** Genera un token de un solo uso para editar un id */
  allowOnce(id: string): string {
    const token = cryptoRandom();
    const exp = Date.now() + this.ttlMs;
    this.store.set(token, { id, exp });
    return token;
  }

  /** Valida el token y lo consume (borra). Devuelve true si es válido para ese id. */
  validateAndConsume(id: string, token: string | null | undefined): boolean {
    if (!token) return false;
    const rec = this.store.get(token);
    this.store.delete(token);
    if (!rec) return false;
    if (rec.id !== id) return false;
    if (Date.now() > rec.exp) return false;
    return true;
  }
}

// Utilidad: token aleatorio
function cryptoRandom(): string {
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
  }
  // fallback
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}
