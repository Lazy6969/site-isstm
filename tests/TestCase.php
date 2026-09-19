<?php

namespace Tests;

use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * Spatie roles/permissions are reference data every test relies on
     * (factories assign roles), not per-test fixtures — seed them once
     * per RefreshDatabase migration instead of per test.
     */
    protected $seed = true;

    protected $seeder = RolePermissionSeeder::class;
}
