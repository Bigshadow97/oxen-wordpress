<?php defined( 'ABSPATH' ) || exit; ?>
<section id="calculator" class="section calculator" aria-labelledby="calculator-title">
<div class="layout-group calculator__results"><div class="section__item calculator__lower-glow section__visual" aria-hidden="true"><div class="calculator__lower-glow-orientation"><div class="calculator__lower-glow-canvas"><div class="calculator__lower-glow-frame"><img alt="" src="<?php echo oxen_asset( 'ellipse2135.svg' ); ?>" decoding="async" class="calculator__lower-glow-image"></div></div></div></div>
<div class="section__item calculator__upper-glow section__visual" aria-hidden="true"><div class="calculator__upper-glow-frame"><img alt="" src="<?php echo oxen_asset( 'ellipse2132.svg' ); ?>" decoding="async" class="calculator__upper-glow-image"></div></div>
<div class="section__item calculator__bridge-glow section__visual" aria-hidden="true"><div class="calculator__bridge-glow-frame"><img alt="" src="<?php echo oxen_asset( 'ellipse2131.svg' ); ?>" decoding="async" class="calculator__bridge-glow-image"></div></div>
<div class="section__item calculator__results-background section__visual" aria-hidden="true"></div>
<div class="section__item calculator__results-frame section__visual" aria-hidden="true"></div>
<div class="section__item calculator__top-glow section__visual" aria-hidden="true"><div class="calculator__top-glow-orientation"><div class="calculator__top-glow-canvas"><div class="calculator__top-glow-frame"><img alt="" src="<?php echo oxen_asset( 'ellipse2133.svg' ); ?>" decoding="async" class="calculator__top-glow-image"></div></div></div></div>
<div class="section__item calculator__results-divider section__visual" aria-hidden="true"><div class="calculator__results-divider-orientation"><div class="calculator__results-divider-canvas"><div class="calculator__results-divider-frame"><img alt="" src="<?php echo oxen_asset( 'vector1029.svg' ); ?>" decoding="async" class="calculator__results-divider-image"></div></div></div></div>
<div class="section__item calculator__side-glow section__visual" aria-hidden="true"><div class="calculator__side-glow-orientation"><div class="calculator__side-glow-canvas"><div class="calculator__side-glow-frame"><img alt="" src="<?php echo oxen_asset( 'ellipse2134.svg' ); ?>" decoding="async" class="calculator__side-glow-image"></div></div></div></div>
<output id="tax-owed" form="tax-form" class="section__item calculator__tax section__text">
          $70,000
        </output>
<output id="effective-rate" form="tax-form" class="section__item calculator__rate section__text">
          28.0%
        </output>
<output id="after-tax-profit" form="tax-form" class="section__item calculator__net-profit section__text">
          $180,000
        </output>
<p class="section__item calculator__tax-label section__text">
          Tax owed
        </p>
<p class="section__item calculator__rate-label section__text">
          Effective Rate
        </p>
<p class="section__item calculator__net-profit-label section__text">
          After-tax profit
        </p></div>
<form id="tax-form" class="layout-group calculator__form" aria-label="New Zealand income tax estimate"><div class="section__item calculator__form-background section__visual" aria-hidden="true"></div>
<label for="business-structure" class="section__item calculator__structure-label section__text">
              Business Structure
            </label>
<select id="business-structure" name="structure" form="tax-form" class="section__item calculator__structure-input section__visual calculator__input"><option value="company">Limited Company</option><option value="sole-trader">Sole Trader</option><option value="partnership">Partnership</option></select>
<label for="annual-revenue" class="section__item calculator__revenue-label section__text">
              Annual Revenue
            </label>
<input id="annual-revenue" name="revenue" form="tax-form" type="text" inputmode="decimal" required="required" value="$ 1,200,000" maxlength="20" class="section__item calculator__revenue-input section__visual calculator__input">
<label for="annual-profit" class="section__item calculator__profit-label section__text">
              Expected Annual Profit
            </label>
<input id="annual-profit" name="profit" form="tax-form" type="text" inputmode="decimal" required="required" value="$ 250,000.00" maxlength="20" class="section__item calculator__profit-input section__visual calculator__input">
<button type="submit" form="tax-form" class="section__item calculator__submit section__visual"><span>Calculate my Tax</span><img src="<?php echo oxen_asset( 'frame.svg' ); ?>" alt="" width="20" height="20"></button>
<p class="section__item calculator__disclaimer section__text">
              Indicative only. Based on current IRD rates and excludes provisional tax adjustments.
            </p></form>
<h2 class="section__item calculator__title section__text" id="calculator-title"><span class="calculator__title-prefix">How much Tax will your business </span><span class="calculator__title-emphasis">actually</span><span class="calculator__title-ending"> pay?</span></h2>
<p class="section__item calculator__eyebrow section__text">
            Tools and Resources
          </p>
<a href="#contact" class="section__item calculator__resource-button section__visual button" data-open-contact="" aria-haspopup="dialog"><span class="section__item calculator__resource-label section__text">
          See how to capture this
        </span></a>
<div class="calculator__partners" hidden><label for="partner-count">Number of equal-share partners</label><input form="tax-form" id="partner-count" name="partners" type="number" min="2" max="100" value="2"></div><p id="tax-error" class="calculator__error" role="alert"></p><p id="tax-status" class="sr-only" role="status" aria-live="polite"></p>
</section>
