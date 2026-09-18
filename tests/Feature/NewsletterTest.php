<?php

use App\Models\NewsletterSubscriber;

it('subscribes a visitor to the newsletter', function () {
    $this->post('/newsletter', ['email' => 'visiteur@example.com'])
        ->assertRedirect()
        ->assertSessionHas('status');

    $this->assertDatabaseHas('newsletter_subscribers', ['email' => 'visiteur@example.com']);
});

it('does not duplicate an existing subscriber', function () {
    NewsletterSubscriber::factory()->create(['email' => 'deja@example.com']);

    $this->post('/newsletter', ['email' => 'deja@example.com'])->assertRedirect();

    expect(NewsletterSubscriber::where('email', 'deja@example.com')->count())->toBe(1);
});

it('rejects an invalid email', function () {
    $this->post('/newsletter', ['email' => 'not-an-email'])->assertSessionHasErrors('email');
});
