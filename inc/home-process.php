<?php
/** Original onboarding content, kept separate from component markup. */
defined( 'ABSPATH' ) || exit;
return array(
	array(
		'variant' => 'call',
		'number' => '01',
		'title' => 'Book a free call',
		'description_tag' => 'p',
		'description' => '<span class="process-card__description-text--call">30 minutes with Jeremy.</span><span class="process-card__description-text-inner--call"> No pitch, no sales script. We listen to where you are and where you want to go.</span>',
	),
	array(
		'variant' => 'plan',
		'number' => '02',
		'title' => 'Get a tailored plan',
		'description_tag' => 'p',
		'description' => '
            Within 48 hours, you receive a scoped engagement proposal — clear deliverables, clear monthly fee, no surprises.
          ',
	),
	array(
		'variant' => 'onboarding',
		'glow' => array(
			'class' => 'section__item process-card__glow--onboarding section__visual',
			'children' => array(
				array(
					'class' => 'process-card__glow-frame--onboarding',
					'children' => array(
						array(
							'class' => 'process-card__glow-image--onboarding',
							'asset' => 'ellipse2129.svg',
						),
					),
				),
			),
		),
		'number' => '03',
		'title' => 'Onboarding & first wins',
		'description_tag' => 'div',
		'description' => '<p class="process-card__description-text--onboarding">Clean numbers in week one. First strategy session </p><p class="process-card__description-text-inner--onboarding">by end of month one. From there, you have a senior accountant on call.</p>',
		'button' => 'Start with a free call',
	),
);
