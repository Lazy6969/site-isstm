<?php

namespace App\Exceptions;

use RuntimeException;

/**
 * A matériel action that makes no sense from the equipment's current statut
 * (e.g. lending something that is under repair). The message is written for
 * the person using the screen.
 */
class MaterielException extends RuntimeException {}
