<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureAdmin
{
    public function handle(Request $request, Closure $next)
    {
        $user = auth('api')->user();

        if (!$user || !$user->isAdmin()) {
            return response()->json(['message' => 'Acces interdit'], 403); // Limite l'acces aux administrateurs.
        }

        return $next($request);
    }
}
