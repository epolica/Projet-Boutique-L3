<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index()
    {
        return Product::latest()->get(); // Les categories sont chargees par le modele.
    }

    public function show(Product $product)
    {
        return $product->load('categories');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|min:2',
            'title' => 'nullable|string|min:2',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'image' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'categories' => 'nullable|array',
            'categories.*' => 'exists:categories,id',
        ]);

        $categories = array_map('intval', $data['categories'] ?? []);
        unset($data['categories']);

        $data['title'] = $data['title'] ?? $data['name'];

        $product = Product::create($data);
        $product->categories()->sync($categories); // Lie les categories selectionnees.

        return response()->json($product->load('categories'), 201);
    }

    public function update(Request $request, Product $product)
    {
        $data = $request->validate([
            'name' => 'sometimes|required|string|min:2',
            'title' => 'sometimes|nullable|string|min:2',
            'description' => 'sometimes|nullable|string',
            'price' => 'sometimes|required|numeric|min:0',
            'stock' => 'sometimes|required|integer|min:0',
            'image' => 'sometimes|nullable|string',
            'category_id' => 'sometimes|nullable|exists:categories,id',
            'categories' => 'sometimes|array',
            'categories.*' => 'exists:categories,id',
        ]);

        $categories = $data['categories'] ?? null;
        unset($data['categories']);

        if (array_key_exists('name', $data) && !array_key_exists('title', $data)) {
            $data['title'] = $data['name'];
        }

        $product->update($data);

        if (!is_null($categories)) {
            $product->categories()->sync(array_map('intval', $categories)); // Met a jour l'association N-N si demande.
        }

        return response()->json($product->fresh()->load('categories'));
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json(['message' => 'Produit supprime']);
    }
}
