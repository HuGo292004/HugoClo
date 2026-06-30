// ============================================================
// Header — Sticky wrapper (Tailwind CSS)
// ============================================================

import React from 'react';
import TopBar from './TopBar';
import MainHeader from './MainHeader';

const Header = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-[1000] bg-white" role="banner">
      <TopBar />
      <MainHeader />
    </div>
  );
};

export default Header;
