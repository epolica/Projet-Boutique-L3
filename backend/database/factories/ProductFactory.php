<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name'        => $this->faker->words(2, true),
            'price'       => $this->faker->randomFloat(2, 5, 300),
            'title' => $this->faker->sentence(3),
            'description' => $this->faker->sentence(),
            'image'       => null,
            'stock'       => $this->faker->numberBetween(0, 50),
            'category_id' => null,
        ];
    }
}
