<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\DepartmentLoginRequest;
use App\Models\AccessKey;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Login/logout for the department subdomains (scolarite/enseignant/materiel) —
 * each domain group's routes bind `department` as a route default (not a URI
 * segment), see routes/subdomain-admin.php.
 */
class DepartmentAuthenticatedSessionController extends Controller
{
    public function create(Request $request): Response
    {
        $department = $request->route('department');

        return Inertia::render('Auth/DepartmentLogin', [
            'department' => $department,
            'label' => Str::headline($department),
        ]);
    }

    public function store(DepartmentLoginRequest $request): RedirectResponse
    {
        $department = $request->route('department');
        $role = AccessKey::DEPARTMENTS[$department];

        $request->authenticate($role);

        $request->session()->regenerate();

        return redirect()->intended(route("{$department}.dashboard"));
    }

    public function destroy(Request $request): RedirectResponse
    {
        $department = $request->route('department');

        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route("{$department}.login");
    }
}
