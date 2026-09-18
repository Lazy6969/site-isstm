<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class HistoriqueController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Historique/Index');
    }
}
