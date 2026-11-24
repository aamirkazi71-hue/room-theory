import { memo, useMemo } from 'react';
import { getProduct } from '@/data/furniture';
import { getFurnitureMaterial } from '@/lib/threeMaterials';
import { models, type Mats } from './models';

interface Props {
  productId: string;
  materials: Record<string, string>;
  /** Distance from the model origin to the ceiling (pendants) */
  ceiling?: number;
}

/** Resolves a product's material ids to shared materials and renders its model. */
export const ProductModel = memo(function ProductModel({ productId, materials, ceiling }: Props) {
  const product = getProduct(productId);
  const key = JSON.stringify(materials);
  const mats = useMemo<Mats>(() => {
    const out: Mats = {};
    product?.slots.forEach((s) => {
      out[s.key] = getFurnitureMaterial(materials[s.key] ?? s.default);
    });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, key]);
  if (!product) return null;
  const Model = models[product.model];
  return <Model m={mats} ids={materials} ceiling={ceiling} />;
});
