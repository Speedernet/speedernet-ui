import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SnCard } from './card';

@Component({
  imports: [SnCard],
  template: `
    <sn-card>
      <div snCardActions id="actions">Actions</div>
      <p id="content">Content</p>
      <div snCardHeader id="header">Header</div>
    </sn-card>
  `,
})
class Host {}

describe('SnCard', () => {
  function setup() {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    return fixture.nativeElement.querySelector('sn-card') as HTMLElement;
  }

  it('is an article', () => {
    expect(setup().getAttribute('role')).toBe('article');
  });

  it('orders header, content, then actions whatever the source order', () => {
    const ids = Array.from(setup().querySelectorAll('[id]')).map((e) => e.id);
    expect(ids).toEqual(['header', 'content', 'actions']);
  });
});
