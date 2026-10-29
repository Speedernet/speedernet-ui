import { SN_UI_NAME } from './version';

describe('SN_UI_NAME', () => {
  it('is the published package name', () => {
    expect(SN_UI_NAME).toBe('@speedernet/ui');
  });
});
