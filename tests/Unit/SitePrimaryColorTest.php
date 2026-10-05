<?php

use App\SitePrimaryColor;

it('resolves a preset key to its fixed [primary, dark] pair', function () {
    expect(SitePrimaryColor::resolve('emerald'))->toBe(SitePrimaryColor::Emerald->colors());
});

it('falls back to navy for an unknown, non-hex value', function () {
    expect(SitePrimaryColor::resolve('not-a-real-color'))->toBe(SitePrimaryColor::Navy->colors());
    expect(SitePrimaryColor::resolve(null))->toBe(SitePrimaryColor::Navy->colors());
});

it('resolves a custom hex to itself plus a programmatically darkened variant', function () {
    [$primary, $dark] = SitePrimaryColor::resolve('#ff0000');

    expect($primary)->toBe('#ff0000');
    expect($dark)->toBe('#990000');
});
