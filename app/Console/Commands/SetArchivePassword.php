<?php

namespace App\Console\Commands;

use App\ArchiveVault;
use Illuminate\Console\Command;

class SetArchivePassword extends Command
{
    protected $signature = 'archives:set-password {password? : The new archive key (asked interactively when omitted)}';

    protected $description = 'Sets (or replaces) the key protecting the action archive and turns protection on';

    public function handle(ArchiveVault $vault): int
    {
        $password = $this->argument('password') ?? $this->secret('New archive key');

        if (! is_string($password) || mb_strlen($password) < 8) {
            $this->error('The key must be at least 8 characters long.');

            return self::FAILURE;
        }

        $vault->setKey($password);
        $vault->setProtected(true);

        $this->info('Archive key saved (stored hashed); protection is on.');

        return self::SUCCESS;
    }
}
