import { useRef } from 'react';
import { usePageMotion } from '@/components/animations/usePageMotion';
import { useSeo } from '@/hooks/useSeo';
import { photos, photoUrl } from '@/data/assets';
import { t } from '@/i18n';
import { Hero } from './Hero';
import { FeaturedSpaces } from './FeaturedSpaces';
import { StudioIntro } from './StudioIntro';
import { Collections } from './Collections';
import { MaterialStories } from './MaterialStories';
import { Inspiration } from './Inspiration';
import { FinalCta } from './FinalCta';

export default function Home() {
  const root = useRef<HTMLDivElement>(null);
  useSeo({
    title: 'Room Theory',
    description: t('An interior design studio and real-time 3D room configurator. Explore curated spaces, furnish rooms with our collection, and test materials and light before you commit.'),
    image: photoUrl(photos.heroLiving, 1200),
  });
  usePageMotion(root);
  return (
    <div ref={root}>
      <Hero />
      <FeaturedSpaces />
      <StudioIntro />
      <Collections />
      <MaterialStories />
      <Inspiration />
      <FinalCta />
    </div>
  );
}
