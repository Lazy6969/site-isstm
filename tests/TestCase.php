<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * RefreshDatabase only keeps an in-memory SQLite connection alive across tests for
     * connections listed here — without it, the separate "bibliotheque" connection would
     * reconnect to a brand new, empty :memory: database on every single test.
     *
     * @var array<int, string>
     */
    protected $connectionsToTransact = ['sqlite', 'bibliotheque'];
}
