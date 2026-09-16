<?php

namespace App\Http\Controllers;

use App\Models\Document;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DocumentController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Document::query()->orderByDesc('created_at');

        if (! $request->user()) {
            $query->where('category', 'public');
        }

        return Inertia::render('Documents/Index', [
            'documents' => $query->get(['id', 'title', 'category', 'file_path', 'created_at']),
        ]);
    }
}
