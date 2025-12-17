<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        return Category::orderBy('name')->get();
    }

    public function products($id)
    {
        $category = Category::with('products.categories')->findOrFail($id);

        return $category->products;
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|min:2',
        ]);

        $category = Category::create($data);

        return response()->json($category, 201);
    }

    public function update(Request $request, Category $category)
    {
        $data = $request->validate([
            'name' => 'required|string|min:2',
        ]);

        $category->update($data);

        return response()->json($category);
    }

    public function destroy(Category $category)
    {
        $category->delete();

        return response()->json(['message' => 'Categorie supprimee']);
    }
}
