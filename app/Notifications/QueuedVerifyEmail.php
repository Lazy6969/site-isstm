<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;

/**
 * Same e-mail as Laravel's default VerifyEmail notification, just queued —
 * see QueuedResetPassword for why. Requires a queue worker
 * (`php artisan queue:work`) to actually be running for delivery to happen.
 */
class QueuedVerifyEmail extends VerifyEmail implements ShouldQueue
{
    use Queueable;
}
