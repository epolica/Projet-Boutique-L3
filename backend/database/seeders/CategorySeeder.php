<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Category; 

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Roses'],
            ['name' => 'Tulipes'],
            ['name' => 'Lys'],
            ['name' => 'Orchidées'],
            ['name' => 'Marguerites'],
        ];

        foreach ($categories as $data) {
            Category::create($data);
    }
}
}
