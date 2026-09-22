<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\ManagesUploadedImages;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTestimonialRequest;
use App\Models\Testimonial;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TestimonialController extends Controller
{
    use ManagesUploadedImages;

    public function index(): Response
    {
        return Inertia::render('Admin/Temoignages/Index', [
            'testimonials' => Testimonial::orderBy('display_order')
                ->get(['id', 'author_name', 'program', 'image_path', 'quote_fr', 'quote_en', 'quote_mg', 'display_order']),
        ]);
    }

    public function store(StoreTestimonialRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        // program/quote_en/quote_mg/image_path are NOT NULL columns with no
        // default, but are optional from the admin's perspective — default
        // them to an empty string rather than leaving them unset.
        $validated['program'] = $validated['program'] ?? '';
        $validated['quote_en'] = $validated['quote_en'] ?? '';
        $validated['quote_mg'] = $validated['quote_mg'] ?? '';

        if ($request->hasFile('image')) {
            $validated['image_path'] = $this->storeUploadedImage($request, 'image', 'testimonials');
        }
        unset($validated['image']);
        $validated['image_path'] = $validated['image_path'] ?? '';

        Testimonial::create($validated);

        return back()->with('status', 'Témoignage créé.');
    }

    public function update(Request $request, Testimonial $temoignage): RedirectResponse
    {
        $validated = $request->validate([
            'author_name' => ['required', 'string', 'max:255'],
            'program' => ['nullable', 'string', 'max:255'],
            'quote_fr' => ['required', 'string'],
            'quote_en' => ['nullable', 'string'],
            'quote_mg' => ['nullable', 'string'],
            'image' => ['nullable', 'image', 'max:4096'],
            'display_order' => ['nullable', 'integer'],
        ]);

        // Only coerce null -> '' for keys actually present in the payload
        // (NOT NULL columns), leaving untouched fields untouched.
        foreach (['program', 'quote_en', 'quote_mg'] as $field) {
            if (array_key_exists($field, $validated)) {
                $validated[$field] = $validated[$field] ?? '';
            }
        }

        if ($request->hasFile('image')) {
            $this->deleteUploadedImage($temoignage->image_path, 'testimonials');
            $validated['image_path'] = $this->storeUploadedImage($request, 'image', 'testimonials');
        }
        unset($validated['image']);

        $temoignage->update($validated);

        return back()->with('status', 'Témoignage mis à jour.');
    }

    public function destroy(Testimonial $temoignage): RedirectResponse
    {
        $this->deleteUploadedImage($temoignage->image_path, 'testimonials');
        $temoignage->delete();

        return back()->with('status', 'Témoignage supprimé.');
    }
}
