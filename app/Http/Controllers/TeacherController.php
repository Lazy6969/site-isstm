<?php

namespace App\Http\Controllers;

use App\Models\Teacher;
use Inertia\Inertia;
use Inertia\Response;

class TeacherController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Enseignants/Index', [
            'teachers' => Teacher::orderBy('display_order')->get([
                'id', 'name', 'category', 'specialty_fr as specialty', 'photo_path', 'email',
            ]),
        ]);
    }
}
