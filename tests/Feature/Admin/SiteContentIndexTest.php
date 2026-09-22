<?php

use App\Models\SiteContent;
use App\Models\User;
use App\Role;
use App\SiteContentType;

it('forbids a user without quick-edit.access from listing site content', function () {
    $etudiant = User::factory()->role(Role::Etudiant)->create();

    $this->actingAs($etudiant)->get('/console/contenu')->assertForbidden();
});

it('lets a super admin list every site content entry grouped by section', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    SiteContent::factory()->create(['content_key' => 'contact_email']);
    SiteContent::factory()->create(['content_key' => 'mission_contenu']);
    SiteContent::factory()->create(['content_key' => 'stat_students_icon', 'type' => SiteContentType::Icon]);

    $this->actingAs($admin)->get('/console/contenu')->assertInertia(fn ($page) => $page
        ->component('Admin/Contenu/Index')
        ->where('groups.Contact.0.content_key', 'contact_email')
        ->has('groups.Accueil — Statistiques', 1)
        ->has('icons')
    );
});

it('groups an unrecognized key prefix under Autres', function () {
    $admin = User::factory()->role(Role::Admin)->create();
    SiteContent::factory()->create(['content_key' => 'zzz_unknown_key']);

    $this->actingAs($admin)->get('/console/contenu')->assertInertia(fn ($page) => $page
        ->has('groups.Autres', 1)
    );
});
