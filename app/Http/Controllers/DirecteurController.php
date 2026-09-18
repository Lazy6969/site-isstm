<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class DirecteurController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Directeur/Index');
    }
}
