<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $base = rtrim(config('app.url', 'http://127.0.0.1:8000'), '/'); // Base URL pour servir les images backend.
        $url = fn(string $path) => "{$base}/{$path}";

        $products = [
            [
                'name' => 'Bouquet de Roses',
                'title' => 'Bouquet de Roses',
                'description' => 'Un bouquet compose de roses rouges',
                'price' => 29.99,
                'image' => $url('images/roses.jpg'),
                'stock' => 10,
                'category_id' => 1,
            ],
            [
                'name' => 'Bouquet de Tulipes',
                'title' => 'Bouquet de Tulipes',
                'description' => 'Un bouquet de magnifiques tulipes colorees',
                'price' => 19.99,
                'image' => $url('images/tulipes.jpg'),
                'stock' => 8,
                'category_id' => 2,
            ],
            [
                'name' => 'Bouquet de Lys',
                'title' => 'Bouquet de Lys',
                'description' => 'Lys blancs elegants, parfait pour un cadeau',
                'price' => 34.99,
                'image' => $url('images/lys.jpg'),
                'stock' => 5,
                'category_id' => 3,
            ],
            [
                'name' => 'Orchidees en pot',
                'title' => 'Orchidees en pot',
                'description' => 'Une orchidee en pot, facile a entretenir',
                'price' => 24.99,
                'image' => $url('images/orchidees.jpg'),
                'stock' => 12,
                'category_id' => 4,
            ],
            [
                'name' => 'Bouquet de Marguerites',
                'title' => 'Bouquet de Marguerites',
                'description' => 'Un bouquet de marguerites fraiches',
                'price' => 14.99,
                'image' => $url('images/marguerites.jpg'),
                'stock' => 20,
                'category_id' => 5,
            ],
        ];

        foreach ($products as $data) {
            $product = Product::create($data); // Cree le produit avec URL absolue pour l'image.
            if (!empty($data['category_id'])) {
                $product->categories()->sync([(int) $data['category_id']]); // Alimente le pivot pour que les categories retournent leurs produits.
            }
        }
    }
}
