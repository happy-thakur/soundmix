import { SoundmixPage } from './app.po';

describe('soundmix App', () => {
  let page: SoundmixPage;

  beforeEach(() => {
    page = new SoundmixPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
