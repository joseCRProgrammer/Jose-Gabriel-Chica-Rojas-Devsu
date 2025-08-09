import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, AsyncValidatorFn } from '@angular/forms';
import { Subscription, of, timer, switchMap, map, catchError } from 'rxjs';
import { Product } from '../../../core/models/product.model';
import { ButtonComponent } from '../button/button';

type Mode = 'create' | 'edit';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  templateUrl: './product-form.html',
  styleUrls: ['./product-form.scss']
})
export class ProductForm implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);

  @Input() mode: Mode = 'create';
  @Input() initial: Product | null = null;

  @Output() submitForm = new EventEmitter<Product>();
  @Output() resetForm = new EventEmitter<void>();

  form = this.fb.group({
    id: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(10), Validators.pattern(/^[a-z0-9-]+$/)]],
    name: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
    description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
    logo: ['', [Validators.required, this.urlValidator]],
    date_release: [null as string | null, [Validators.required, this.releaseTodayOrFuture.bind(this)]],
    date_revision: [{ value: null as string | null, disabled: true }, [Validators.required]]
  });

  private sub?: Subscription;

  ngOnInit(): void {
    if (this.initial) {
      this.form.patchValue({
        id: this.initial.id,
        name: this.initial.name,
        description: this.initial.description,
        logo: this.initial.logo,
        date_release: this.initial.date_release ?? null,
        date_revision: this.initial.date_revision ?? null,
      });
    }

    if (this.mode === 'edit') {
      this.form.get('id')?.disable();
    } else {
      this.form.get('id')?.updateValueAndValidity({ emitEvent: false });
    }

    this.sub = this.form.get('date_release')?.valueChanges.subscribe((val) => {
      const releaseIso = this.toIsoDate(val);
      if (!releaseIso) {
        this.form.get('date_revision')?.setValue(null, { emitEvent: false });
        return;
      }
      const revisionIso = this.plusOneYear(releaseIso);
      this.form.get('date_revision')?.setValue(revisionIso, { emitEvent: false });
      this.form.get('date_revision')?.setValidators([Validators.required, this.exactPlusOneYearValidator(releaseIso)]);
      this.form.get('date_revision')?.updateValueAndValidity({ emitEvent: false });
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private urlValidator(control: AbstractControl): ValidationErrors | null {
    const v = (control.value ?? '').toString().trim();
    if (!v) return null;
    try { new URL(v); return null; } catch { return { url: true }; }
  }

  private releaseTodayOrFuture(control: AbstractControl): ValidationErrors | null {
    const iso = this.toIsoDate(control.value);
    if (!iso) return null;
    const d = this.utcFromIso(iso);
    const todayIso = this.toIsoDate(new Date());
    const today = this.utcFromIso(todayIso);
    return d < today ? { pastDate: true } : null;
  }

  private exactPlusOneYearValidator(releaseIso: string) {
    return (control: AbstractControl): ValidationErrors | null => {
      const revIso = this.toIsoDate(control.value);
      if (!revIso) return null;
      const expected = this.plusOneYear(releaseIso);
      return revIso === expected ? null : { notPlusOneYear: true };
    };
  }


  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue() as any;
    const payload: Product = {
      id: raw.id,
      name: raw.name,
      description: raw.description,
      logo: raw.logo,
      date_release: this.toIsoDate(raw.date_release),
      date_revision: this.toIsoDate(raw.date_revision)
    };

    this.submitForm.emit(payload);
  }

  onReset() {
    this.form.reset();
    this.resetForm.emit();
  }

  private toIsoDate(v: any): string {
    if (!v) return '';
    if (v instanceof Date) {
      const yyyy = v.getFullYear();
      const mm = String(v.getMonth() + 1).padStart(2, '0');
      const dd = String(v.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }
    if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
    const d = new Date(v);
    if (isNaN(+d)) return '';
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private utcFromIso(iso: string): Date {
    const [y, m, d] = iso.split('-').map(n => +n);
    return new Date(Date.UTC(y, m - 1, d));
  }

  private plusOneYear(iso: string): string {
    const [y, m, d] = iso.split('-').map(n => +n);
    const dt = new Date(Date.UTC(y + 1, m - 1, d));
    const yyyy = dt.getUTCFullYear();
    const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(dt.getUTCDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
