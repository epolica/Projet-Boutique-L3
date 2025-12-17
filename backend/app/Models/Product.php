<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'title',
        'description',
        'price',
        'stock',
        'image',
        'category_id',
    ];

    protected $with = ['categories']; // Charge les categories associees pour simplifier les reponses API.

    public function categories()
    {
        return $this->belongsToMany(Category::class);
    }
}
