import { WIDGET_MAP } from './widget-map';

describe('WIDGET_MAP', () => {
  const expectedComponents = ['List', 'Card', 'Chart', 'Grid', 'Timeline'];

  it('contains all expected components', () => {
    expectedComponents.forEach((name) => {
      expect(WIDGET_MAP[name]).toBeDefined();
      expect(typeof WIDGET_MAP[name]).toBe('function');
    });
  });

  it('has no extra components', () => {
    expect(Object.keys(WIDGET_MAP)).toHaveLength(expectedComponents.length);
  });
});
