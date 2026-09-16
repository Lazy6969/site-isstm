<?php

namespace App\Http\Controllers;

use App\Models\CampusBloc;
use Inertia\Inertia;
use Inertia\Response;

class CampusController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Campus/Index', [
            'blocs' => CampusBloc::orderBy('nom')->get([
                'bloc_key', 'nom', 'signification', 'images',
            ]),
        ]);
    }

    public function show(CampusBloc $bloc): Response
    {
        return Inertia::render('Campus/Show', [
            'bloc' => $bloc,
        ]);
    }
}
