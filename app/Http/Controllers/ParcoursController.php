<?php

namespace App\Http\Controllers;

use App\Models\OrgPerson;
use Inertia\Inertia;
use Inertia\Response;

class ParcoursController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Parcours', [
            'orgPeople' => OrgPerson::all()->keyBy('title_key'),
        ]);
    }
}
