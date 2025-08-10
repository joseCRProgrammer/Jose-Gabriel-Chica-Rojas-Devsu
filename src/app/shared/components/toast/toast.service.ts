import { Injectable, signal } from '@angular/core';
import { ToastMessage } from './toast.model';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _messages = signal<ToastMessage[]>([]);
  readonly messages = this._messages.asReadonly();

  private idCounter = 0;

  show(type: ToastMessage['type'], message: string, timeout = 3000) {
    const id = ++this.idCounter;
    const toast: ToastMessage = { id, type, message, timeout };
    this._messages.update(list => [...list, toast]);

    if (timeout > 0) {
      setTimeout(() => this.remove(id), timeout);
    }
  }

  success(msg: string, timeout = 3000) {
    this.show('success', msg, timeout);
  }
  error(msg: string, timeout = 3000) {
    this.show('error', msg, timeout);
  }
  warning(msg: string, timeout = 3000) {
    this.show('warning', msg, timeout);
  }
  info(msg: string, timeout = 3000) {
    this.show('info', msg, timeout);
  }

  remove(id: number) {
    this._messages.update(list => list.filter(t => t.id !== id));
  }
}
