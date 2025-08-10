import { CreateProductUseCase } from './create-product.usecase';
import { DeleteProductUseCase } from './delete-product.usecase';
import { LoadAllProductsUseCase } from './load-all-products.usecase';
import { UpdateProductUseCase } from './update-product.usecase';
import { VerifyIdUseCase } from './verify-id.usecase';

type Product = {
  id: string;
  name: string;
  description: string;
  logo: string;
  date_release: string;
  date_revision: string;
};

type Ok<T> = { ok: true; value: T };
type Err = { ok: false; reason?: any };
type Result<T> = Ok<T> | Err;

describe('Use Cases', () => {
  const product = (): Product => ({
    id: 'trj-crd',
    name: 'Tarjeta de Crédito',
    description: 'Producto financiero',
    logo: 'https://logo.png',
    date_release: '2025-08-10',
    date_revision: '2026-08-10',
  });

  const repoMock = () => ({
    create: jest.fn(),
    remove: jest.fn(),
    listAll: jest.fn(),
    update: jest.fn(),
    verifyId: jest.fn(),
  });

  describe('CreateProductUseCase', () => {
    it('debe delegar a repo.create y propagar el Result (OK)', async () => {
      const repo = repoMock();
      const uc = new CreateProductUseCase(repo as any);
      const resOk: Ok<Product> = { ok: true, value: product() };
      repo.create.mockResolvedValue(resOk);

      const res = await uc.execute(product());

      expect(repo.create).toHaveBeenCalledWith(product());
      expect(res).toBe(resOk);
    });

    it('debe propagar el Result (Err)', async () => {
      const repo = repoMock();
      const uc = new CreateProductUseCase(repo as any);
      const resErr: Err = { ok: false, reason: 'dup-id' };
      repo.create.mockResolvedValue(resErr);

      const res = await uc.execute(product());

      expect(repo.create).toHaveBeenCalledWith(product());
      expect(res).toBe(resErr);
    });
  });

  describe('DeleteProductUseCase', () => {
    it('debe delegar a repo.remove y propagar (OK)', async () => {
      const repo = repoMock();
      const uc = new DeleteProductUseCase(repo as any);
      const resOk: Ok<void> = { ok: true, value: undefined };
      repo.remove.mockResolvedValue(resOk);

      const res = await uc.execute('trj-crd');

      expect(repo.remove).toHaveBeenCalledWith('trj-crd');
      expect(res).toBe(resOk);
    });

    it('debe propagar (Err)', async () => {
      const repo = repoMock();
      const uc = new DeleteProductUseCase(repo as any);
      const resErr: Err = { ok: false, reason: 'not-found' };
      repo.remove.mockResolvedValue(resErr);

      const res = await uc.execute('trj-crd');

      expect(repo.remove).toHaveBeenCalledWith('trj-crd');
      expect(res).toBe(resErr);
    });
  });

  describe('LoadAllProductsUseCase', () => {
    it('debe delegar a repo.listAll y propagar (OK)', async () => {
      const repo = repoMock();
      const uc = new LoadAllProductsUseCase(repo as any);
      const list = [product(), { ...product(), id: 'p2' }];
      const resOk: Ok<Product[]> = { ok: true, value: list };
      repo.listAll.mockResolvedValue(resOk);

      const res = await uc.execute();

      expect(repo.listAll).toHaveBeenCalledWith();
      expect(res).toBe(resOk);
    });

    it('debe propagar (Err)', async () => {
      const repo = repoMock();
      const uc = new LoadAllProductsUseCase(repo as any);
      const resErr: Err = { ok: false, reason: 'network' };
      repo.listAll.mockResolvedValue(resErr);

      const res = await uc.execute();

      expect(repo.listAll).toHaveBeenCalledWith();
      expect(res).toBe(resErr);
    });
  });

  describe('UpdateProductUseCase', () => {
    it('debe delegar a repo.update(id, body) y propagar (OK)', async () => {
      const repo = repoMock();
      const uc = new UpdateProductUseCase(repo as any);

      const id = 'trj-crd';
      const body = {
        name: 'Nuevo',
        description: 'Desc',
        logo: 'https://logo2.png',
        date_release: '2025-09-01',
        date_revision: '2026-09-01',
      };
      const updated: Product = { id, ...body };
      const resOk: Ok<Product> = { ok: true, value: updated };

      repo.update.mockResolvedValue(resOk);

      const res = await uc.execute(id, body);

      expect(repo.update).toHaveBeenCalledWith(id, body);
      expect(res).toBe(resOk);
    });

    it('debe propagar (Err)', async () => {
      const repo = repoMock();
      const uc = new UpdateProductUseCase(repo as any);

      const id = 'trj-crd';
      const body = {
        name: 'Nuevo',
        description: 'Desc',
        logo: 'https://logo2.png',
        date_release: '2025-09-01',
        date_revision: '2026-09-01',
      };
      const resErr: Err = { ok: false, reason: 'conflict' };

      repo.update.mockResolvedValue(resErr);

      const res = await uc.execute(id, body);

      expect(repo.update).toHaveBeenCalledWith(id, body);
      expect(res).toBe(resErr);
    });
  });

  describe('VerifyIdUseCase', () => {
    it('debe delegar a repo.verifyId y propagar (OK)', async () => {
      const repo = repoMock();
      const uc = new VerifyIdUseCase(repo as any);
      const resOk: Ok<boolean> = { ok: true, value: false };
      repo.verifyId.mockResolvedValue(resOk);

      const res = await uc.execute('trj-crd');

      expect(repo.verifyId).toHaveBeenCalledWith('trj-crd');
      expect(res).toBe(resOk);
    });

    it('debe propagar (Err)', async () => {
      const repo = repoMock();
      const uc = new VerifyIdUseCase(repo as any);
      const resErr: Err = { ok: false, reason: 'server' };
      repo.verifyId.mockResolvedValue(resErr);

      const res = await uc.execute('trj-crd');

      expect(repo.verifyId).toHaveBeenCalledWith('trj-crd');
      expect(res).toBe(resErr);
    });
  });
});
