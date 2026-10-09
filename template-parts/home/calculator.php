<?php defined( 'ABSPATH' ) || exit; ?>
<section id="calculator" class="home-section calculator-section" aria-labelledby="heading-107">
<div class="responsive-group calculator-result"><div data-node-id="1:106" class="design-layer layer-106 art-layer" aria-hidden="true"><div class="art-734"><div class="art-735"><div class="art-736"><img alt="" src="<?php echo oxen_asset( 'ellipse2135.svg' ); ?>" decoding="async" class="art-737"></div></div></div></div>
<div data-node-id="1:103" class="design-layer layer-103 art-layer" aria-hidden="true"><div class="art-739"><img alt="" src="<?php echo oxen_asset( 'ellipse2132.svg' ); ?>" decoding="async" class="art-740"></div></div>
<div data-node-id="1:77" class="design-layer layer-77 art-layer" aria-hidden="true"><div class="art-742"><img alt="" src="<?php echo oxen_asset( 'ellipse2131.svg' ); ?>" decoding="async" class="art-743"></div></div>
<div data-node-id="1:102" class="design-layer layer-102 art-layer" aria-hidden="true"></div>
<div data-node-id="1:99" class="design-layer layer-99 art-layer" aria-hidden="true"></div>
<div data-node-id="1:104" class="design-layer layer-104 art-layer" aria-hidden="true"><div class="art-747"><div class="art-748"><div class="art-749"><img alt="" src="<?php echo oxen_asset( 'ellipse2133.svg' ); ?>" decoding="async" class="art-750"></div></div></div></div>
<div data-node-id="1:115" class="design-layer layer-115 art-layer" aria-hidden="true"><div class="art-752"><div class="art-753"><div class="art-754"><img alt="" src="<?php echo oxen_asset( 'vector1029.svg' ); ?>" decoding="async" class="art-755"></div></div></div></div>
<div data-node-id="1:105" class="design-layer layer-105 art-layer" aria-hidden="true"><div class="art-757"><div class="art-758"><div class="art-759"><img alt="" src="<?php echo oxen_asset( 'ellipse2134.svg' ); ?>" decoding="async" class="art-760"></div></div></div></div>
<output data-node-id="1:113" id="tax-owed" form="tax-form" class="design-layer layer-113 copy-layer">
          $70,000
        </output>
<output data-node-id="1:114" id="effective-rate" form="tax-form" class="design-layer layer-114 copy-layer">
          28.0%
        </output>
<output data-node-id="1:116" id="after-tax-profit" form="tax-form" class="design-layer layer-116 copy-layer">
          $180,000
        </output>
<p data-node-id="1:110" class="design-layer layer-110 copy-layer">
          Tax owed
        </p>
<p data-node-id="1:111" class="design-layer layer-111 copy-layer">
          Effective Rate
        </p>
<p data-node-id="1:112" class="design-layer layer-112 copy-layer">
          After-tax profit
        </p></div>
<form id="tax-form" class="responsive-group calculator-form" aria-label="New Zealand income tax estimate"><div data-node-id="1:79" class="design-layer layer-79 art-layer" aria-hidden="true"></div>
<label data-node-id="1:87" for="business-structure" class="design-layer layer-87 copy-layer">
              Business Structure
            </label>
<select data-node-id="1:97" id="business-structure" name="structure" form="tax-form" class="design-layer layer-97 art-layer tax-control"><option value="company">Limited Company</option><option value="sole-trader">Sole Trader</option><option value="partnership">Partnership</option></select>
<label data-node-id="1:86" for="annual-revenue" class="design-layer layer-86 copy-layer">
              Annual Revenue
            </label>
<input data-node-id="1:94" id="annual-revenue" name="revenue" form="tax-form" type="text" inputmode="decimal" required="required" value="$ 1,200,000" maxlength="20" class="design-layer layer-94 art-layer tax-control">
<label data-node-id="1:88" for="annual-profit" class="design-layer layer-88 copy-layer">
              Expected Annual Profit
            </label>
<input data-node-id="1:90" id="annual-profit" name="profit" form="tax-form" type="text" inputmode="decimal" required="required" value="$ 250,000.00" maxlength="20" class="design-layer layer-90 art-layer tax-control">
<button data-node-id="1:81" type="submit" form="tax-form" class="design-layer layer-81 art-layer calculate-button"><span>Calculate my Tax</span><img src="<?php echo oxen_asset( 'frame.svg' ); ?>" alt="" width="20" height="20"></button>
<p data-node-id="1:85" class="design-layer layer-85 copy-layer">
              Indicative only. Based on current IRD rates and excludes provisional tax adjustments.
            </p></form>
<h2 data-node-id="1:107" class="design-layer layer-107 copy-layer" id="heading-107"><span class="art-777">How much Tax will your business </span><span class="art-778">actually</span><span class="art-779"> pay?</span></h2>
<p data-node-id="1:109" class="design-layer layer-109 copy-layer">
            Tools and Resources
          </p>
<a data-node-id="1:118" href="#contact" class="design-layer layer-118 art-layer action-link" data-open-contact="" aria-haspopup="dialog"><span data-node-id="1:119" class="design-layer layer-119 copy-layer">
          See how to capture this
        </span></a>
<div class="partnership-control" hidden><label for="partner-count">Number of equal-share partners</label><input form="tax-form" id="partner-count" name="partners" type="number" min="2" max="100" value="2"></div><p id="tax-error" class="tax-error" role="alert"></p><p id="tax-status" class="sr-only" role="status" aria-live="polite"></p>
</section>
