import type { DealGroup } from "./deals-tab";
import browser from 'webextension-polyfill';
import nintendoRibbon from '../../assets/nintendo.svg';
import playstationRibbon from '../../assets/playstation.svg';
import xboxRibbon from '../../assets/xbox.svg';
import { t } from '../../utils/i18n';

type Props = {
    deal: DealGroup;
};

const RIBBON_IMAGES = {
    nintendo: nintendoRibbon,
    playstation: playstationRibbon,
    xbox: xboxRibbon,
} as const;

export function DealsTabSingleDeal({ deal }: Props) {
    const openTab = (url: string) => {
        void browser.tabs.create({ url });
    };

    return <div className="gg-deals-section">

        <h3 className="gg-deals-section-heading">
            <a href={deal.url} onClick={(e) => { e.preventDefault(); openTab(deal.url); }}>
                {deal.title}
                <span className="gg-deals-section-heading-small">{t('dealsSeeAll')}</span>
            </a>
        </h3>
        {deal.items.map((item, index) => {
            const ribbonImage = item.game.ribbon ? RIBBON_IMAGES[item.game.ribbon] : undefined;

            return (
                <div className="gg-deals-item" key={index}>
                    <div className="gg-deals-item-image">
                        <img
                            className="gg-deals-item-cover"
                            src={item.game.images["1x"]}
                            srcSet={`${item.game.images["1x"]} 1x, ${item.game.images["2x"]} 2x`}
                            alt={item.game.title}
                            loading="lazy"
                            decoding="async"
                        />
                        {ribbonImage && <img className="gg-deal-item-ribbon" src={ribbonImage} alt="" aria-hidden="true" />}
                    </div>
                    <div className="gg-deals-item-content">
                        <div className="gg-deal-item-title">{item.game.title}</div>
                        <div className="gg-deal-item-price-wrapper">
                            <div className="gg-deal-item-price-labels">
                                {item.deal.isHistoricalLow && (
                                    <span className="gg-deal-label gg-label-historical" title={t('historicalLow')}>
                                        {t('historicalLowAbbreviation')}
                                    </span>
                                )}
                                {item.deal.discount && <span className="gg-deal-label gg-label-discount">-{item.deal.discount}%</span>}
                            </div>
                            <div className={`gg-deal-item-price${item.deal.isHistoricalLow ? ' price-hl' : ''}`}>{item.deal.price}</div>
                        </div>
                    </div>
                    <a href={item.game.url} className="gg-full-link" target="_blank"></a>
                </div>
            );
        })}
    </div>;
}
