<?php

use App\Models\NewsArticle;
use App\Models\NewsCategory;
use App\Models\User;
use App\NewsStatus;
use App\Role;

it('forbids a non-admin from updating category colors', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();
    $category = NewsCategory::create(['slug' => 'sport', 'name_fr' => 'Sport']);

    $this->actingAs($etudiant)
        ->put('/console/actualites/categories/colors', ['colors' => [$category->id => '#ff0000']])
        ->assertForbidden();
});

it('lets an admin set colors for several categories in one request', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $sport = NewsCategory::create(['slug' => 'sport', 'name_fr' => 'Sport']);
    $culture = NewsCategory::create(['slug' => 'culture', 'name_fr' => 'Culture']);

    $this->actingAs($admin)
        ->put('/console/actualites/categories/colors', [
            'colors' => [$sport->id => '#16a34a', $culture->id => '#9333ea'],
        ])
        ->assertRedirect();

    expect($sport->fresh()->color)->toBe('#16a34a');
    expect($culture->fresh()->color)->toBe('#9333ea');
});

it('clears a category color back to default when an empty value is submitted', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $category = NewsCategory::create(['slug' => 'sport', 'name_fr' => 'Sport', 'color' => '#16a34a']);

    $this->actingAs($admin)
        ->put('/console/actualites/categories/colors', ['colors' => [$category->id => '']])
        ->assertRedirect();

    expect($category->fresh()->color)->toBeNull();
});

it('rejects a category color that is not a valid hex value', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    $category = NewsCategory::create(['slug' => 'sport', 'name_fr' => 'Sport']);

    $this->actingAs($admin)
        ->put('/console/actualites/categories/colors', ['colors' => [$category->id => 'not-a-color']])
        ->assertSessionHasErrors("colors.{$category->id}");
});

it('exposes each category color on the public actualités pages', function () {
    $category = NewsCategory::create(['slug' => 'sport', 'name_fr' => 'Sport', 'color' => '#16a34a']);
    $article = NewsArticle::factory()->create(['status' => NewsStatus::Publie, 'news_category_id' => $category->id]);

    $this->get('/actualites')->assertInertia(fn ($page) => $page
        ->component('Actualites/Index')
        ->where('articles.0.category.color', '#16a34a')
    );

    $this->get("/actualites/{$article->slug}")->assertInertia(fn ($page) => $page
        ->component('Actualites/Show')
        ->where('article.category.color', '#16a34a')
    );
});
