import { Spinkit } from './spinkits'; // Ajusta la ruta real

describe('Spinkit', () => {
  it('debe estar definido', () => {
    expect(Spinkit).toBeDefined();
    expect(typeof Spinkit).toBe('object');
  });

  it('debe contener todas las claves esperadas', () => {
    const expectedKeys = [
      'skChasingDots',
      'skCubeGrid',
      'skDoubleBounce',
      'skRotatingPlane',
      'skSpinnerPulse',
      'skThreeBounce',
      'skWanderingCubes',
      'skWave',
      'skLine'
    ];
    expect(Object.keys(Spinkit).sort()).toEqual(expectedKeys.sort());
  });

  it('debe tener los valores correctos', () => {
    expect(Spinkit.skChasingDots).toBe('sk-chasing-dots');
    expect(Spinkit.skCubeGrid).toBe('sk-cube-grid');
    expect(Spinkit.skDoubleBounce).toBe('sk-double-bounce');
    expect(Spinkit.skRotatingPlane).toBe('sk-rotationg-plane'); // ojo con el typo en "rotationg"
    expect(Spinkit.skSpinnerPulse).toBe('sk-spinner-pulse');
    expect(Spinkit.skThreeBounce).toBe('sk-three-bounce');
    expect(Spinkit.skWanderingCubes).toBe('sk-wandering-cubes');
    expect(Spinkit.skWave).toBe('sk-wave');
    expect(Spinkit.skLine).toBe('sk-line-material');
  });
});
