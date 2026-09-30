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
                'id', 'name', 'category', 'departement', 'specialty_fr as specialty', 'description_fr as description', 'photo_path', 'email',
            ]),
        ]);
    }
}
