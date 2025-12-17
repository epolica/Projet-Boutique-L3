<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use PHPOpenSourceSaver\JWTAuth\Exceptions\JWTException;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|min:2',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6|confirmed',
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => 'customer',
        ]);

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'user' => $this->formatUser($user),
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!$token = JWTAuth::attempt($credentials)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $user = auth('api')->user();

        return response()->json([
            'user' => $this->formatUser($user),
            'token' => $token,
        ]);
    }

    public function me()
    {
        $user = auth('api')->user();

        return response()->json([
            'user' => $this->formatUser($user),
        ]);
    }

    public function updateMe(Request $request)
    {
        $user = auth('api')->user();

        $data = $request->validate([
            'name' => 'sometimes|required|string|min:2',
            'email' => [
                'sometimes',
                'required',
                'email',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
        ]);

        $user->update($data);

        return response()->json(['user' => $this->formatUser($user->fresh())]);
    }

    public function changePassword(Request $request)
    {
        $user = auth('api')->user();

        $data = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        if (!Hash::check($data['current_password'], $user->password)) {
            return response()->json(['message' => 'Mot de passe actuel incorrect'], 422);
        }

        $user->password = Hash::make($data['new_password']);
        $user->save();

        return response()->json(['message' => 'Mot de passe mis a jour']);
    }

    public function logout()
    {
        try {
            JWTAuth::invalidate(JWTAuth::parseToken());

            return response()->json(['message' => 'Logged out']);
        } catch (JWTException $exception) {
            return response()->json(['message' => 'Failed to logout'], 500);
        }
    }

    public function index()
    {
        return User::orderBy('name')->get()->map(fn ($user) => $this->formatUser($user)); // Liste des utilisateurs pour l'admin.
    }

    public function destroySelf(Request $request)
    {
        $user = $request->user();
        $user->delete(); // Supprime le compte courrant.

        return response()->json(['message' => 'Compte supprime']);
    }

    public function destroyUser(User $user)
    {
        if ($user->id === auth('api')->id()) {
            return response()->json(['message' => 'Action interdite pour votre propre compte'], 422);
        }

        $user->delete(); // Suppression admin d'un utilisateur cible.
        return response()->json(['message' => 'Utilisateur supprime']);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $status = Password::sendResetLink($request->only('email'));

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json(['message' => 'Lien de reinitialisation envoye.']);
        }

        return response()->json([
            'message' => 'Si un compte existe pour cet email, un lien a ete envoye.'
        ]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'email' => 'required|email',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save(); // Nouveau mot de passe + token de session régénéré.
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json(['message' => 'Mot de passe reinitialise']);
        }

        return response()->json(['message' => __($status)], 422);
    }

    public function storeUser(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|min:2',
            'email' => 'required|email|unique:users,email',
            'password' => 'nullable|string|min:6',
            'role' => ['required', Rule::in(['customer', 'admin'])],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password'] ?? 'password'),
            'role' => $data['role'],
        ]);

        return response()->json(['user' => $this->formatUser($user)], 201);
    }

    public function updateUser(Request $request, User $user)
    {
        $data = $request->validate([
            'name' => 'sometimes|required|string|min:2',
            'email' => [
                'sometimes',
                'required',
                'email',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'password' => 'sometimes|nullable|string|min:6',
            'role' => ['sometimes', 'required', Rule::in(['customer', 'admin'])],
        ]);

        if (array_key_exists('password', $data)) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $user->update($data);

        return response()->json(['user' => $this->formatUser($user->fresh())]);
    }

    public function resetUserPassword(User $user)
    {
        $status = Password::sendResetLink(['email' => $user->email]);

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json(['message' => 'Lien de reinitialisation envoye.']);
        }

        return response()->json(['message' => 'Impossible denvoyer le lien pour cet utilisateur'], 422);
    }

    private function formatUser(?User $user): array
    {
        return [
            'id' => $user?->id,
            'name' => $user?->name,
            'email' => $user?->email,
            'role' => $user?->role,
        ];
    }
}
