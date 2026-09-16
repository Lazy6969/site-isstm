<?php

use App\Models\Teacher;
use App\TeacherCategory;

it('lists teachers ordered by display order', function () {
    Teacher::factory()->create(['name' => 'Second', 'display_order' => 2]);
    Teacher::factory()->create(['name' => 'First', 'display_order' => 1]);

    $this->get('/enseignants')->assertInertia(fn ($page) => $page
        ->component('Enseignants/Index')
        ->where('teachers.0.name', 'First')
        ->where('teachers.1.name', 'Second')
    );
});

it('includes both permanent and vacataire teachers', function () {
    Teacher::factory()->create(['category' => TeacherCategory::Permanent]);
    Teacher::factory()->create(['category' => TeacherCategory::Vacataire]);

    $this->get('/enseignants')->assertInertia(fn ($page) => $page
        ->has('teachers', 2)
    );
});
