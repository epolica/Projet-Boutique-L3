<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\CategoryController;

Route::get('ping', fn () => response()->json(['ok' => true])); // Test rapide pour verifier l'API.

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/password/forgot', [AuthController::class, 'forgotPassword']);
Route::post('/auth/password/reset', [AuthController::class, 'resetPassword']); // Formulaire final avec token + nouveau mot de passe.
Route::get('/auth/password/reset/{token}', function (string $token, Request $request) {
    $front = env('FRONT_RESET_URL', 'http://localhost:4200/reset-password');
    $email = $request->query('email');
    $redirect = $front . '?token=' . urlencode($token);
    if ($email) {
        $redirect .= '&email=' . urlencode($email);
    }
    return redirect()->away($redirect);
})->name('password.reset');

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}/products', [CategoryController::class, 'products']);

Route::middleware('auth:api')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/me', [AuthController::class, 'updateMe']);
    Route::post('/me/password', [AuthController::class, 'changePassword']);
    Route::delete('/me', [AuthController::class, 'destroySelf']); // Permet a l'utilisateur de supprimer son propre compte.
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/me', [OrderController::class, 'myOrders']);
});

Route::middleware(['auth:api', 'admin'])->group(function () {
    Route::post('/products', [ProductController::class, 'store']); // Reserves aux administrateurs.
    Route::put('/products/{product}', [ProductController::class, 'update']);
    Route::delete('/products/{product}', [ProductController::class, 'destroy']);

    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{category}', [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/users', [AuthController::class, 'index']);
    Route::post('/users', [AuthController::class, 'storeUser']);
    Route::put('/users/{user}', [AuthController::class, 'updateUser']);
    Route::post('/users/{user}/password/reset', [AuthController::class, 'resetUserPassword']);
    Route::delete('/users/{user}', [AuthController::class, 'destroyUser']); // Suppression admin d'un compte utilisateur.
});
