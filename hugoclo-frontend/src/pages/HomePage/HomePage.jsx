// ============================================================
// HomePage — Assembles all homepage sections
// ============================================================

import React from 'react';
import HeroSection from './sections/HeroSection';
import CategorySection from './sections/CategorySection';
import FeaturedProducts from './sections/FeaturedProducts';
import BenefitsSection from './sections/BenefitsSection';
import NewsletterSection from './sections/NewsletterSection';

const HomePage = () => {
  return (
    <main id="main-content" role="main">
      <HeroSection />
      <CategorySection />
      <FeaturedProducts />
      <BenefitsSection />
      <NewsletterSection />
    </main>
  );
};

export default HomePage;
