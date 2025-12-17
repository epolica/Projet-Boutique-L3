<?php

use Illuminate\Support\Facades\Route;

 Route::middleware('api')->post('/test', [TodoController::class,"jsp"]); 