import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SpeedCard } from './card';

@Component({
  imports: [SpeedCard],
  template: `
    <speed-card>
      <div speedCardActions id="actions">Actions</div>
      <p id="content">Content</p>
      <div speedCardHeader id="header">Header</div>
    </speed-card>
  `,
})
class Host {}

describe('SpeedCard', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    return fixture.nativeElement.querySelector('speed-card') as HTMLElement;
  }

  it('is an article', () => {
    expect(setup().getAttribute('role')).toBe('article');
  });

  it('orders header, content, then actions whatever the source order', () => {
    const ids = Array.from(setup().querySelectorAll('[id]')).map((e) => e.id);
    expect(ids).toEqual(['header', 'content', 'actions']);
  });
});
