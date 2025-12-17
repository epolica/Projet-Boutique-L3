<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'total' => 'required|numeric|min:0',
        ]);

        $user = auth('api')->user();

        $order = Order::create([
            'user_id' => $user->id,
            'total' => $data['total'],
            'status' => 'pending',
        ]);

        foreach ($data['items'] as $item) {
            $order->items()->create($item);
        }

        return response()->json($order->load('items.product'), 201);
    }

    public function myOrders()
    {
        return Order::with(['items.product', 'user'])
            ->where('user_id', auth('api')->id())
            ->latest()
            ->get();
    }

    public function index()
    {
        return Order::with(['items.product', 'user'])->latest()->get();
    }

    //les méthodes index et myOrders chargent  user et items.product, ce qui fournit les infos client au front.
}
