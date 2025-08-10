import { TestBed } from '@angular/core/testing';
import { ProductForm } from './product-form';
import { FormControl, AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';

describe('ProductForm (fechas como string)', () => {
    let component: ProductForm;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ProductForm],
        })
            .overrideComponent(ProductForm, { set: { template: '' } })
            .compileComponents();

        const fixture = TestBed.createComponent(ProductForm);
        component = fixture.componentInstance;
    });

    function iso(d: Date): string {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    function setFormValues(values: Partial<{
        id: any; name: any; description: any; logo: any;
        date_release: any; date_revision: any;
    }>) {
        const f = component.form;
        if (values.id !== undefined) f.get('id')!.setValue(values.id);
        if (values.name !== undefined) f.get('name')!.setValue(values.name);
        if (values.description !== undefined) f.get('description')!.setValue(values.description);
        if (values.logo !== undefined) f.get('logo')!.setValue(values.logo);
        if (values.date_release !== undefined) f.get('date_release')!.setValue(values.date_release);
        if (values.date_revision !== undefined) f.get('date_revision')!.setValue(values.date_revision);
    }

    it('debe crearse', () => {
        expect(component).toBeTruthy();
        expect(component.form.get('id')!.enabled).toBe(true);
        expect(component.form.get('date_revision')!.disabled).toBe(true);
    });

    describe('ngOnInit()', () => {
        it('carga valores initial si están definidos', () => {
            component.initial = {
                id: 'trj-crd',
                name: 'Tarjeta Gold',
                description: 'Desc de prueba 12345',
                logo: 'https://dominio/logo.png',
                date_release: '2025-01-01',
                date_revision: '2026-01-01',
            } as any;

            component.ngOnInit();

            expect(component.form.get('id')!.value).toBe('trj-crd');
            expect(component.form.get('name')!.value).toBe('Tarjeta Gold');
            expect(component.form.get('logo')!.value).toBe('https://dominio/logo.png');
            expect(component.form.get('date_release')!.value).toBe('2025-01-01');
            expect(component.form.get('date_revision')!.value).toBe('2026-01-01');
        });

        it('deshabilita id en modo edit; mantiene habilitado en create', () => {
            component.mode = 'create';
            component.ngOnInit();
            expect(component.form.get('id')!.enabled).toBe(true);

            const fixture2 = TestBed.createComponent(ProductForm);
            const comp2 = fixture2.componentInstance;
            comp2.mode = 'edit';
            comp2.ngOnInit();
            expect(comp2.form.get('id')!.disabled).toBe(true);
        });

        it('suscribe a cambios de date_release y calcula date_revision (+1 año) con validador exacto', () => {
            component.mode = 'create';
            component.ngOnInit();

            component.form.get('date_release')!.setValue('');
            expect(component.form.get('date_revision')!.value).toBeNull();

            component.form.get('date_release')!.setValue('2024-02-29');
            const rev = component.form.get('date_revision')!;
            expect(rev.value).toBe('2025-03-01');
            expect(rev.errors).toBeNull();
        });
    });

    describe('ngOnDestroy()', () => {
        it('desuscribe si existe suscripción', () => {
            component.ngOnInit();
            const mockSub = new Subscription();
            const spy = jest.spyOn(mockSub, 'unsubscribe');
            (component as any).sub = mockSub;

            component.ngOnDestroy();
            expect(spy).toHaveBeenCalled();
        });

        it('no falla si no hay suscripción', () => {
            (component as any).sub = undefined;
            expect(() => component.ngOnDestroy()).not.toThrow();
        });
    });

    describe('validadores y utilidades', () => {
        it('urlValidator: válido con URL bien formada; inválido con string inválido; null si vacío', () => {
            const ctrl = new FormControl('');
            let r = (component as any).urlValidator(ctrl as AbstractControl);
            expect(r).toBeNull();

            ctrl.setValue('https://example.com/img.png');
            r = (component as any).urlValidator(ctrl);
            expect(r).toBeNull();

            ctrl.setValue('no-es-url');
            r = (component as any).urlValidator(ctrl);
            expect(r).toEqual({ url: true });
        });

        it('releaseTodayOrFuture: string hoy o futuro válido; pasado inválido', () => {
            const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
            const today = new Date();
            const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);

            const ctrlPast = new FormControl(iso(yesterday));
            const ctrlToday = new FormControl(iso(today));
            const ctrlFuture = new FormControl(iso(tomorrow));

            const pastErr = (component as any).releaseTodayOrFuture(ctrlPast as AbstractControl);
            const todayErr = (component as any).releaseTodayOrFuture(ctrlToday as AbstractControl);
            const futureErr = (component as any).releaseTodayOrFuture(ctrlFuture as AbstractControl);

            expect(pastErr).toEqual({ pastDate: true });
            expect(todayErr).toBeNull();
            expect(futureErr).toBeNull();
        });

        it('exactPlusOneYearValidator: acepta solo la fecha exacta +1 año (strings)', () => {
            const releaseIso = '2024-01-31';
            const validator = (component as any).exactPlusOneYearValidator(releaseIso) as (c: AbstractControl) => any;

            const ok = new FormControl('2025-01-31');
            const fail = new FormControl('2025-02-01');

            expect(validator(ok)).toBeNull();
            expect(validator(fail)).toEqual({ notPlusOneYear: true });
        });

        it('helpers: plusOneYear/utcFromIso/toIsoDate con strings', () => {
            const toIso = (component as any).toIsoDate.bind(component) as (v: any) => string;
            const utcFrom = (component as any).utcFromIso.bind(component) as (iso: string) => Date;
            const plusYear = (component as any).plusOneYear.bind(component) as (iso: string) => string;

            expect(toIso('2025-08-10')).toBe('2025-08-10');
            expect(plusYear('2024-02-29')).toBe('2025-03-01');

            const dt = utcFrom('2025-01-02');
            expect(dt.getUTCFullYear()).toBe(2025);
            expect(dt.getUTCMonth()).toBe(0);
            expect(dt.getUTCDate()).toBe(2);
        });
    });

    describe('onSubmit()', () => {
        it('si el formulario es inválido, marca todo como touched y no emite', () => {
            const markSpy = jest.spyOn(component.form, 'markAllAsTouched');
            const emitSpy = jest.spyOn(component.submitForm, 'emit');

            component.onSubmit();

            expect(markSpy).toHaveBeenCalled();
            expect(emitSpy).not.toHaveBeenCalled();
        });

        it('si es válido, emite payload con fechas string ISO', () => {
            component.mode = 'create';
            component.ngOnInit();

            setFormValues({
                id: 'abc-123',
                name: 'Nombre Producto',
                description: 'Descripción válida de más de 10 chars',
                logo: 'https://example.com/logo.png',
            });

            const future = new Date();
            future.setUTCDate(future.getUTCDate() + 30);
            const yyyy = future.getUTCFullYear();
            const mm = String(future.getUTCMonth() + 1).padStart(2, '0');
            const dd = String(future.getUTCDate()).padStart(2, '0');
            const releaseIso = `${yyyy}-${mm}-${dd}`;

            component.form.get('date_release')!.setValue(releaseIso);

            const revCtrl = component.form.get('date_revision')!;
            revCtrl.enable({ emitEvent: false });

            const expectedRevision = (component as any).plusOneYear(releaseIso);

            expect(revCtrl.value).toBe(expectedRevision);

            component.form.updateValueAndValidity({ onlySelf: false, emitEvent: false });

            expect(component.form.valid).toBe(true);

            const emitSpy = jest.spyOn(component.submitForm, 'emit');

            component.onSubmit();

            expect(emitSpy).toHaveBeenCalledTimes(1);
            const payload = emitSpy.mock.calls[0][0];

            expect(payload).toEqual({
                id: 'abc-123',
                name: 'Nombre Producto',
                description: 'Descripción válida de más de 10 chars',
                logo: 'https://example.com/logo.png',
                date_release: releaseIso,
                date_revision: expectedRevision,
            });
        });

    });

    describe('onReset()', () => {
        it('en create: limpia todo y deshabilita date_revision', () => {
            component.mode = 'create';
            component.ngOnInit();

            setFormValues({
                id: 'abc-123',
                name: 'Nombre Producto',
                description: 'Descripción válida de más de 10 chars',
                logo: 'https://cdn/logo.png',
                date_release: '2025-01-10',
            });

            Object.values(component.form.controls).forEach(c => { c.markAsDirty(); c.markAsTouched(); });
            const emitSpy = jest.spyOn(component.resetForm, 'emit');

            component.onReset();

            expect(component.form.get('id')!.value).toBe('');
            expect(component.form.get('name')!.value).toBe('');
            expect(component.form.get('description')!.value).toBe('');
            expect(component.form.get('logo')!.value).toBe('');
            expect(component.form.get('date_release')!.value).toBeNull();
            expect(component.form.get('date_revision')!.value).toBeNull();
            expect(component.form.get('date_revision')!.disabled).toBe(true);

            Object.values(component.form.controls).forEach(c => {
                expect(c.pristine).toBe(true);
                expect(c.touched).toBe(false);
            });

            expect(emitSpy).toHaveBeenCalled();
        });

        it('en edit: conserva id deshabilitado y limpia los demás campos', () => {
            component.mode = 'edit';
            component.initial = {
                id: 'keep-id',
                name: 'X',
                description: 'Y',
                logo: 'https://x/y.png',
                date_release: '2020-01-01',
                date_revision: '2021-01-01',
            } as any;

            component.ngOnInit();

            setFormValues({
                name: 'Modificado',
                description: 'Modificado desc',
                logo: 'https://otro/logo.png',
                date_release: '2028-12-31',
                date_revision: '2029-12-31',
            });

            const emitSpy = jest.spyOn(component.resetForm, 'emit');
            component.onReset();

            const idCtrl = component.form.get('id')!;
            expect(idCtrl.disabled).toBe(true);
            expect(idCtrl.value).toBe('keep-id');

            expect(component.form.get('name')!.value).toBe('');
            expect(component.form.get('description')!.value).toBe('');
            expect(component.form.get('logo')!.value).toBe('');
            expect(component.form.get('date_release')!.value).toBeNull();
            expect(component.form.get('date_revision')!.value).toBeNull();
            expect(component.form.get('date_revision')!.disabled).toBe(true);

            ['name', 'description', 'logo', 'date_release', 'date_revision'].forEach(k => {
                const c = component.form.get(k)!;
                expect(c.pristine).toBe(true);
                expect(c.touched).toBe(false);
            });

            expect(emitSpy).toHaveBeenCalled();
        });
    });

    describe('reglas de validación del formulario (conjunto)', () => {
        it('id requerido, [3..10], patrón ^[a-z0-9-]+$', () => {
            const id = component.form.get('id')!;
            id.setValue('');
            expect(id.hasError('required')).toBe(true);

            id.setValue('ab');
            expect(id.hasError('minlength')).toBe(true);

            id.setValue('a'.repeat(11));
            expect(id.hasError('maxlength')).toBe(true);

            id.setValue('ABC');
            expect(id.hasError('pattern')).toBe(true);

            id.setValue('abc-123');
            expect(id.valid).toBe(true);
        });

        it('name requerido, [5..100]', () => {
            const c = component.form.get('name')!;
            c.setValue('');
            expect(c.hasError('required')).toBe(true);

            c.setValue('abcd');
            expect(c.hasError('minlength')).toBe(true);

            c.setValue('a'.repeat(101));
            expect(c.hasError('maxlength')).toBe(true);

            c.setValue('válido ok');
            expect(c.valid).toBe(true);
        });

        it('description requerido, [10..200]', () => {
            const c = component.form.get('description')!;
            c.setValue('');
            expect(c.hasError('required')).toBe(true);

            c.setValue('corto');
            expect(c.hasError('minlength')).toBe(true);

            c.setValue('a'.repeat(201));
            expect(c.hasError('maxlength')).toBe(true);

            c.setValue('Descripción adecuada');
            expect(c.valid).toBe(true);
        });

        it('logo requerido y url válida', () => {
            const c = component.form.get('logo')!;
            c.setValue('');
            expect(c.hasError('required')).toBe(true);

            c.setValue('no-url');
            expect(c.hasError('url')).toBe(true);

            c.setValue('http://dominio.com/img.png');
            expect(c.valid).toBe(true);
        });

        it('date_release requerido y no permite pasado (strings)', () => {
            const c = component.form.get('date_release')!;
            c.setValue(null);
            expect(c.hasError('required')).toBe(true);

            const past = new Date(); past.setDate(past.getDate() - 2);
            c.setValue(iso(past));
            expect(c.hasError('pastDate')).toBe(true);

            const today = new Date();
            c.setValue(iso(today));
            expect(c.errors).toBeNull();
        });

        it('date_revision requerido y exacto +1 año (cuando está habilitado)', () => {
            component.ngOnInit();
            const rls = component.form.get('date_release')!;
            const rev = component.form.get('date_revision')!;

            rls.setValue('2023-08-10');
            expect(rev.disabled).toBe(true);
            rev.enable({ emitEvent: false });

            rev.setValue('2024-08-10');
            expect(rev.errors).toBeNull();

            rev.setValue('2024-08-11');
            expect(rev.hasError('notPlusOneYear')).toBe(true);
        });
    });
});
