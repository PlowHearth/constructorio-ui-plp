import React, { useMemo } from 'react';
import { useOnAddToCart, useOnProductCardClick } from '../../hooks/callbacks';
import { useCioPlpContext } from '../../hooks/useCioPlpContext';
import useProductInfo from '../../hooks/useProduct';
import { CnstrcData, IncludeRenderProps, Item, ProductInfoObject } from '../../types';
import { concatStyles, getProductCardCnstrcDataAttributes } from '../../utils';
import ProductSwatch from '../ProductSwatch';

interface Props {
  /**
   * Constructor's Transformed API Item Object.
   */
  item: Item;
}

/**
 * Props that will be passed to the renderProps function
 */
export interface ProductCardRenderProps extends ProductCardProps {
  /**
   * Function to format the price. Defaults to "$0.00".
   * Set globally at the CioPlp provider level.
   */
  formatPrice: (price: number) => string;
  /**
   * Object containing information about the current product, variation
   */
  productInfo: ProductInfoObject;
  /**
   * Callback to run on add-to-cart event.
   * Set globally at the CioPlp provider level.
   */
  onAddToCart: (
    event: React.MouseEvent,
    item: Item,
    revenue: number,
    selectedVariation: string,
  ) => void;
  /**
   * Callback to run on Product Card Click.
   * Set globally at the CioPlp provider level.
   */
  onClick: (event: React.MouseEvent, item: Item) => void;
  /**
   * Data Attributes to surface on parent div of product card.
   */
  productCardCnstrcDataAttributes: CnstrcData;
}

export type ProductCardProps = IncludeRenderProps<Props, ProductCardRenderProps>;

/**
 * ProductCard component that has Constructor tracking built-in.
 */
export default function ProductCard(props: ProductCardProps) {
  const { item, children } = props;
  const state = useCioPlpContext();
  const productInfo = useProductInfo({ item });
  const { productSwatch, itemName, itemPrice, itemImageUrl, itemUrl, salePrice } = productInfo;

  if (!state) {
    throw new Error('This component is meant to be used within the CioPlp provider.');
  }

  if (!item.data || !item.itemId || !item.itemName) {
    throw new Error('data, itemId, or itemName are required.');
  }

  const client = state.cioClient;
  const onAddToCart = useOnAddToCart(client, state.callbacks.onAddToCart);
  const { formatPrice } = state.formatters;
  const onClick = useOnProductCardClick(client, state.callbacks.onProductCardClick);
  const hasSalesPrice = useMemo(() => !!(salePrice && Number(salePrice) >= 0), [salePrice]);

  const cnstrcData = getProductCardCnstrcDataAttributes(productInfo);

  return (
    <>
      {typeof children === 'function' ? (
        children({
          item,
          productInfo,
          formatPrice,
          onAddToCart,
          onClick,
          productCardCnstrcDataAttributes: cnstrcData,
        })
      ) : (
        <a
          {...cnstrcData}
          className='cio-product-card card card--product h-full card--product-contained relative flex'
          href={itemUrl}
          onClick={(e) => onClick(e, item, productSwatch?.selectedVariation?.variationId)}>
          <div className='cio-image-container'>
            <img alt={itemName} src={itemImageUrl} className='cio-image' />
          </div>

          <div className='cio-content card__info-container flex flex-col flex-auto relative'>
            <div className='cio-item-prices-container'>
              {hasSalesPrice && <div className='cio-item-price'>{formatPrice(salePrice)}</div>}
              {Number(itemPrice) >= 0 && (
                <div
                  className={concatStyles(
                    'cio-item-price',
                    hasSalesPrice && 'cio-item-price-strikethrough',
                  )}>
                  {formatPrice(itemPrice)}
                </div>
              )}
            </div>
            <div className='cio-item-name'>{itemName}</div>
            {productSwatch && <ProductSwatch swatchObject={productSwatch} />}
            {Number(itemPrice) >= 0 && (
              <div className='cio-item-price'>{formatPrice(itemPrice)}</div>
            )}
            <div className='pwr-category-snippets'>
              <div id={`snippet-${item.itemId}`} />
            </div>
            <div className='card__quick-add mob:card__quick-add--below'>
              <button
                className='cio-add-to-cart-button btn btn--primary w-full'
                data-add-to-cart-text='Add to Cart'
                id={`quick-add-button-${item.itemId}`}
                aria-haspopup='dialog'
                type='button'
                onClick={(e) =>
                  onAddToCart(e, item, itemPrice, productSwatch?.selectedVariation?.variationId)
                }>
                <span className='quick-add-btn-icon'>
                  <span className='visually-hidden'>Add to Cart</span>
                  <svg
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='currentColor'
                    aria-hidden='true'
                    focusable='false'
                    role='presentation'
                    className='icon'>
                    <path d='M12.12 20.44H5.6V9.56h12.8v3.73c.06.4.4.69.8.7.44 0 .8-.35.8-.8v-4.5a.792.792 0 0 0-.8-.69H17V6.5C16.9 4 14.7 2 12 2S7 4.09 7 6.67V8H4.71c-.4.04-.71.37-.71.78v12.53a.8.8 0 0 0 .8.69h7.43c.38-.06.67-.39.67-.78 0-.43-.35-.78-.78-.78ZM8.66 6.67c0-1.72 1.49-3.11 3.33-3.11s3.33 1.39 3.33 3.11V8H8.65V6.67Z' />
                    <path d='M20 17.25h-2.4v-2.5a.817.817 0 0 0-.8-.7c-.44 0-.8.36-.8.8v2.4h-2.5c-.4.06-.7.4-.7.8 0 .44.36.8.8.8H16v2.5c.06.4.4.7.8.7.44 0 .8-.36.8-.8v-2.4h2.5c.4-.06.69-.4.7-.8 0-.44-.35-.8-.8-.8Z' />
                  </svg>
                </span>
                <span className='quick-add-btn-text'>Add to Cart</span>
              </button>
            </div>
          </div>
        </a>
      )}
    </>
  );
}
