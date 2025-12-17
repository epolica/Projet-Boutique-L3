<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@exemple.com'],
            [
                'name' => 'Admin',
                'password' => bcrypt('password'),
                'role' => 'admin',
            ]
        ); // Evite le conflit d'unicite si le seed est rejoue.

        User::firstOrCreate(
            ['email' => 'papaw@exemple.com'],
            [
                'name' => 'Papaw',
                'password' => bcrypt('password'),
                'role' => 'customer',
            ]
        );

        // Les produits, categories et autres donnees seront inserees via la BDD Wamp existante.
        $this->call([
            CategorySeeder::class,
            ProductSeeder::class,
        ]);
    }
}
