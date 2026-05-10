/*
Copyright (c) 2026 Steve Dwire

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.
*/

import '../../styles/components/StyleboardPage.scss';

export default function StyleboardPage(): React.ReactElement {

  return (
    <div className="page centered" data-testid="page-styleboard">
      <div className="page-container">
        <h1 className="page-title">h1.page-title Styleboard</h1>
        <p>Paragraph text</p>
        <h1>Heading 1</h1>
        <h2>Heading 2</h2>
        <h3>Heading 3</h3>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
        <h1>Heading 1</h1>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
        <h2>Heading 2</h2>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
        <h2>Buttons</h2>
        <div className="button-group">
          <button>Primary</button>
          <button className="btn-secondary">Secondary</button>
          <button className="btn-danger">Danger</button>
          <button className="btn-success">Success</button>
        </div>
        <h2>Colors</h2>
        <div className="grid-row">
          <div className="color-swatch" style={{ background: 'var(--core-gold)' }}><span>Gold</span></div>
        </div>
        <div className="grid-row">
          <div className="color-swatch" style={{ background: 'var(--core-red)' }}><span>Red</span></div>
          <div className="color-swatch" style={{ background: 'var(--core-green)' }}><span>Green</span></div>
          <div className="color-swatch" style={{ background: 'var(--core-blue)' }}><span>Blue</span></div>
        </div>
        <div className="grid-row">
          <div className="color-swatch" style={{ background: 'var(--core-cyan)' }}><span>Cyan</span></div>
          <div className="color-swatch" style={{ background: 'var(--core-magenta)' }}><span>Magenta</span></div>
          <div className="color-swatch" style={{ background: 'var(--core-yellow)' }}><span>Yellow</span></div>
        </div>
        <div className="grid-row">
          <div className="color-swatch" style={{ background: 'var(--core-lime)' }}><span>Lime</span></div>
          <div className="color-swatch" style={{ background: 'var(--core-teal)' }}><span>Teal</span></div>
          <div className="color-swatch" style={{ background: 'var(--core-purple)' }}><span>Purple</span></div>
          <div className="color-swatch" style={{ background: 'var(--core-coral)' }}><span>Coral</span></div>
        </div>
      </div>
    </div>
  );
}
