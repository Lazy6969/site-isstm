<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;

/**
 * Same e-mail as Laravel's default ResetPassword notification, just queued —
 * real SMTP delivery measured several seconds in this app's environment,
 * which made every request that triggers it (account creation, admin
 * decisions) look frozen when sent inline. Requires a queue worker
 * (`php artisan queue:work`) to actually be running for delivery to happen.
 */
class QueuedResetPassword extends ResetPassword implements ShouldQueue
{
    use Queueable;
}
