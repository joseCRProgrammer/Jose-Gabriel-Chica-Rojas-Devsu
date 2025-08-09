export interface ToastMessage {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timeout?: number; // ms
}
